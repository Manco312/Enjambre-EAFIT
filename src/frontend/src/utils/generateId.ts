interface Identifiable {
  id: number;
}

export function generateId(items: Identifiable[]): number {
  return items.reduce((maxId: number, item: Identifiable) => Math.max(maxId, item.id), 0) + 1;
}
