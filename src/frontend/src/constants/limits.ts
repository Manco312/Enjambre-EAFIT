// Mismos límites que valida la API (ver utils/validation.util.ts del backend).
export const LIMITS = {
  NAME_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 2000,
  MAX_PERCENTAGE: 100,
  USERNAME_MIN_LENGTH: 4,
  USERNAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 72,
} as const;
