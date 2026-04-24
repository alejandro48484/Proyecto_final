import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NominaService } from './nomina.service';
import { CrearPeriodoDto } from './dto/crear-periodo.dto';
import { CrearDetalleDto } from './dto/crear-detalle.dto';
import { AjusteNominaDto } from './dto/ajuste-nomina.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@ApiTags('Nómina')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nomina')
export class NominaController {
  constructor(private readonly nominaService: NominaService) {}

  @Post('periodos')
  @ApiOperation({ summary: 'Crear un período de nómina' })
  @Roles('ADMINISTRADOR', 'GESTOR_RRHH')
  crearPeriodo(@Body() dto: CrearPeriodoDto) {
    return this.nominaService.crearPeriodo(dto);
  }

  @Get('periodos')
  @ApiOperation({ summary: 'Obtener todos los períodos de nómina' })
  obtenerPeriodos() {
    return this.nominaService.obtenerPeriodos();
  }

  @Get('periodos/:id')
  @ApiOperation({ summary: 'Obtener período por ID con detalles' })
  obtenerPeriodoPorId(@Param('id', ParseIntPipe) id: number) {
    return this.nominaService.obtenerPeriodoPorId(id);
  }

  @Patch('periodos/:id/cerrar')
  @ApiOperation({ summary: 'Cerrar un período de nómina' })
  @Roles('ADMINISTRADOR')
  cerrarPeriodo(@Param('id', ParseIntPipe) id: number) {
    return this.nominaService.cerrarPeriodo(id);
  }

  @Post('detalles')
  @ApiOperation({ summary: 'Agregar detalle de nómina a un empleado' })
  @Roles('ADMINISTRADOR', 'GESTOR_RRHH')
  agregarDetalle(@Body() dto: CrearDetalleDto) {
    return this.nominaService.agregarDetalle(dto);
  }

  @Patch('detalles/:id/recalcular')
  @ApiOperation({ summary: 'Recalcular un detalle de nómina' })
  @Roles('ADMINISTRADOR', 'GESTOR_RRHH')
  recalcularDetalle(@Param('id', ParseIntPipe) id: number) {
    return this.nominaService.recalcularDetalle(id);
  }

  @Post('ajustes')
  @ApiOperation({ summary: 'Realizar un ajuste manual a la nómina' })
  @Roles('ADMINISTRADOR', 'GESTOR_RRHH')
  realizarAjuste(@Body() dto: AjusteNominaDto, @Request() req: any) {
    return this.nominaService.realizarAjuste(dto, req.user.id);
  }

  @Get('ajustes/:detalleId')
  @ApiOperation({ summary: 'Obtener historial de ajustes de un detalle' })
  obtenerAjustes(@Param('detalleId', ParseIntPipe) detalleId: number) {
    return this.nominaService.obtenerAjustes(detalleId);
  }
}