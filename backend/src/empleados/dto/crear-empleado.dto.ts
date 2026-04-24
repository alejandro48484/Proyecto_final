import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsNumber, IsEnum, IsDateString, Length, Min } from 'class-validator';
import { EstadoLaboral } from '@prisma/client';

export class CrearEmpleadoDto {
  @ApiProperty({ example: 'Carlos Roberto' })
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @ApiProperty({ example: 'Hernandez Morales' })
  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @ApiProperty({ example: '1990-07-22' })
  @IsDateString()
  fechaNacimiento: string;

  @ApiProperty({ example: '8a Calle 4-15 Zona 10, Guatemala', required: false })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiProperty({ example: '50212345679', required: false })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({ example: 'carlos.hernandez@empresa.gt', required: false })
  @IsEmail()
  @IsOptional()
  correo?: string;

  @ApiProperty({ example: '2501123450101', description: 'DPI de 13 dígitos' })
  @IsString()
  @IsNotEmpty()
  @Length(13, 13, { message: 'El DPI debe tener exactamente 13 dígitos' })
  numeroDpi: string;

  @ApiProperty({ example: 8000.00 })
  @IsNumber()
  @Min(0)
  salarioBase: number;

  @ApiProperty({ example: 'Desarrollador Junior' })
  @IsString()
  @IsNotEmpty()
  cargo: string;

  @ApiProperty({ example: 1, description: 'ID del departamento' })
  @IsNumber()
  departamentoId: number;

  @ApiProperty({ enum: EstadoLaboral, example: 'ACTIVO', required: false })
  @IsEnum(EstadoLaboral)
  @IsOptional()
  estadoLaboral?: EstadoLaboral;
}