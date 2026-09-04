import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  weight: number;

  @IsString()
  @IsNotEmpty()
  period: string;

  @IsInt()
  groupId: number;

  @IsOptional()
  @IsInt()
  committeeId?: number;
}