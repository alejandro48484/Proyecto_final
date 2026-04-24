import { PartialType } from '@nestjs/swagger';
import { CrearDepartamentoDto } from './crear-departamento.dto';

export class ActualizarDepartamentoDto extends PartialType(CrearDepartamentoDto) {}