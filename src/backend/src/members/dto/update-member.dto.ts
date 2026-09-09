import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateMemberDto {
  @IsOptional()
  @IsInt()
  idEpik?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  documentType?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  documentNumber?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  program?: string;

  @IsOptional()
  @IsString()
  secondProgram?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  committeeIds?: number[];
}
