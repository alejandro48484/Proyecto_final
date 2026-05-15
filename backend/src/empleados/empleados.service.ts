import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearEmpleadoDto } from './dto/crear-empleado.dto';
import { ActualizarEmpleadoDto } from './dto/actualizar-empleado.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';

@Injectable()
export class EmpleadosService {
  constructor(private prisma: PrismaService) {}

  private async registrarAuditoria(
    usuarioId: number,
    accion: 'CREAR' | 'ACTUALIZAR' | 'ELIMINAR',
    entidadId: number,
    cambios?: any,
  ) {
    try {
      await this.prisma.registroAuditoria.create({
        data: {
          usuarioId,
          accion,
          entidad: 'empleado',
          entidadId,
          cambios,
        },
      });
    } catch {
    }
  }

  async crear(dto: CrearEmpleadoDto, usuarioId?: number) {
    const existente = await this.prisma.empleado.findUnique({
      where: { numeroDpi: dto.numeroDpi },
    });

    if (existente) {
      throw new ConflictException('Ya existe un empleado con ese DPI');
    }

    const empleado = await this.prisma.empleado.create({
      data: {
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        fechaNacimiento: new Date(dto.fechaNacimiento),
        direccion: dto.direccion,
        telefono: dto.telefono,
        correo: dto.correo,
        numeroDpi: dto.numeroDpi,
        salarioBase: dto.salarioBase,
        cargo: dto.cargo,
        departamentoId: dto.departamentoId,
        estadoLaboral: dto.estadoLaboral || 'ACTIVO',
      },
      include: { departamento: true },
    });

    if (usuarioId) {
      await this.registrarAuditoria(usuarioId, 'CREAR', empleado.id, { empleado: dto });
    }

    return empleado;
  }

  async obtenerTodos() {
    return this.prisma.empleado.findMany({
      include: { departamento: true },
      orderBy: { id: 'asc' },
    });
  }

  async obtenerPorId(id: number) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id },
      include: {
        departamento: true,
        informacionAcademica: true,
        documentos: true,
      },
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    return empleado;
  }

  async actualizar(id: number, dto: ActualizarEmpleadoDto, usuarioId?: number) {
    const anterior = await this.obtenerPorId(id);

    if (dto.numeroDpi) {
      const existente = await this.prisma.empleado.findFirst({
        where: { numeroDpi: dto.numeroDpi, NOT: { id } },
      });
      if (existente) {
        throw new ConflictException('Ya existe otro empleado con ese DPI');
      }
    }

    const empleado = await this.prisma.empleado.update({
      where: { id },
      data: {
        ...dto,
        fechaNacimiento: dto.fechaNacimiento ? new Date(dto.fechaNacimiento) : undefined,
      },
      include: { departamento: true },
    });

    if (usuarioId) {
      await this.registrarAuditoria(usuarioId, 'ACTUALIZAR', id, {
        anterior: { nombres: anterior.nombres, apellidos: anterior.apellidos, cargo: anterior.cargo, salarioBase: anterior.salarioBase },
        nuevo: dto,
      });
    }

    return empleado;
  }

  async eliminar(id: number, usuarioId?: number) {
    const empleado = await this.obtenerPorId(id);

    if (usuarioId) {
      await this.registrarAuditoria(usuarioId, 'ELIMINAR', id, {
        empleadoEliminado: { nombres: empleado.nombres, apellidos: empleado.apellidos, numeroDpi: empleado.numeroDpi },
      });
    }

    return this.prisma.empleado.delete({
      where: { id },
    });
  }

  async cambiarEstado(id: number, dto: CambiarEstadoDto, usuarioId?: number) {
    const anterior = await this.obtenerPorId(id);

    const empleado = await this.prisma.empleado.update({
      where: { id },
      data: { estadoLaboral: dto.estadoLaboral },
      include: { departamento: true },
    });

    if (usuarioId) {
      await this.registrarAuditoria(usuarioId, 'ACTUALIZAR', id, {
        cambioEstado: { anterior: anterior.estadoLaboral, nuevo: dto.estadoLaboral },
      });
    }

    return empleado;
  }
}