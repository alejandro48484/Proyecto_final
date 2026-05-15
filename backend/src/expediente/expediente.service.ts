import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { TipoDocumento } from '@prisma/client';
import { extname } from 'path';
import * as CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.JWT_SECRET || 'clave-encriptacion-documentos-2026';

@Injectable()
export class ExpedienteService {
constructor(
  private prisma: PrismaService,
  private supabaseService: SupabaseService,
) {}

  desencriptarRuta(rutaEncriptada: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(rutaEncriptada, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return rutaEncriptada;
    }
  }

 async subirDocumento(
  empleadoId: number,
  tipoDocumento: TipoDocumento,
  archivo: Express.Multer.File,
  usuarioId: number,
) {
  const tiposPermitidos = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
  const ext = extname(archivo.originalname).toLowerCase();
  if (!tiposPermitidos.includes(ext)) {
    throw new BadRequestException(
      'Tipo de archivo no permitido. Solo se aceptan: PDF, Word (DOC, DOCX) e imágenes (JPG, JPEG, PNG)'
    );
  }

  const empleado = await this.prisma.empleado.findUnique({
    where: { id: empleadoId },
  });

  if (!empleado) {
    throw new NotFoundException(`Empleado con ID ${empleadoId} no encontrado`);
  }

  const nombreArchivo = `${Date.now()}_${archivo.originalname.replace(/\s/g, '_')}`;
  const rutaStorage = `expedientes/${empleadoId}/${nombreArchivo}`;

  const urlPublica = await this.supabaseService.subirArchivo(
    'documentos',
    rutaStorage,
    archivo.buffer,
    archivo.mimetype,
  );

  const rutaEncriptada = CryptoJS.AES.encrypt(urlPublica, ENCRYPTION_KEY).toString();

  return this.prisma.documento.create({
    data: {
      empleadoId,
      tipoDocumento,
      nombreOriginal: archivo.originalname,
      rutaArchivo: rutaEncriptada,
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

    const documentos = await this.prisma.documento.findMany({
      where: { empleadoId },
      orderBy: { fechaCarga: 'desc' },
    });

    return documentos.map((doc) => ({
      ...doc,
      rutaArchivo: this.desencriptarRuta(doc.rutaArchivo),
    }));
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
      documentosSubidos: documentosEmpleado.map((doc) => ({
        ...doc,
        rutaArchivo: this.desencriptarRuta(doc.rutaArchivo),
      })),
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