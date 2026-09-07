import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMemberDto {
  @IsInt()
  idEpik: number;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  documentType: string;

  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  program: string;

  @IsOptional()
  @IsString()
  secondProgram?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  committeeIds?: number[];

  @IsInt()
  groupId: number;

  @IsInt()
  memberStatusId: number;
}
