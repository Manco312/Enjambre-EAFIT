import { DOCUMENT_TYPES } from '@/constants/documentTypes';

export type DocumentType = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];
