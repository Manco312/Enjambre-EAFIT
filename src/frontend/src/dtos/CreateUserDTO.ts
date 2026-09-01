import type { Nullable } from '@/types/Nullable';
import type { UserRole } from '@/types/UserRole';

export interface CreateUserDTO {
  username: string;
  password: string;
  role: UserRole;
  groupId: Nullable<number>;
}
