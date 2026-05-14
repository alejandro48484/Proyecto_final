import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let mensaje = 'Error interno del servidor. Por favor intente de nuevo.';
    let errores: string[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const respuesta = exception.getResponse();

      if (typeof respuesta === 'string') {
        mensaje = respuesta;
      } else if (typeof respuesta === 'object') {
        const resp = respuesta as any;
        mensaje = resp.message || mensaje;
        if (Array.isArray(resp.message)) {
          errores = resp.message;
          mensaje = 'Error de validación en los datos enviados';
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Error inesperado: ${exception.message}`, exception.stack);
      mensaje = 'Ocurrió un error inesperado. Por favor contacte al administrador.';
    }

    const mensajesAmigables: Record<number, string> = {
      400: mensaje || 'Los datos enviados no son válidos',
      401: 'No está autenticado. Por favor inicie sesión',
      403: 'No tiene permisos para realizar esta acción',
      404: mensaje || 'El recurso solicitado no fue encontrado',
      409: mensaje || 'Ya existe un registro con esos datos',
      500: 'Error interno del servidor. Por favor intente de nuevo',
    };

    response.status(status).json({
      exitoso: false,
      statusCode: status,
      mensaje: mensajesAmigables[status] || mensaje,
      errores: errores.length > 0 ? errores : undefined,
      ruta: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}