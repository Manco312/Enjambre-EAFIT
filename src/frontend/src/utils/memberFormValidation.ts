import type { DocumentType } from '@/types/DocumentType';
import type { Nullable } from '@/types/Nullable';
import { DOCUMENT_TYPE_OPTIONS } from '@/constants/documentTypes';
import { LIMITS } from '@/constants/limits';

// Campos de texto de un integrante, tanto en el formulario de alta como en la
// edición en línea de la tabla: ambos usan `validateMemberField`.
export type MemberTextField =
  'email' | 'idEpik' | 'fullName' | 'documentNumber' | 'phone' | 'program' | 'secondProgram';

export interface MemberFormValues {
  email: string;
  idEpik: string;
  fullName: string;
  documentType: DocumentType | '';
  documentNumber: string;
  phone: string;
  program: string;
  secondProgram: string;
  memberStatusId: Nullable<number>;
}

export type MemberFormErrors = Partial<Record<keyof MemberFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ID_EPIK_PATTERN = /^\d+$/;
const DOCUMENT_NUMBER_PATTERN = /^[A-Za-z0-9]{5,20}$/;
const PHONE_PATTERN = /^\d{7,15}$/;

const MEMBER_TEXT_FIELDS: MemberTextField[] = [
  'email',
  'idEpik',
  'fullName',
  'documentNumber',
  'phone',
  'program',
  'secondProgram',
];

function tooLong(value: string): boolean {
  return value.length > LIMITS.NAME_MAX_LENGTH;
}

export function isMemberTextField(key: string): key is MemberTextField {
  return (MEMBER_TEXT_FIELDS as string[]).includes(key);
}

// Devuelve el mensaje de error del campo, o `undefined` si el valor es válido.
export function validateMemberField(field: MemberTextField, rawValue: string): string | undefined {
  const value = rawValue.trim();

  switch (field) {
    case 'email':
      if (!EMAIL_PATTERN.test(value) || tooLong(value)) {
        return 'Ingresa un correo electrónico válido.';
      }
      return undefined;
    case 'idEpik':
      if (
        !ID_EPIK_PATTERN.test(value) ||
        Number(value) <= 0 ||
        !Number.isSafeInteger(Number(value))
      ) {
        return 'El ID EPIK es obligatorio y debe ser un número entero positivo.';
      }
      return undefined;
    case 'fullName':
      if (value.length < 3) {
        return 'El nombre completo debe tener al menos 3 caracteres.';
      }
      if (tooLong(value)) {
        return `El nombre completo no puede superar ${LIMITS.NAME_MAX_LENGTH} caracteres.`;
      }
      return undefined;
    case 'documentNumber':
      if (!DOCUMENT_NUMBER_PATTERN.test(value)) {
        return 'El número de documento debe tener entre 5 y 20 letras o números, sin espacios ni puntos.';
      }
      return undefined;
    case 'phone':
      if (!PHONE_PATTERN.test(value)) {
        return 'El celular es obligatorio y debe tener entre 7 y 15 dígitos.';
      }
      return undefined;
    case 'program':
      if (value.length === 0) {
        return 'El programa es obligatorio.';
      }
      if (tooLong(value)) {
        return `El programa no puede superar ${LIMITS.NAME_MAX_LENGTH} caracteres.`;
      }
      return undefined;
    case 'secondProgram':
      if (tooLong(value)) {
        return `El programa #2 no puede superar ${LIMITS.NAME_MAX_LENGTH} caracteres.`;
      }
      return undefined;
  }
}

export function validateMemberForm(form: MemberFormValues): MemberFormErrors {
  const errors: MemberFormErrors = {};

  MEMBER_TEXT_FIELDS.forEach((field: MemberTextField) => {
    const error = validateMemberField(field, form[field]);
    if (error !== undefined) {
      errors[field] = error;
    }
  });

  if (form.documentType === '' || !DOCUMENT_TYPE_OPTIONS.includes(form.documentType)) {
    errors.documentType = 'Selecciona el tipo de documento.';
  }

  if (form.memberStatusId === null) {
    errors.memberStatusId = 'Selecciona un estado en el grupo.';
  }

  return errors;
}

export function hasMemberFormErrors(errors: MemberFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
