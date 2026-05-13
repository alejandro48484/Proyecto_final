import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, MinLength, Min } from 'class-validator';

export class CrearAcademicoDto {
  @ApiProperty({ example: 1 })
  @IsNumber({}, { message: 'El ID del empleado debe ser un número válido' })
  @Min(1, { message: 'Debe seleccionar un empleado válido' })
  empleadoId: number;

  @ApiProperty({ example: 'Ingeniería en Sistemas de Información' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'El título académico debe tener al menos 3 caracteres' })
  tituloAcademico: string;

  @ApiProperty({ example: 'AWS Certified', required: false })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'La certificación debe tener al menos 2 caracteres' })
  certificacion?: string;

  @ApiProperty({ example: 'Universidad Mariano Gálvez' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'La institución educativa debe tener al menos 3 caracteres' })
  institucionEducativa: string;

  @ApiProperty({ example: '2020-11-15', required: false })
  @IsDateString({}, { message: 'La fecha de graduación debe tener formato válido' })
  @IsOptional()
  fechaGraduacion?: string;
}