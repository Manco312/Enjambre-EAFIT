import { USER_ROLES } from '@/constants/roles';
import type { UserInterface } from '@/interfaces/UserInterface';

export const userSeeder: UserInterface[] = [
  { id: 1, username: 'admin', password: 'admin123', role: USER_ROLES.ADMIN, groupId: null },
  { id: 2, username: 'junta.semillero', password: 'junta123', role: USER_ROLES.BOARD, groupId: 1 },
];
