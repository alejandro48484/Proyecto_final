import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EstadoLaboral } from '@prisma/client';

export class CambiarEstadoDto {
  @ApiProperty({ enum: EstadoLaboral, example: 'SUSPENDIDO' })
  @IsEnum(EstadoLaboral)
  estadoLaboral: EstadoLaboral;
}