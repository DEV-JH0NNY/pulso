/** Mueve `id` a la posición `index` y devuelve la nueva lista. */
export function moveToIndex(ids: string[], id: string, index: number): string[] {
  const from = ids.indexOf(id);
  if (from < 0) return ids;
  const rest = ids.filter((x) => x !== id);
  const to = Math.max(0, Math.min(rest.length, index));
  return [...rest.slice(0, to), id, ...rest.slice(to)];
}

/**
 * Posición destino al arrastrar: cuántos de los otros elementos tienen su
 * punto medio por encima del puntero.
 */
export function dropIndex(midpoints: number[], draggedIndex: number, pointerY: number): number {
  return midpoints.filter((m, i) => i !== draggedIndex && m < pointerY).length;
}
