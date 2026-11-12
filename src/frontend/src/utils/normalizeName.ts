// Forma canónica para comparar nombres sin distinguir mayúsculas ni espacios
// de los extremos (misma regla que usa el backend para detectar duplicados).
export function normalizeName(value: string): string {
  return value.trim().toLocaleLowerCase('es');
}

export function findDuplicatedName(names: string[]): string | undefined {
  const seen = new Set<string>();
  for (const name of names) {
    const normalized = normalizeName(name);
    if (seen.has(normalized)) {
      return name.trim();
    }
    seen.add(normalized);
  }
  return undefined;
}
