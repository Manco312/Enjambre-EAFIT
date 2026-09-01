import type { GroupInterface } from '@/interfaces/GroupInterface';

export type UpdateGroupDTO = Partial<Omit<GroupInterface, 'id'>>;
