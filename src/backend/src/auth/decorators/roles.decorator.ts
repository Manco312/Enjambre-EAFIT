import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../roles.js';

export const ROLES_KEY = 'roles';

// Marca un endpoint (o un controller entero) como restringido a ciertos roles.
// Sin este decorador el endpoint queda abierto a cualquier usuario autenticado.
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
