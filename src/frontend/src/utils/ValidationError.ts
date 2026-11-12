// Error de validación en el cliente cuyo `message` ya está redactado para
// mostrarse al usuario (a diferencia de DomainError, que usa un código fijo).
export class ValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
