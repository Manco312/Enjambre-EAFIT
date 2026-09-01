import type { RegisterGroupDTO } from '@/dtos/RegisterGroupDTO';

export interface GroupFormErrors {
  name?: string;
  committees?: string;
  statuses?: string;
}

export interface RegisterGroupFormErrors extends GroupFormErrors {
  boardUsername?: string;
  boardPassword?: string;
  boardPasswordConfirmation?: string;
}

export function validateGroupBasics(
  name: string,
  committeeNames: string[],
  statusNames: string[],
): GroupFormErrors {
  const errors: GroupFormErrors = {};

  if (name.trim().length < 3) {
    errors.name = 'El nombre del grupo debe tener al menos 3 caracteres.';
  }

  if (committeeNames.filter((value: string) => value.trim().length > 0).length === 0) {
    errors.committees = 'Agrega al menos un comité o departamento.';
  }

  if (statusNames.filter((value: string) => value.trim().length > 0).length === 0) {
    errors.statuses = 'Agrega al menos un estado de miembro.';
  }

  return errors;
}

export function validateRegisterGroupForm(
  form: RegisterGroupDTO,
  passwordConfirmation: string,
): RegisterGroupFormErrors {
  const errors: RegisterGroupFormErrors = {
    ...validateGroupBasics(form.name, form.committeeNames, form.statusNames),
  };

  if (form.boardUsername.trim().length < 4) {
    errors.boardUsername = 'El usuario debe tener al menos 4 caracteres.';
  } else if (/\s/.test(form.boardUsername)) {
    errors.boardUsername = 'El usuario no puede contener espacios.';
  }

  if (form.boardPassword.length < 6) {
    errors.boardPassword = 'La contraseña debe tener al menos 6 caracteres.';
  }

  if (form.boardPassword !== passwordConfirmation) {
    errors.boardPasswordConfirmation = 'Las contraseñas no coinciden.';
  }

  return errors;
}

export function hasFormErrors(errors: GroupFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
