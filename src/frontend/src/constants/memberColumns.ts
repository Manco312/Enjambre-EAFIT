import type { MemberInterface } from '@/interfaces/MemberInterface';

export type MemberColumnKind = 'text' | 'email' | 'documentType' | 'membershipStatus' | 'areas';

export interface MemberColumnDefinition {
  key: keyof MemberInterface;
  header: string;
  kind: MemberColumnKind;
}

export const MEMBER_COLUMNS: MemberColumnDefinition[] = [
  { key: 'email', header: 'Correo electrónico', kind: 'email' },
  { key: 'name', header: 'Nombre', kind: 'text' },
  { key: 'epikId', header: 'ID EPIK', kind: 'text' },
  { key: 'fullName', header: 'Nombre completo en mayúscula', kind: 'text' },
  { key: 'documentType', header: 'Tipo de documento', kind: 'documentType' },
  { key: 'documentNumber', header: 'Número de documento', kind: 'text' },
  { key: 'emailUppercase', header: 'Correo en mayúscula', kind: 'text' },
  { key: 'phone', header: 'Celular', kind: 'text' },
  { key: 'program', header: 'Programa', kind: 'text' },
  { key: 'secondProgram', header: 'Programa #2', kind: 'text' },
  { key: 'membershipStatus', header: 'Estado en el grupo', kind: 'membershipStatus' },
  { key: 'areas', header: 'Área a la que pertenece', kind: 'areas' },
];
