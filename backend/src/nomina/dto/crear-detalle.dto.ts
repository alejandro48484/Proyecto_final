import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional } from 'class-validator';

export class CrearDetalleDto {
  @ApiProperty({ example: 1 })
  @IsNumber({}, { message: 'El ID del período debe ser un número válido' })
  @Min(1, { message: 'Debe seleccionar un período válido' })
  periodoNominaId: number;

  @ApiProperty({ example: 1 })
  @IsNumber({}, { message: 'El ID del empleado debe ser un número válido' })
  @Min(1, { message: 'Debe seleccionar un empleado válido' })
  empleadoId: number;

  @ApiProperty({ example: 500.00, required: false })
  @IsNumber({}, { message: 'Las horas extra deben ser un número válido' })
  @Min(0, { message: 'Las horas extra no pueden ser negativas' })
  @IsOptional()
  horasExtra?: number;

  @ApiProperty({ example: 250.00, required: false })
  @IsNumber({}, { message: 'Las bonificaciones deben ser un número válido' })
  @Min(0, { message: 'Las bonificaciones no pueden ser negativas' })
  @IsOptional()
  bonificaciones?: number;

  @ApiProperty({ example: 0, required: false })
  @IsNumber({}, { message: 'Las deducciones deben ser un número válido' })
  @Min(0, { message: 'Las deducciones no pueden ser negativas' })
  @IsOptional()
  deducciones?: number;
}