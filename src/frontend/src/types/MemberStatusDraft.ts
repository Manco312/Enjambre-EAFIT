import type { Nullable } from '@/types/Nullable';

export interface MemberStatusDraft {
  id: Nullable<number>;
  name: string;
  percentage: number;
}
