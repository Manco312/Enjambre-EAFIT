import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  MAX_PERCENTAGE,
  NAME_MAX_LENGTH,
  Trim,
} from '../../utils/validation.util.js';

export class CreateMemberStatusDto {
  @Trim()
  @IsString({ message: 'El nombre del estado debe ser texto.' })
  @IsNotEmpty({ message: 'El nombre del estado es obligatorio.' })
  @MaxLength(NAME_MAX_LENGTH, {
    message: `El nombre del estado no puede superar ${NAME_MAX_LENGTH} caracteres.`,
  })
  name: string;

  @IsInt()
  groupId: number;

  @IsInt({ message: 'El objetivo de permanencia debe ser un número entero.' })
  @Min(0, { message: 'El objetivo de permanencia no puede ser menor que 0.' })
  @Max(MAX_PERCENTAGE, {
    message: `El objetivo de permanencia no puede superar ${MAX_PERCENTAGE}%.`,
  })
  target: number;
}
