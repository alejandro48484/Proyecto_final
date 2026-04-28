import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { TipoDocumento } from '@prisma/client';

export class SubirDocumentoDto {
  @ApiProperty({ example: 1, description: 'ID del empleado' })
  @IsNumber()
  empleadoId: number;

  @ApiProperty({ enum: TipoDocumento, example: 'CONTRATO' })
  @IsEnum(TipoDocumento)
  tipoDocumento: TipoDocumento;
}