import { IsInt, IsOptional } from 'class-validator';

// La junta solo puede reasignar el estado de un miembro dentro del grupo.
// El miembro y el grupo de una relación GroupMember son inmutables.
export class UpdateGroupMemberDto {
  @IsOptional()
  @IsInt()
  memberStatusId?: number;
}
