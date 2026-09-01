export const DOCUMENT_TYPES = {
  CC: 'Cédula de ciudadanía',
  TI: 'Tarjeta de identidad',
  CE: 'Cédula de extranjería',
  PP: 'Pasaporte',
} as const;

type DocumentTypeValue = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];

export const DOCUMENT_TYPE_OPTIONS: DocumentTypeValue[] = Object.values(DOCUMENT_TYPES);
