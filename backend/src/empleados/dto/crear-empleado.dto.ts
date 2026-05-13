import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsNumber, IsEnum, IsDateString, Length, Min, Matches, MinLength } from 'class-validator';
import { EstadoLaboral } from '@prisma/client';

export class CrearEmpleadoDto {
  @ApiProperty({ example: 'Carlos Roberto' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombres: string;

  @ApiProperty({ example: 'Hernandez Morales' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Los apellidos deben tener al menos 2 caracteres' })
  apellidos: string;

  @ApiProperty({ example: '1990-07-22' })
  @IsDateString({}, { message: 'La fecha de nacimiento debe tener formato válido' })
  fechaNacimiento: string;

  @ApiProperty({ example: '8a Calle 4-15 Zona 10', required: false })
  @IsString()
  @IsOptional()
  @MinLength(5, { message: 'La dirección debe tener al menos 5 caracteres' })
  direccion?: string;

  @ApiProperty({ example: '50212345679', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^\d{8,15}$/, { message: 'El teléfono debe tener entre 8 y 15 dígitos numéricos' })
  telefono?: string;

  @ApiProperty({ example: 'carlos.hernandez@empresa.gt', required: false })
  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  @IsOptional()
  correo?: string;

  @ApiProperty({ example: '2501123450101', description: 'DPI de 13 dígitos' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{13}$/, { message: 'El DPI debe tener exactamente 13 dígitos numéricos' })
  numeroDpi: string;

  @ApiProperty({ example: 8000.00 })
  @IsNumber({}, { message: 'El salario debe ser un número válido' })
  @Min(1, { message: 'El salario debe ser mayor a 0' })
  salarioBase: number;

  @ApiProperty({ example: 'Desarrollador Junior' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'El cargo debe tener al menos 2 caracteres' })
  cargo: string;

  @ApiProperty({ example: 1 })
  @IsNumber({}, { message: 'El departamento es requerido' })
  @Min(1, { message: 'Debe seleccionar un departamento válido' })
  departamentoId: number;

  @ApiProperty({ enum: EstadoLaboral, example: 'ACTIVO', required: false })
  @IsEnum(EstadoLaboral)
  @IsOptional()
  estadoLaboral?: EstadoLaboral;
}