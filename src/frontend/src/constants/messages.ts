export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos.',
  GROUP_NAME_TAKEN: 'Ya existe un grupo estudiantil con ese nombre.',
  GROUP_NOT_FOUND: 'El grupo estudiantil no existe.',
  COMMITTEE_NOT_FOUND: 'El comité o departamento no existe.',
  USERNAME_TAKEN: 'El nombre de usuario ya está en uso.',
  UNKNOWN: 'Ocurrió un error inesperado. Intenta de nuevo.',
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;
