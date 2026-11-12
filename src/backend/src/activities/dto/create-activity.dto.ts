import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  DESCRIPTION_MAX_LENGTH,
  MAX_PERCENTAGE,
  NAME_MAX_LENGTH,
  Trim,
} from '../../utils/validation.util.js';

export class CreateActivityDto {
  @Trim()
  @IsString({ message: 'El nombre de la actividad debe ser texto.' })
  @IsNotEmpty({ message: 'El nombre de la actividad es obligatorio.' })
  @MaxLength(NAME_MAX_LENGTH, {
    message: `El nombre de la actividad no puede superar ${NAME_MAX_LENGTH} caracteres.`,
  })
  name: string;

  // La descripción es opcional: si no llega se guarda vacía.
  @IsOptional()
  @Trim()
  @IsString({ message: 'La descripción debe ser texto.' })
  @MaxLength(DESCRIPTION_MAX_LENGTH, {
    message: `La descripción no puede superar ${DESCRIPTION_MAX_LENGTH} caracteres.`,
  })
  description?: string;

  @IsInt({ message: 'El peso debe ser un número entero.' })
  @Min(1, { message: 'El peso debe ser de al menos 1%.' })
  @Max(MAX_PERCENTAGE, {
    message: `El peso no puede superar ${MAX_PERCENTAGE}%.`,
  })
  weight: number;

  @IsInt()
  groupId: number;

  @ValidateIf((object, value) => value !== null)
  @IsInt()
  committeeId: number | null;
}
