import { IsInt, IsOptional } from 'class-validator';

export class UpdateGroupMemberDto {
  @IsOptional()
  @IsInt()
  memberStatusId?: number;
}
