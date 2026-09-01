import type { MemberStatusInterface } from '@/interfaces/MemberStatusInterface';

export type UpdateMemberStatusDTO = Partial<Omit<MemberStatusInterface, 'id'>>;
