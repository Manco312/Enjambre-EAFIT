import axios from 'axios';

import { ERROR_MESSAGES } from '@/constants/messages';
import { DomainError } from '@/utils/DomainError';
import { ValidationError } from '@/utils/ValidationError';

// Códigos en los que la API responde con un mensaje pensado para el usuario
// (validación de campos y choques con datos existentes).
const USER_FACING_STATUSES = [400, 409];

function resolveApiMessage(status: number, data: unknown): string {
  if (status === 401) {
    return ERROR_MESSAGES.SESSION_EXPIRED;
  }
  if (status === 403) {
    return ERROR_MESSAGES.FORBIDDEN;
  }
  if (!USER_FACING_STATUSES.includes(status)) {
    return ERROR_MESSAGES.UNKNOWN;
  }

  // class-validator devuelve un arreglo con un mensaje por regla incumplida.
  const message = (data as { message?: unknown } | undefined)?.message;
  if (Array.isArray(message) && message.length > 0) {
    return message.map(String).join(' ');
  }
  if (typeof message === 'string' && message.length > 0) {
    return message;
  }
  return ERROR_MESSAGES.UNKNOWN;
}

export function resolveErrorMessage(error: unknown): string {
  if (error instanceof DomainError) {
    return ERROR_MESSAGES[error.code];
  }
  if (error instanceof ValidationError) {
    return error.message;
  }
  if (axios.isAxiosError(error)) {
    return error.response === undefined
      ? ERROR_MESSAGES.NETWORK
      : resolveApiMessage(error.response.status, error.response.data);
  }
  return ERROR_MESSAGES.UNKNOWN;
}
