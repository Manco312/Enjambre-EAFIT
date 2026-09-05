import type { MemberWithMembership } from '@/services/MemberService';

export type MemberColumnKind = 'text' | 'email' | 'documentType' | 'membershipStatus' | 'areas';

export interface MemberColumnDefinition {
  key: keyof MemberWithMembership;
  header: string;
  kind: MemberColumnKind;
}

export const MEMBER_COLUMNS: MemberColumnDefinition[] = [
  { key: 'email', header: 'Correo electrónico', kind: 'email' },
  { key: 'idEpik', header: 'ID EPIK', kind: 'text' },
  { key: 'fullName', header: 'Nombre completo en mayúscula', kind: 'text' },
  { key: 'documentType', header: 'Tipo de documento', kind: 'documentType' },
  { key: 'documentNumber', header: 'Número de documento', kind: 'text' },
  { key: 'phone', header: 'Celular', kind: 'text' },
  { key: 'program', header: 'Programa', kind: 'text' },
  { key: 'secondProgram', header: 'Programa #2', kind: 'text' },
  { key: 'memberStatusId', header: 'Estado en el grupo', kind: 'membershipStatus' },
  { key: 'committeeIds', header: 'Área a la que pertenece', kind: 'areas' },
];
