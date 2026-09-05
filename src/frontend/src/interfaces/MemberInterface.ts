import type { DocumentType } from '@/types/DocumentType';

export interface MemberInterface {
  id: number;
  idEpik: number;
  fullName: string;
  documentType: DocumentType;
  documentNumber: string;
  email: string;
  phone: string;
  program: string;
  secondProgram: string;
  committeeIds: number[];
}
