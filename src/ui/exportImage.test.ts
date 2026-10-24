import { describe, expect, it } from 'vitest';
import { safeFilename } from './exportImage';

describe('safeFilename', () => {
  it('quita tildes, espacios y símbolos', () => {
    expect(safeFilename('pulso-Sueño-día-2026-10-24.png')).toBe('pulso-sueno-dia-2026-10-24.png');
    expect(safeFilename('Gasto por hora (COP/h).png')).toBe('gasto-por-hora-cop-h-.png');
  });
});
