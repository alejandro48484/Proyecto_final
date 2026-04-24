import { PartialType } from '@nestjs/swagger';
import { CrearAcademicoDto } from './crear-academico.dto';

export class ActualizarAcademicoDto extends PartialType(CrearAcademicoDto) {}