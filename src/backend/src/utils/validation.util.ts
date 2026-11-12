import { Transform } from 'class-transformer';

// Recorta los espacios de los extremos antes de validar, para que un valor de
// solo espacios falle en @IsNotEmpty y no se guarde vacío.
export function Trim(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}

export const NAME_MAX_LENGTH = 255;
export const DESCRIPTION_MAX_LENGTH = 2000;
export const MAX_PERCENTAGE = 100;

// Mismos valores que `constants/documentTypes.ts` del frontend.
export const DOCUMENT_TYPES = [
  'Cédula de ciudadanía',
  'Tarjeta de identidad',
  'Cédula de extranjería',
  'Pasaporte',
] as const;

export function normalizeName(value: string): string {
  return value.trim().toLocaleLowerCase('es');
}
