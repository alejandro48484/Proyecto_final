import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearEmpleadoDto } from './dto/crear-empleado.dto';
import { ActualizarEmpleadoDto } from './dto/actualizar-empleado.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';

@Injectable()
export class EmpleadosService {
  constructor(private prisma: PrismaService) {}

  async crear(dto: CrearEmpleadoDto) {
    const existente = await this.prisma.empleado.findUnique({
      where: { numeroDpi: dto.numeroDpi },
    });

    if (existente) {
      throw new ConflictException('Ya existe un empleado con ese DPI');
    }

    return this.prisma.empleado.create({
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

  async actualizar(id: number, dto: ActualizarEmpleadoDto) {
    await this.obtenerPorId(id);

    if (dto.numeroDpi) {
      const existente = await this.prisma.empleado.findFirst({
        where: { numeroDpi: dto.numeroDpi, NOT: { id } },
      });
      if (existente) {
        throw new ConflictException('Ya existe otro empleado con ese DPI');
      }
    }

    return this.prisma.empleado.update({
      where: { id },
      data: {
        ...dto,
        fechaNacimiento: dto.fechaNacimiento ? new Date(dto.fechaNacimiento) : undefined,
      },
      include: { departamento: true },
    });
  }

  async eliminar(id: number) {
    await this.obtenerPorId(id);

    return this.prisma.empleado.delete({
      where: { id },
    });
  }

  async cambiarEstado(id: number, dto: CambiarEstadoDto) {
    await this.obtenerPorId(id);

    return this.prisma.empleado.update({
      where: { id },
      data: { estadoLaboral: dto.estadoLaboral },
      include: { departamento: true },
    });
  }
}