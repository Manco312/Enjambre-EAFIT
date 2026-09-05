import type { ActivityInterface } from '@/interfaces/ActivityInterface';

export type UpdateActivityDTO = Partial<
  Pick<ActivityInterface, 'name' | 'description' | 'weight' | 'period'>
>;
