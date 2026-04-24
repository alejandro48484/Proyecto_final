import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearDepartamentoDto } from './dto/crear-departamento.dto';
import { ActualizarDepartamentoDto } from './dto/actualizar-departamento.dto';

@Injectable()
export class DepartamentosService {
  constructor(private prisma: PrismaService) {}

  async crear(dto: CrearDepartamentoDto) {
    const existente = await this.prisma.departamento.findUnique({
      where: { nombre: dto.nombre },
    });

    if (existente) {
      throw new ConflictException('Ya existe un departamento con ese nombre');
    }

    return this.prisma.departamento.create({
      data: dto,
    });
  }

  async obtenerTodos() {
    return this.prisma.departamento.findMany({
      include: { empleados: true },
      orderBy: { id: 'asc' },
    });
  }

  async obtenerPorId(id: number) {
    const departamento = await this.prisma.departamento.findUnique({
      where: { id },
      include: { empleados: true },
    });

    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }

    return departamento;
  }

  async actualizar(id: number, dto: ActualizarDepartamentoDto) {
    await this.obtenerPorId(id);

    if (dto.nombre) {
      const existente = await this.prisma.departamento.findFirst({
        where: { nombre: dto.nombre, NOT: { id } },
      });
      if (existente) {
        throw new ConflictException('Ya existe otro departamento con ese nombre');
      }
    }

    return this.prisma.departamento.update({
      where: { id },
      data: dto,
    });
  }

  async eliminar(id: number) {
    const departamento = await this.obtenerPorId(id);

    if (departamento.empleados.length > 0) {
      throw new ConflictException('No se puede eliminar un departamento que tiene empleados asignados');
    }

    return this.prisma.departamento.delete({
      where: { id },
    });
  }
}