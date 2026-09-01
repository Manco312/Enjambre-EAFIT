import type { Nullable } from '@/types/Nullable';
import type { UserRole } from '@/types/UserRole';

export interface UserInterface {
  id: number;
  username: string;
  password: string;
  role: UserRole;
  groupId: Nullable<number>;
}
