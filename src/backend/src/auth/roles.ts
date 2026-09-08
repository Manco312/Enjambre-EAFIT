export const USER_ROLES = {
  ADMIN: 'ADMIN',
  BOARD: 'BOARD',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
