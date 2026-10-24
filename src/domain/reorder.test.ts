import { describe, expect, it } from 'vitest';
import { dropIndex, moveToIndex } from './reorder';

describe('reordenar arrastrando', () => {
  it('mueve a una posición', () => {
    expect(moveToIndex(['a', 'b', 'c', 'd'], 'a', 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveToIndex(['a', 'b', 'c', 'd'], 'd', 0)).toEqual(['d', 'a', 'b', 'c']);
    expect(moveToIndex(['a', 'b'], 'a', 9)).toEqual(['b', 'a']);
    expect(moveToIndex(['a', 'b'], 'z', 0)).toEqual(['a', 'b']);
  });

  it('calcula el destino según el puntero', () => {
    const mids = [25, 75, 125, 175];
    expect(dropIndex(mids, 0, 10)).toBe(0);
    expect(dropIndex(mids, 0, 130)).toBe(2);
    expect(dropIndex(mids, 3, 80)).toBe(2);
    expect(dropIndex(mids, 1, 500)).toBe(3);
  });
});
