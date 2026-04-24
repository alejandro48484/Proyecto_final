import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CrearAcademicoDto {
  @ApiProperty({ example: 1, description: 'ID del empleado' })
  @IsNumber()
  empleadoId: number;

  @ApiProperty({ example: 'Ingeniería en Sistemas de Información' })
  @IsString()
  @IsNotEmpty()
  tituloAcademico: string;

  @ApiProperty({ example: 'AWS Certified Solutions Architect', required: false })
  @IsString()
  @IsOptional()
  certificacion?: string;

  @ApiProperty({ example: 'Universidad Mariano Gálvez' })
  @IsString()
  @IsNotEmpty()
  institucionEducativa: string;

  @ApiProperty({ example: '2020-11-15', required: false })
  @IsDateString()
  @IsOptional()
  fechaGraduacion?: string;
}