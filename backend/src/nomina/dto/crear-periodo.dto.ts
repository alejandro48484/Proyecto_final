import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsDateString } from 'class-validator';
import { TipoPeriodo } from '@prisma/client';

export class CrearPeriodoDto {
  @ApiProperty({ enum: TipoPeriodo, example: 'MENSUAL' })
  @IsEnum(TipoPeriodo)
  tipoPeriodo: TipoPeriodo;

  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({ example: '2026-05-31' })
  @IsDateString()
  fechaFin: string;
}