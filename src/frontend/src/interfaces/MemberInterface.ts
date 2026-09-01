import type { DocumentType } from '@/types/DocumentType';

export interface MemberInterface {
  id: number;
  groupId: number;
  email: string;
  name: string;
  epikId: string;
  fullName: string;
  documentType: DocumentType;
  documentNumber: string;
  emailUppercase: string;
  phone: string;
  program: string;
  secondProgram: string;
  membershipStatus: string[];
  areas: string[];
}
