import type { MemberInterface } from '@/interfaces/MemberInterface';

// `groupId` indica a qué grupo pertenecen los `committeeIds` enviados: la API
// solo reemplaza los comités de ese grupo.
export type UpdateMemberDTO = Partial<Omit<MemberInterface, 'id'>> & { groupId?: number };
