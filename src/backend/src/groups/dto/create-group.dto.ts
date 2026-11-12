import { IsString, MaxLength, MinLength } from 'class-validator';
import { NAME_MAX_LENGTH, Trim } from '../../utils/validation.util.js';

export class CreateGroupDto {
  @Trim()
  @IsString({ message: 'El nombre del grupo debe ser texto.' })
  @MinLength(3, {
    message: 'El nombre del grupo debe tener al menos 3 caracteres.',
  })
  @MaxLength(NAME_MAX_LENGTH, {
    message: `El nombre del grupo no puede superar ${NAME_MAX_LENGTH} caracteres.`,
  })
  name: string;
}
