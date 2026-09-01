import type { PermanenceTargetInterface } from '@/interfaces/PermanenceTargetInterface';

export type UpdatePermanenceTargetDTO = Partial<Omit<PermanenceTargetInterface, 'id' | 'groupId'>>;
