import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearAcademicoDto } from './dto/crear-academico.dto';
import { ActualizarAcademicoDto } from './dto/actualizar-academico.dto';

@Injectable()
export class AcademicoService {
  constructor(private prisma: PrismaService) {}

  async crear(dto: CrearAcademicoDto) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: dto.empleadoId },
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${dto.empleadoId} no encontrado`);
    }

    return this.prisma.informacionAcademica.create({
      data: {
        empleadoId: dto.empleadoId,
        tituloAcademico: dto.tituloAcademico,
        certificacion: dto.certificacion,
        institucionEducativa: dto.institucionEducativa,
        fechaGraduacion: dto.fechaGraduacion ? new Date(dto.fechaGraduacion) : null,
      },
    });
  }

  async obtenerTodos() {
    return this.prisma.informacionAcademica.findMany({
      include: { empleado: true },
      orderBy: { id: 'asc' },
    });
  }

  async obtenerPorEmpleado(empleadoId: number) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: empleadoId },
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${empleadoId} no encontrado`);
    }

    return this.prisma.informacionAcademica.findMany({
      where: { empleadoId },
      orderBy: { id: 'asc' },
    });
  }

  async obtenerPorId(id: number) {
    const registro = await this.prisma.informacionAcademica.findUnique({
      where: { id },
      include: { empleado: true },
    });

    if (!registro) {
      throw new NotFoundException(`Registro académico con ID ${id} no encontrado`);
    }

    return registro;
  }

  async actualizar(id: number, dto: ActualizarAcademicoDto) {
    await this.obtenerPorId(id);

    return this.prisma.informacionAcademica.update({
      where: { id },
      data: {
        ...dto,
        fechaGraduacion: dto.fechaGraduacion ? new Date(dto.fechaGraduacion) : undefined,
      },
    });
  }

  async eliminar(id: number) {
    await this.obtenerPorId(id);

    return this.prisma.informacionAcademica.delete({
      where: { id },
    });
  }
}