import type { Nullable } from '@/types/Nullable';

export interface CreateActivityDTO {
  groupId: number;
  committeeId: Nullable<number>;
  name: string;
  description: string;
  weight: number;
  period: string;
}
