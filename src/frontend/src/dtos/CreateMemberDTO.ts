import type { MemberInterface } from '@/interfaces/MemberInterface';

export type CreateMemberDTO = Omit<MemberInterface, 'id'> & {
  groupId: number;
  memberStatusId: number;
};
