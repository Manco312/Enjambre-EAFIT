import type { PermanenceActivityInterface } from '@/interfaces/PermanenceActivityInterface';

export type UpdatePermanenceActivityDTO = Partial<
  Pick<PermanenceActivityInterface, 'name' | 'description' | 'weight' | 'period'>
>;
