import type { Nullable } from '@/types/Nullable';
import type { UserRole } from '@/types/UserRole';

export interface AuthSessionInterface {
  userId: number;
  username: string;
  role: UserRole;
  groupId: Nullable<number>;
}
