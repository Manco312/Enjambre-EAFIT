import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateMemberStatusDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  groupId: number;

  @IsInt()
  target: number;
}
