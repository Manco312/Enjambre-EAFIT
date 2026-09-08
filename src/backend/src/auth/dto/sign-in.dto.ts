import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
