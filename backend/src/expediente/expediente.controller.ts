import {
  Controller, Get, Post, Delete, Patch, Param, Body,
  ParseIntPipe, UseGuards, UseInterceptors,
  UploadedFile, Request, BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ExpedienteService } from './expediente.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { TipoDocumento } from '@prisma/client';

@ApiTags('Expediente')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expediente')
export class ExpedienteController {
  constructor(private readonly expedienteService: ExpedienteService) {}

  @Post('subir')
  @ApiOperation({ summary: 'Subir documento al expediente de un empleado' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        empleadoId: { type: 'number', example: 1 },
        tipoDocumento: { type: 'string', enum: Object.values(TipoDocumento), example: 'CONTRATO' },
        archivo: { type: 'string', format: 'binary' },
      },
    },
  })
  @Roles('ADMINISTRADOR', 'GESTOR_RRHH')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const nombre = `${Date.now()}${extname(file.originalname)}`;
          cb(null, nombre);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const tiposPermitidos = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
        const ext = extname(file.originalname).toLowerCase();
        if (tiposPermitidos.includes(ext)) {
          cb(null, true);
        } else {
          cb(new BadRequestException(`Tipo de archivo no permitido: ${ext}`), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  subirDocumento(
    @UploadedFile() archivo: Express.Multer.File,
    @Body('empleadoId') empleadoId: string,
    @Body('tipoDocumento') tipoDocumento: TipoDocumento,
    @Request() req: any,
  ) {
    if (!archivo) {
      throw new BadRequestException('Debe adjuntar un archivo');
    }
    return this.expedienteService.subirDocumento(
      parseInt(empleadoId),
      tipoDocumento,
      archivo,
      req.user.id,
    );
  }

  @Get('empleado/:empleadoId')
  @ApiOperation({ summary: 'Obtener documentos del expediente de un empleado' })
  obtenerDocumentos(@Param('empleadoId', ParseIntPipe) empleadoId: number) {
    return this.expedienteService.obtenerDocumentosPorEmpleado(empleadoId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un documento del expediente' })
  @Roles('ADMINISTRADOR', 'GESTOR_RRHH')
  eliminarDocumento(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.eliminarDocumento(id);
  }

  @Get('validar/:empleadoId')
  @ApiOperation({ summary: 'Validar estado del expediente (Completo/Incompleto/En Proceso)' })
  validarExpediente(@Param('empleadoId', ParseIntPipe) empleadoId: number) {
    return this.expedienteService.validarExpediente(empleadoId);
  }

  @Get('configuracion')
  @ApiOperation({ summary: 'Obtener configuración de documentos requeridos' })
  obtenerConfiguracion() {
    return this.expedienteService.obtenerConfiguracion();
  }

  @Patch('configuracion/:id')
  @ApiOperation({ summary: 'Actualizar si un documento es obligatorio o no' })
  @Roles('ADMINISTRADOR')
  actualizarConfiguracion(
    @Param('id', ParseIntPipe) id: number,
    @Body('esObligatorio') esObligatorio: boolean,
  ) {
    return this.expedienteService.actualizarConfiguracion(id, esObligatorio);
  }
}