import type { Nullable } from '@/types/Nullable';

export interface ActivityInterface {
  id: number;
  groupId: number;
  committeeId: Nullable<number>;
  name: string;
  description: string;
  weight: number;
  period: string;
}
