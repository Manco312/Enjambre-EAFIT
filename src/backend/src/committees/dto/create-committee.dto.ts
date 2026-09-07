import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCommitteeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  groupId: number;
}
