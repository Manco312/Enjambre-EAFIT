import type { MemberStatusDraft } from '@/types/MemberStatusDraft';
import type { RegisterGroupDTO } from '@/dtos/RegisterGroupDTO';
import { LIMITS } from '@/constants/limits';
import { findDuplicatedName } from '@/utils/normalizeName';

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

function isNamed(value: string): boolean {
  return value.trim().length > 0;
}

function isTooLong(value: string): boolean {
  return value.trim().length > LIMITS.NAME_MAX_LENGTH;
}

function validateCommittees(committeeNames: string[]): string | undefined {
  const named = committeeNames.filter(isNamed);

  if (named.length === 0) {
    return 'Agrega al menos un comité o departamento.';
  }
  if (named.some(isTooLong)) {
    return `Cada nombre de comité puede tener máximo ${LIMITS.NAME_MAX_LENGTH} caracteres.`;
  }

  // En la interfaz los comités se eligen por nombre: no pueden repetirse.
  const duplicated = findDuplicatedName(named);
  if (duplicated !== undefined) {
    return `El comité «${duplicated}» está repetido. Cada comité debe tener un nombre distinto.`;
  }
  return undefined;
}

function validateStatuses(statuses: MemberStatusDraft[]): string | undefined {
  const named = statuses.filter((status: MemberStatusDraft) => isNamed(status.name));

  // Una fila con porcentaje pero sin nombre se descartaría sin avisar.
  const hasOrphanPercentage = statuses.some(
    (status: MemberStatusDraft) => !isNamed(status.name) && !Number.isNaN(status.percentage),
  );
  if (hasOrphanPercentage) {
    return 'Hay un porcentaje sin nombre de estado. Escribe el nombre o elimina esa fila.';
  }
  if (named.length === 0) {
    return 'Agrega al menos un estado de miembro con su porcentaje de permanencia.';
  }
  if (named.some((status: MemberStatusDraft) => isTooLong(status.name))) {
    return `Cada nombre de estado puede tener máximo ${LIMITS.NAME_MAX_LENGTH} caracteres.`;
  }
  if (named.some((status: MemberStatusDraft) => Number.isNaN(status.percentage))) {
    return 'Escribe el porcentaje de permanencia de cada estado.';
  }
  if (
    named.some(
      (status: MemberStatusDraft) =>
        !Number.isInteger(status.percentage) ||
        status.percentage < 0 ||
        status.percentage > LIMITS.MAX_PERCENTAGE,
    )
  ) {
    return `Cada porcentaje de permanencia debe ser un número entero entre 0 y ${LIMITS.MAX_PERCENTAGE}.`;
  }

  const duplicated = findDuplicatedName(named.map((status: MemberStatusDraft) => status.name));
  if (duplicated !== undefined) {
    return `El estado «${duplicated}» está repetido. Cada estado debe tener un nombre distinto.`;
  }
  return undefined;
}

export function validateGroupBasics(
  name: string,
  committeeNames: string[],
  statuses: MemberStatusDraft[],
): GroupFormErrors {
  const errors: GroupFormErrors = {};

  if (name.trim().length < 3) {
    errors.name = 'El nombre del grupo debe tener al menos 3 caracteres.';
  } else if (isTooLong(name)) {
    errors.name = `El nombre del grupo puede tener máximo ${LIMITS.NAME_MAX_LENGTH} caracteres.`;
  }

  const committeesError = validateCommittees(committeeNames);
  if (committeesError !== undefined) {
    errors.committees = committeesError;
  }

  const statusesError = validateStatuses(statuses);
  if (statusesError !== undefined) {
    errors.statuses = statusesError;
  }

  return errors;
}

export function validateRegisterGroupForm(
  form: RegisterGroupDTO,
  statuses: MemberStatusDraft[],
  passwordConfirmation: string,
): RegisterGroupFormErrors {
  const errors: RegisterGroupFormErrors = {
    ...validateGroupBasics(form.name, form.committeeNames, statuses),
  };

  const username = form.boardUsername.trim();
  if (username.length < LIMITS.USERNAME_MIN_LENGTH) {
    errors.boardUsername = `El usuario debe tener al menos ${LIMITS.USERNAME_MIN_LENGTH} caracteres.`;
  } else if (username.length > LIMITS.USERNAME_MAX_LENGTH) {
    errors.boardUsername = `El usuario puede tener máximo ${LIMITS.USERNAME_MAX_LENGTH} caracteres.`;
  } else if (/\s/.test(username)) {
    errors.boardUsername = 'El usuario no puede contener espacios.';
  }

  if (form.boardPassword.length < LIMITS.PASSWORD_MIN_LENGTH) {
    errors.boardPassword = `La contraseña debe tener al menos ${LIMITS.PASSWORD_MIN_LENGTH} caracteres.`;
  } else if (form.boardPassword.length > LIMITS.PASSWORD_MAX_LENGTH) {
    errors.boardPassword = `La contraseña puede tener máximo ${LIMITS.PASSWORD_MAX_LENGTH} caracteres.`;
  }

  if (form.boardPassword !== passwordConfirmation) {
    errors.boardPasswordConfirmation = 'Las contraseñas no coinciden.';
  }

  return errors;
}

export function hasFormErrors(errors: GroupFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
