import { USER_ROLES } from '@/constants/roles';

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
