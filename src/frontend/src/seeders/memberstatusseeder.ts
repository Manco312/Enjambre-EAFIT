import type { MemberStatusInterface } from '@/interfaces/MemberStatusInterface';

export const memberStatusSeeder: MemberStatusInterface[] = [
  { id: 1, name: 'ACTIVO', groupId: 1, target: 70 },
  { id: 2, name: 'PERÍODO DE PRUEBA', groupId: 1, target: 80 },
  { id: 3, name: 'LICENCIA', groupId: 1, target: 0 },
  { id: 4, name: 'HONORARIO', groupId: 1, target: 30 },
  { id: 5, name: 'MIEMBRO DE JUNTA', groupId: 1, target: 0 },
];
