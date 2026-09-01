import type { Nullable } from '@/types/Nullable';
import type { PermanenceActivityScope } from '@/types/PermanenceActivityScope';

export interface CreatePermanenceActivityDTO {
  groupId: number;
  scope: PermanenceActivityScope;
  committeeId: Nullable<number>;
  name: string;
  description: string;
  weight: number;
  period: string;
}
