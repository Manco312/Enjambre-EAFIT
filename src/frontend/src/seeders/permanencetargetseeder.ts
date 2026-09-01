import type { PermanenceTargetInterface } from '@/interfaces/PermanenceTargetInterface';

// Un objetivo por estado de miembro del grupo demo (memberStatusSeeder ids 1..5).
export const permanenceTargetSeeder: PermanenceTargetInterface[] = [
  { id: 1, groupId: 1, memberStatusId: 1, percentage: 70 },
  { id: 2, groupId: 1, memberStatusId: 2, percentage: 80 },
  { id: 3, groupId: 1, memberStatusId: 3, percentage: 0 },
  { id: 4, groupId: 1, memberStatusId: 4, percentage: 30 },
  { id: 5, groupId: 1, memberStatusId: 5, percentage: 0 },
];
