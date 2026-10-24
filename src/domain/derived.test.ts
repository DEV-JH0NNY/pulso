import { describe, expect, it } from 'vitest';
import { derivedTotals, describeFormula, validateDerivedDraft } from './derived';

const a = new Map([
  ['2026-01-01', 30000],
  ['2026-01-02', 10000],
  ['2026-01-03', 5000],
]);
const b = new Map([
  ['2026-01-01', 3],
  ['2026-01-02', 0],
  ['2026-01-04', 2],
]);

describe('métricas derivadas', () => {
  it('divide solo en días comunes y omite B = 0', () => {
    expect(Object.fromEntries(derivedTotals('ratio', a, b))).toEqual({ '2026-01-01': 10000 });
  });
  it('suma, resta y multiplica', () => {
    expect(derivedTotals('sum', a, b).get('2026-01-02')).toBe(10000);
    expect(derivedTotals('difference', a, b).get('2026-01-01')).toBe(29997);
    expect(derivedTotals('product', a, b).get('2026-01-01')).toBe(90000);
    expect(derivedTotals('sum', a, b).has('2026-01-03')).toBe(false);
  });
  it('valida el borrador', () => {
    const ids = new Set(['x', 'y']);
    const ok = {
      name: 'Gasto por hora',
      icon: '🧮',
      op: 'ratio' as const,
      aId: 'x',
      bId: 'y',
      unit: '',
    };
    expect(validateDerivedDraft(ok, ids)).toEqual({});
    expect(validateDerivedDraft({ ...ok, bId: 'x' }, ids).bId).toMatch(/distintos/);
    expect(validateDerivedDraft({ ...ok, name: ' ' }, ids).name).toBeDefined();
    expect(validateDerivedDraft({ ...ok, aId: 'z' }, ids).aId).toBeDefined();
  });
  it('describe la fórmula', () => {
    const t = (name: string) => ({ name }) as never;
    expect(describeFormula({ op: 'ratio' }, t('Gastos'), t('Estudio'))).toBe('Gastos ÷ Estudio');
    expect(describeFormula({ op: 'sum' }, undefined, t('B'))).toBe('(eliminado) + B');
  });
});
