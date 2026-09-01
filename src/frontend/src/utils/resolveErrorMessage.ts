import { ERROR_MESSAGES } from '@/constants/messages';
import { DomainError } from '@/utils/DomainError';

export function resolveErrorMessage(error: unknown): string {
  if (error instanceof DomainError) {
    return ERROR_MESSAGES[error.code];
  }
  return ERROR_MESSAGES.UNKNOWN;
}
