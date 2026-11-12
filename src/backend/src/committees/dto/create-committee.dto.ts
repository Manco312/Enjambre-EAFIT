import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { NAME_MAX_LENGTH, Trim } from '../../utils/validation.util.js';

export class CreateCommitteeDto {
  @Trim()
  @IsString({ message: 'El nombre del comité debe ser texto.' })
  @IsNotEmpty({ message: 'El nombre del comité es obligatorio.' })
  @MaxLength(NAME_MAX_LENGTH, {
    message: `El nombre del comité no puede superar ${NAME_MAX_LENGTH} caracteres.`,
  })
  name: string;

  @IsInt()
  groupId: number;
}
