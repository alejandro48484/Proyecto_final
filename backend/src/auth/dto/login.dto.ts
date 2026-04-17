import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@empresa.gt', description: 'Correo electrónico del usuario' })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiProperty({ example: 'Admin123!', description: 'Contraseña del usuario' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  contrasena: string;
}