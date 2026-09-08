import type { Nullable } from '@/types/Nullable';

// El `period` lo asigna el backend (semestre vigente), no se envía.
export interface CreateActivityDTO {
  groupId: number;
  committeeId: Nullable<number>;
  name: string;
  description: string;
  weight: number;
}
