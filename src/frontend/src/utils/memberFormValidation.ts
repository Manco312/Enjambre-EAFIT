import type { Nullable } from '@/types/Nullable';

export interface MemberFormValues {
  email: string;
  idEpik: string;
  fullName: string;
  documentNumber: string;
  phone: string;
  program: string;
  memberStatusId: Nullable<number>;
}

export interface MemberFormErrors {
  email?: string;
  idEpik?: string;
  fullName?: string;
  documentNumber?: string;
  phone?: string;
  program?: string;
  memberStatusId?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateMemberForm(form: MemberFormValues): MemberFormErrors {
  const errors: MemberFormErrors = {};

  if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'Ingresa un correo electrónico válido.';
  }

  if (form.idEpik.trim().length === 0 || Number.isNaN(Number(form.idEpik))) {
    errors.idEpik = 'El ID EPIK es obligatorio y debe ser numérico.';
  }

  if (form.fullName.trim().length < 3) {
    errors.fullName = 'El nombre completo es obligatorio.';
  }

  if (form.documentNumber.trim().length === 0) {
    errors.documentNumber = 'El número de documento es obligatorio.';
  }

  if (form.phone.trim().length > 0 && !/^\d{7,15}$/.test(form.phone.trim())) {
    errors.phone = 'El celular debe tener entre 7 y 15 dígitos.';
  }

  if (form.program.trim().length === 0) {
    errors.program = 'El programa es obligatorio.';
  }

  if (form.memberStatusId === null) {
    errors.memberStatusId = 'Selecciona un estado en el grupo.';
  }

  return errors;
}

export function hasMemberFormErrors(errors: MemberFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
