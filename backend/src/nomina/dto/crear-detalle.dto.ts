import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional } from 'class-validator';

export class CrearDetalleDto {
  @ApiProperty({ example: 1, description: 'ID del período de nómina' })
  @IsNumber()
  periodoNominaId: number;

  @ApiProperty({ example: 1, description: 'ID del empleado' })
  @IsNumber()
  empleadoId: number;

  @ApiProperty({ example: 500.00, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  horasExtra?: number;

  @ApiProperty({ example: 250.00, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  bonificaciones?: number;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  deducciones?: number;
}