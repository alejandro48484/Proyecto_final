import { Controller, Get, Post, Put, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmpleadosService } from './empleados.service';
import { CrearEmpleadoDto } from './dto/crear-empleado.dto';
import { ActualizarEmpleadoDto } from './dto/actualizar-empleado.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@ApiTags('Empleados')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo empleado' })
  @Roles('ADMINISTRADOR', 'GESTOR_RRHH')
  crear(@Body() dto: CrearEmpleadoDto) {
    return this.empleadosService.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los empleados' })
  obtenerTodos() {
    return this.empleadosService.obtenerTodos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un empleado por ID' })
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.obtenerPorId(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un empleado' })
  @Roles('ADMINISTRADOR', 'GESTOR_RRHH')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarEmpleadoDto) {
    return this.empleadosService.actualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un empleado' })
  @Roles('ADMINISTRADOR')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.eliminar(id);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado laboral de un empleado' })
  @Roles('ADMINISTRADOR', 'GESTOR_RRHH')
  cambiarEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarEstadoDto) {
    return this.empleadosService.cambiarEstado(id, dto);
  }
}