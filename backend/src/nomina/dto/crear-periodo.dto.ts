import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, Min, Max } from 'class-validator';
import { TipoPeriodo } from '@prisma/client';

export class CrearPeriodoDto {
  @ApiProperty({ enum: TipoPeriodo, example: 'MENSUAL' })
  @IsEnum(TipoPeriodo, { message: 'El tipo de período debe ser MENSUAL o QUINCENAL' })
  tipoPeriodo: TipoPeriodo;

  @ApiProperty({ example: 5, description: 'Número del mes (1-12)' })
  @IsInt({ message: 'El mes debe ser un número entero' })
  @Min(1, { message: 'El mes debe ser entre 1 y 12' })
  @Max(12, { message: 'El mes debe ser entre 1 y 12' })
  mes: number;

  @ApiProperty({ example: 2026, description: 'Año del período' })
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(2020, { message: 'El año debe ser mayor a 2020' })
  anio: number;

  @ApiProperty({ example: 1, description: 'Quincena (1 o 2), solo para períodos quincenales', required: false })
  @IsInt({ message: 'La quincena debe ser 1 o 2' })
  @Min(1, { message: 'La quincena debe ser 1 o 2' })
  @Max(2, { message: 'La quincena debe ser 1 o 2' })
  quincena?: number;
}