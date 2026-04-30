import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TipoDocumento } from '@prisma/client';

@Injectable()
export class ExpedienteService {
  constructor(private prisma: PrismaService) {}

  async subirDocumento(
    empleadoId: number,
    tipoDocumento: TipoDocumento,
    archivo: Express.Multer.File,
    usuarioId: number,
  ) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: empleadoId },
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${empleadoId} no encontrado`);
    }

    return this.prisma.documento.create({
      data: {
        empleadoId,
        tipoDocumento,
        nombreOriginal: archivo.originalname,
        rutaArchivo: `/uploads/${archivo.filename}`,
        subidoPorUsuarioId: usuarioId,
      },
    });
  }

  async obtenerDocumentosPorEmpleado(empleadoId: number) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: empleadoId },
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${empleadoId} no encontrado`);
    }

    return this.prisma.documento.findMany({
      where: { empleadoId },
      orderBy: { fechaCarga: 'desc' },
    });
  }

  async eliminarDocumento(id: number) {
    const documento = await this.prisma.documento.findUnique({
      where: { id },
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    return this.prisma.documento.delete({
      where: { id },
    });
  }

  async validarExpediente(empleadoId: number) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: empleadoId },
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${empleadoId} no encontrado`);
    }

    const documentosRequeridos = await this.prisma.documentoRequerido.findMany({
      where: { esObligatorio: true },
    });

    const documentosEmpleado = await this.prisma.documento.findMany({
      where: { empleadoId },
    });

    const tiposSubidos = documentosEmpleado.map((d) => d.tipoDocumento);
    const tiposRequeridos = documentosRequeridos.map((d) => d.tipoDocumento);

    const faltantes = tiposRequeridos.filter((tipo) => !tiposSubidos.includes(tipo));
    const completados = tiposRequeridos.filter((tipo) => tiposSubidos.includes(tipo));

    let estado: string;
    if (faltantes.length === 0) {
      estado = 'COMPLETO';
    } else if (completados.length === 0) {
      estado = 'INCOMPLETO';
    } else {
      estado = 'EN_PROCESO';
    }

    return {
      empleadoId,
      empleado: `${empleado.nombres} ${empleado.apellidos}`,
      estado,
      totalRequeridos: tiposRequeridos.length,
      totalCompletados: completados.length,
      totalFaltantes: faltantes.length,
      documentosCompletados: completados,
      documentosFaltantes: faltantes,
      documentosSubidos: documentosEmpleado,
    };
  }

  async obtenerConfiguracion() {
    return this.prisma.documentoRequerido.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async actualizarConfiguracion(id: number, esObligatorio: boolean) {
    const config = await this.prisma.documentoRequerido.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`Configuración con ID ${id} no encontrada`);
    }

    return this.prisma.documentoRequerido.update({
      where: { id },
      data: { esObligatorio },
    });
  }
}