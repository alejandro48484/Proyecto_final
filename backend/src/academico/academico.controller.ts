import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AcademicoService } from './academico.service';
import { CrearAcademicoDto } from './dto/crear-academico.dto';
import { ActualizarAcademicoDto } from './dto/actualizar-academico.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@ApiTags('Académico')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academico')
export class AcademicoController {
  constructor(private readonly academicoService: AcademicoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear registro académico' })
  @Roles('ADMINISTRADOR', 'GESTOR_RRHH')
  crear(@Body() dto: CrearAcademicoDto) {
    return this.academicoService.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los registros académicos' })
  obtenerTodos() {
    return this.academicoService.obtenerTodos();
  }

  @Get('empleado/:empleadoId')
  @ApiOperation({ summary: 'Obtener registros académicos por empleado' })
  obtenerPorEmpleado(@Param('empleadoId', ParseIntPipe) empleadoId: number) {
    return this.academicoService.obtenerPorEmpleado(empleadoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener registro académico por ID' })
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.academicoService.obtenerPorId(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar registro académico' })
  @Roles('ADMINISTRADOR', 'GESTOR_RRHH')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarAcademicoDto) {
    return this.academicoService.actualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar registro académico' })
  @Roles('ADMINISTRADOR', 'GESTOR_RRHH')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.academicoService.eliminar(id);
  }
}