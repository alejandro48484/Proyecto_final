import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@ApiTags('Reportes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('nomina/:periodoId')
  @ApiOperation({ summary: 'Reporte de nómina por período con desglose de conceptos' })
  @Roles('ADMINISTRADOR', 'GESTOR_RRHH')
  reporteNomina(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.reportesService.reporteNomina(periodoId);
  }

  @Get('expedientes')
  @ApiOperation({ summary: 'Estado de expedientes por departamento (completos/incompletos)' })
  @Roles('ADMINISTRADOR', 'GESTOR_RRHH')
  reporteExpedientes() {
    return this.reportesService.reporteExpedientes();
  }

  @Get('academico')
  @ApiOperation({ summary: 'Información académica consolidada del personal' })
  @Roles('ADMINISTRADOR', 'GESTOR_RRHH')
  reporteAcademico() {
    return this.reportesService.reporteAcademico();
  }

  @Get('cumplimiento')
  @ApiOperation({ summary: 'Cumplimiento de requisitos de contratación' })
  @Roles('ADMINISTRADOR', 'GESTOR_RRHH')
  reporteCumplimiento() {
    return this.reportesService.reporteCumplimiento();
  }
}