import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearPeriodoDto } from './dto/crear-periodo.dto';
import { CrearDetalleDto } from './dto/crear-detalle.dto';
import { AjusteNominaDto } from './dto/ajuste-nomina.dto';

@Injectable()
export class NominaService {
  constructor(private prisma: PrismaService) {}

  // ==================== PERÍODOS ====================

  async crearPeriodo(dto: CrearPeriodoDto) {
    let fechaInicio: Date;
    let fechaFin: Date;

    if (dto.tipoPeriodo === 'MENSUAL') {
      fechaInicio = new Date(dto.anio, dto.mes - 1, 1);
      fechaFin = new Date(dto.anio, dto.mes, 0);
    } else {
      if (!dto.quincena) {
        throw new BadRequestException('Debe especificar la quincena (1 o 2) para períodos quincenales');
      }
      if (dto.quincena === 1) {
        fechaInicio = new Date(dto.anio, dto.mes - 1, 1);
        fechaFin = new Date(dto.anio, dto.mes - 1, 15);
      } else {
        fechaInicio = new Date(dto.anio, dto.mes - 1, 16);
        fechaFin = new Date(dto.anio, dto.mes, 0);
      }
    }

    const periodoExistente = await this.prisma.periodoNomina.findFirst({
      where: {
        tipoPeriodo: dto.tipoPeriodo,
        fechaInicio,
        fechaFin,
      },
    });

    if (periodoExistente) {
      throw new BadRequestException('Ya existe un período de nómina para ese mes y tipo');
    }

    return this.prisma.periodoNomina.create({
      data: {
        tipoPeriodo: dto.tipoPeriodo,
        fechaInicio,
        fechaFin,
        estado: 'ABIERTO',
      },
    });
  }

  async obtenerPeriodos() {
    return this.prisma.periodoNomina.findMany({
      include: { detalles: { include: { empleado: true } } },
      orderBy: { id: 'desc' },
    });
  }

  async obtenerPeriodoPorId(id: number) {
    const periodo = await this.prisma.periodoNomina.findUnique({
      where: { id },
      include: { detalles: { include: { empleado: true, ajustes: true } } },
    });

    if (!periodo) {
      throw new NotFoundException(`Período con ID ${id} no encontrado`);
    }

    return periodo;
  }

  async cerrarPeriodo(id: number) {
    const periodo = await this.obtenerPeriodoPorId(id);

    if (periodo.estado === 'CERRADO') {
      throw new BadRequestException('Este período ya está cerrado');
    }

    return this.prisma.periodoNomina.update({
      where: { id },
      data: { estado: 'CERRADO' },
    });
  }

  // ==================== DETALLES ====================

  async agregarDetalle(dto: CrearDetalleDto) {
    const periodo = await this.prisma.periodoNomina.findUnique({
      where: { id: dto.periodoNominaId },
    });

    if (!periodo) {
      throw new NotFoundException(`Período con ID ${dto.periodoNominaId} no encontrado`);
    }

    if (periodo.estado === 'CERRADO') {
      throw new BadRequestException('No se pueden agregar detalles a un período cerrado');
    }

    const empleado = await this.prisma.empleado.findUnique({
      where: { id: dto.empleadoId },
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${dto.empleadoId} no encontrado`);
    }

    if (empleado.estadoLaboral === 'RETIRADO') {
      throw new BadRequestException('No se puede agregar a nómina un empleado con estado RETIRADO');
    }

    const existente = await this.prisma.detalleNomina.findUnique({
      where: {
        periodoNominaId_empleadoId: {
          periodoNominaId: dto.periodoNominaId,
          empleadoId: dto.empleadoId,
        },
      },
    });

    if (existente) {
      throw new BadRequestException('Este empleado ya tiene un detalle en este período');
    }

    const fechaInicioPeriodo = new Date(periodo.fechaInicio);
    const fechaFinPeriodo = new Date(periodo.fechaFin);
    const diasTotalesPeriodo = Math.ceil(
      (fechaFinPeriodo.getTime() - fechaInicioPeriodo.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    const fechaContratacion = empleado.creadoEn ? new Date(empleado.creadoEn) : fechaInicioPeriodo;
    let diasTrabajados = diasTotalesPeriodo;

    if (fechaContratacion > fechaInicioPeriodo && fechaContratacion <= fechaFinPeriodo) {
      diasTrabajados = Math.ceil(
        (fechaFinPeriodo.getTime() - fechaContratacion.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    }

    const salarioCompleto = Number(empleado.salarioBase);
    const salarioBase = diasTrabajados < diasTotalesPeriodo
      ? Math.round((salarioCompleto / diasTotalesPeriodo) * diasTrabajados * 100) / 100
      : salarioCompleto;

    const horasExtra = dto.horasExtra || 0;
    const bonificaciones = dto.bonificaciones || 0;
    const deducciones = dto.deducciones || 0;
    const igss = salarioBase * 0.0483;
    const irtra = salarioBase * 0.01;
    const salarioNeto = salarioBase + horasExtra + bonificaciones - deducciones - igss - irtra;

    return this.prisma.detalleNomina.create({
      data: {
        periodoNominaId: dto.periodoNominaId,
        empleadoId: dto.empleadoId,
        salarioBase,
        horasExtra,
        bonificaciones,
        deducciones,
        igss: Math.round(igss * 100) / 100,
        irtra: Math.round(irtra * 100) / 100,
        salarioNeto: Math.round(salarioNeto * 100) / 100,
      },
      include: { empleado: true },
    });
  }

  async recalcularDetalle(id: number) {
    const detalle = await this.prisma.detalleNomina.findUnique({
      where: { id },
      include: { periodoNomina: true },
    });

    if (!detalle) {
      throw new NotFoundException(`Detalle con ID ${id} no encontrado`);
    }

    if (detalle.periodoNomina.estado === 'CERRADO') {
      throw new BadRequestException('No se puede recalcular un detalle de período cerrado');
    }

    const salarioBase = Number(detalle.salarioBase);
    const horasExtra = Number(detalle.horasExtra);
    const bonificaciones = Number(detalle.bonificaciones);
    const deducciones = Number(detalle.deducciones);
    const igss = salarioBase * 0.0483;
    const irtra = salarioBase * 0.01;
    const salarioNeto = salarioBase + horasExtra + bonificaciones - deducciones - igss - irtra;

    return this.prisma.detalleNomina.update({
      where: { id },
      data: {
        igss: Math.round(igss * 100) / 100,
        irtra: Math.round(irtra * 100) / 100,
        salarioNeto: Math.round(salarioNeto * 100) / 100,
      },
      include: { empleado: true },
    });
  }

  // ==================== AJUSTES ====================

  async realizarAjuste(dto: AjusteNominaDto, usuarioId: number) {
    const detalle = await this.prisma.detalleNomina.findUnique({
      where: { id: dto.detalleNominaId },
      include: { periodoNomina: true },
    });

    if (!detalle) {
      throw new NotFoundException(`Detalle con ID ${dto.detalleNominaId} no encontrado`);
    }

    if (detalle.periodoNomina.estado === 'CERRADO') {
      throw new BadRequestException('No se pueden realizar ajustes en un período cerrado');
    }

    const camposPermitidos = ['horasExtra', 'bonificaciones', 'deducciones'];
    if (!camposPermitidos.includes(dto.campo)) {
      throw new BadRequestException(`Campo no válido. Campos permitidos: ${camposPermitidos.join(', ')}`);
    }

    const valorAnterior = Number(detalle[dto.campo as keyof typeof detalle]);

    await this.prisma.ajusteNomina.create({
      data: {
        detalleNominaId: dto.detalleNominaId,
        ajustadoPorUsuarioId: usuarioId,
        campo: dto.campo,
        valorAnterior,
        valorNuevo: dto.valorNuevo,
        motivo: dto.motivo,
      },
    });

    await this.prisma.detalleNomina.update({
      where: { id: dto.detalleNominaId },
      data: { [dto.campo]: dto.valorNuevo },
    });

    return this.recalcularDetalle(dto.detalleNominaId);
  }

  async obtenerAjustes(detalleId: number) {
    return this.prisma.ajusteNomina.findMany({
      where: { detalleNominaId: detalleId },
      include: { ajustadoPorUsuario: { select: { correo: true, rol: true } } },
      orderBy: { fechaAjuste: 'desc' },
    });
  }
}