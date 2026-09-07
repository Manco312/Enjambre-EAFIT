import { IsInt } from 'class-validator';

export class CreateGroupMemberDto {
  @IsInt()
  memberId: number;

  @IsInt()
  groupId: number;

  @IsInt()
  memberStatusId: number;
}
