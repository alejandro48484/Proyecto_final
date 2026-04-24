import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AjusteNominaDto {
  @ApiProperty({ example: 1, description: 'ID del detalle de nómina' })
  @IsNumber()
  detalleNominaId: number;

  @ApiProperty({ example: 'bonificaciones', description: 'Campo a modificar' })
  @IsString()
  @IsNotEmpty()
  campo: string;

  @ApiProperty({ example: 500.00 })
  @IsNumber()
  valorNuevo: number;

  @ApiProperty({ example: 'Bonificación por desempeño trimestral', required: false })
  @IsString()
  @IsOptional()
  motivo?: string;
}