import type { MemberInterface } from '@/interfaces/MemberInterface';

export type UpdateMemberDTO = Partial<Omit<MemberInterface, 'id' | 'groupId'>>;
