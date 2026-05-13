import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, IsOptional, Min, IsIn } from 'class-validator';

export class AjusteNominaDto {
  @ApiProperty({ example: 1 })
  @IsNumber({}, { message: 'El ID del detalle debe ser un número válido' })
  @Min(1, { message: 'Debe seleccionar un detalle válido' })
  detalleNominaId: number;

  @ApiProperty({ example: 'bonificaciones' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['horasExtra', 'bonificaciones', 'deducciones'], { message: 'El campo debe ser: horasExtra, bonificaciones o deducciones' })
  campo: string;

  @ApiProperty({ example: 500.00 })
  @IsNumber({}, { message: 'El valor nuevo debe ser un número válido' })
  @Min(0, { message: 'El valor no puede ser negativo' })
  valorNuevo: number;

  @ApiProperty({ example: 'Bonificación por desempeño', required: false })
  @IsString()
  @IsOptional()
  motivo?: string;
}