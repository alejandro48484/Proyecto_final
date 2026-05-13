import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsDateString } from 'class-validator';
import { TipoPeriodo } from '@prisma/client';

export class CrearPeriodoDto {
  @ApiProperty({ enum: TipoPeriodo, example: 'MENSUAL' })
  @IsEnum(TipoPeriodo, { message: 'El tipo de período debe ser MENSUAL o QUINCENAL' })
  tipoPeriodo: TipoPeriodo;

  @ApiProperty({ example: '2026-05-01' })
  @IsDateString({}, { message: 'La fecha de inicio debe tener formato válido (YYYY-MM-DD)' })
  fechaInicio: string;

  @ApiProperty({ example: '2026-05-31' })
  @IsDateString({}, { message: 'La fecha fin debe tener formato válido (YYYY-MM-DD)' })
  fechaFin: string;
}