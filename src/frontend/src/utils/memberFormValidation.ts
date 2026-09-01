import type { CreateMemberDTO } from '@/dtos/CreateMemberDTO';

export interface MemberFormErrors {
  email?: string;
  name?: string;
  epikId?: string;
  fullName?: string;
  documentNumber?: string;
  phone?: string;
  program?: string;
  membershipStatus?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateMemberForm(dto: CreateMemberDTO): MemberFormErrors {
  const errors: MemberFormErrors = {};

  if (!EMAIL_PATTERN.test(dto.email.trim())) {
    errors.email = 'Ingresa un correo electrónico válido.';
  }

  if (dto.name.trim().length < 3) {
    errors.name = 'El nombre debe tener al menos 3 caracteres.';
  }

  if (dto.epikId.trim().length === 0) {
    errors.epikId = 'El ID EPIK es obligatorio.';
  }

  if (dto.fullName.trim().length < 3) {
    errors.fullName = 'El nombre completo es obligatorio.';
  }

  if (dto.documentNumber.trim().length === 0) {
    errors.documentNumber = 'El número de documento es obligatorio.';
  }

  if (dto.phone.trim().length > 0 && !/^\d{7,15}$/.test(dto.phone.trim())) {
    errors.phone = 'El celular debe tener entre 7 y 15 dígitos.';
  }

  if (dto.program.trim().length === 0) {
    errors.program = 'El programa es obligatorio.';
  }

  if (dto.membershipStatus.length === 0) {
    errors.membershipStatus = 'Selecciona al menos un estado en el grupo.';
  }

  return errors;
}

export function hasMemberFormErrors(errors: MemberFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
