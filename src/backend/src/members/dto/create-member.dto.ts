import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  DOCUMENT_TYPES,
  NAME_MAX_LENGTH,
  Trim,
} from '../../utils/validation.util.js';

export class CreateMemberDto {
  @IsInt({ message: 'El ID EPIK debe ser un número entero.' })
  @Min(1, { message: 'El ID EPIK debe ser un número positivo.' })
  idEpik: number;

  @Trim()
  @IsString({ message: 'El nombre completo debe ser texto.' })
  @MinLength(3, {
    message: 'El nombre completo debe tener al menos 3 caracteres.',
  })
  @MaxLength(NAME_MAX_LENGTH, {
    message: `El nombre completo no puede superar ${NAME_MAX_LENGTH} caracteres.`,
  })
  fullName: string;

  @IsIn(DOCUMENT_TYPES, { message: 'El tipo de documento no es válido.' })
  documentType: string;

  @Trim()
  @IsString({ message: 'El número de documento debe ser texto.' })
  @Matches(/^[A-Za-z0-9]{5,20}$/, {
    message:
      'El número de documento debe tener entre 5 y 20 letras o números, sin espacios ni puntos.',
  })
  documentNumber: string;

  @Trim()
  @IsEmail({}, { message: 'El correo electrónico no es válido.' })
  @MaxLength(NAME_MAX_LENGTH, {
    message: `El correo no puede superar ${NAME_MAX_LENGTH} caracteres.`,
  })
  email: string;

  @Trim()
  @IsString({ message: 'El celular debe ser texto.' })
  @Matches(/^\d{7,15}$/, {
    message: 'El celular debe tener entre 7 y 15 dígitos.',
  })
  phone: string;

  @Trim()
  @IsString({ message: 'El programa debe ser texto.' })
  @IsNotEmpty({ message: 'El programa es obligatorio.' })
  @MaxLength(NAME_MAX_LENGTH, {
    message: `El programa no puede superar ${NAME_MAX_LENGTH} caracteres.`,
  })
  program: string;

  @IsOptional()
  @Trim()
  @IsString({ message: 'El programa #2 debe ser texto.' })
  @MaxLength(NAME_MAX_LENGTH, {
    message: `El programa #2 no puede superar ${NAME_MAX_LENGTH} caracteres.`,
  })
  secondProgram?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique({ message: 'Hay comités repetidos.' })
  @IsInt({ each: true })
  committeeIds?: number[];

  @IsInt()
  groupId: number;

  @IsInt()
  memberStatusId: number;
}
