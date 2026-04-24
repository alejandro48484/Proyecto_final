import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CrearDepartamentoDto {
  @ApiProperty({ example: 'Recursos Humanos' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Gestión del talento humano y bienestar laboral', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;
}