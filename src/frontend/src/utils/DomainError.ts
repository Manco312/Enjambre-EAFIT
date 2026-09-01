import type { ErrorCode } from '@/constants/messages';

export class DomainError extends Error {
  public readonly code: ErrorCode;

  public constructor(code: ErrorCode) {
    super(code);
    this.name = 'DomainError';
    this.code = code;
  }
}
