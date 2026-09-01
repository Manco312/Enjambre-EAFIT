export interface DefaultMemberStatus {
  name: string;
  percentage: number;
}

// Estados de miembro y % de permanencia por defecto al crear un grupo (editables).
export const DEFAULT_MEMBER_STATUSES: DefaultMemberStatus[] = [
  { name: 'ACTIVO', percentage: 70 },
  { name: 'PERÍODO DE PRUEBA', percentage: 80 },
  { name: 'LICENCIA', percentage: 0 },
  { name: 'HONORARIO', percentage: 30 },
  { name: 'MIEMBRO DE JUNTA', percentage: 0 },
];
