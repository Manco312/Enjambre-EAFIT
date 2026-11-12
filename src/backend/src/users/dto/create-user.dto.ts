import {
  IsInt,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from '../../utils/validation.util.js';

export class CreateUserDto {
  @Trim()
  @IsString({ message: 'El usuario debe ser texto.' })
  @MinLength(4, { message: 'El usuario debe tener al menos 4 caracteres.' })
  @MaxLength(50, { message: 'El usuario no puede superar 50 caracteres.' })
  @Matches(/^\S+$/, { message: 'El usuario no puede contener espacios.' })
  username: string;

  // bcrypt solo usa los primeros 72 bytes de la contraseña.
  @IsString({ message: 'La contraseña debe ser texto.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  @MaxLength(72, { message: 'La contraseña no puede superar 72 caracteres.' })
  password: string;

  @IsInt()
  groupId: number;
}
