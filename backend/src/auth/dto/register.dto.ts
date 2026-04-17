import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'nuevo.usuario@empresa.gt' })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiProperty({ example: 'ClaveSegura123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  contrasena: string;

  @ApiProperty({ enum: RolUsuario, example: 'EMPLEADO', required: false })
  @IsEnum(RolUsuario)
  @IsOptional()
  rol?: RolUsuario;

  @ApiProperty({ example: 1, description: 'ID del empleado asociado (opcional)', required: false })
  @IsOptional()
  empleadoId?: number;
}