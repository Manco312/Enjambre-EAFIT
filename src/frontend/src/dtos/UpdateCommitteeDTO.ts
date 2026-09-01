import type { CommitteeInterface } from '@/interfaces/CommitteeInterface';

export type UpdateCommitteeDTO = Partial<Omit<CommitteeInterface, 'id'>>;
