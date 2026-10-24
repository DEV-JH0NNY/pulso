import { describe, expect, it } from 'vitest';
import { suggestAppearance } from './appearance';

describe('apariencia sugerida', () => {
  it('reconoce nombres comunes sin importar tildes ni mayúsculas', () => {
    expect(suggestAppearance('Horas de SUEÑO')).toEqual({ icon: '💤', color: 'violet' });
    expect(suggestAppearance('café')).toEqual({ icon: '☕', color: 'amber' });
    expect(suggestAppearance('Estudiar cálculo')?.icon).toBe('📚');
    expect(suggestAppearance('Gastos del mes')?.icon).toBe('💸');
  });
  it('devuelve null si no reconoce el nombre', () => {
    expect(suggestAppearance('Xyz')).toBeNull();
  });
});
