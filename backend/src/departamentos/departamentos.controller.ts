import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DepartamentosService } from './departamentos.service';
import { CrearDepartamentoDto } from './dto/crear-departamento.dto';
import { ActualizarDepartamentoDto } from './dto/actualizar-departamento.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@ApiTags('Departamentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departamentos')
export class DepartamentosController {
  constructor(private readonly departamentosService: DepartamentosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un departamento' })
  @Roles('ADMINISTRADOR')
  crear(@Body() dto: CrearDepartamentoDto) {
    return this.departamentosService.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los departamentos' })
  obtenerTodos() {
    return this.departamentosService.obtenerTodos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener departamento por ID' })
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.departamentosService.obtenerPorId(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar departamento' })
  @Roles('ADMINISTRADOR')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarDepartamentoDto) {
    return this.departamentosService.actualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar departamento' })
  @Roles('ADMINISTRADOR')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.departamentosService.eliminar(id);
  }
}