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
    if (new Date(dto.fechaFin) < new Date(dto.fechaInicio)) {
      throw new BadRequestException('La fecha fin no puede ser anterior a la fecha inicio');
    }

    return this.prisma.periodoNomina.create({
      data: {
        tipoPeriodo: dto.tipoPeriodo,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: new Date(dto.fechaFin),
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

    const salarioBase = Number(empleado.salarioBase);
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