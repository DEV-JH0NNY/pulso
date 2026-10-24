import { describe, expect, it } from 'vitest';
import { computeStreaks } from './streaks';

const counter = { type: 'counter' as const, dailyGoal: null };
const map = (obj: Record<string, number>) => new Map(Object.entries(obj));

describe('rachas', () => {
  it('sin datos todo es cero', () => {
    expect(computeStreaks(counter, new Map(), '2026-01-10')).toEqual({
      current: 0,
      longest: 0,
      doneDays: 0,
    });
  });

  it('cuenta la racha actual incluyendo hoy', () => {
    const totals = map({ '2026-01-08': 1, '2026-01-09': 2, '2026-01-10': 1 });
    expect(computeStreaks(counter, totals, '2026-01-10').current).toBe(3);
  });

  it('si hoy aún no se cumple, la racha sigue viva desde ayer', () => {
    const totals = map({ '2026-01-08': 1, '2026-01-09': 2 });
    expect(computeStreaks(counter, totals, '2026-01-10').current).toBe(2);
  });

  it('un día sin cumplir rompe la racha', () => {
    const totals = map({ '2026-01-07': 1, '2026-01-09': 1 });
    expect(computeStreaks(counter, totals, '2026-01-11').current).toBe(0);
  });

  it('calcula la racha más larga a través de meses', () => {
    const totals = map({
      '2026-01-30': 1,
      '2026-01-31': 1,
      '2026-02-01': 1,
      '2026-02-05': 1,
      '2026-02-06': 1,
    });
    expect(computeStreaks(counter, totals, '2026-02-06')).toEqual({
      current: 2,
      longest: 3,
      doneDays: 5,
    });
  });

  it('respeta la meta y los sí/no', () => {
    const goal = { type: 'quantity' as const, dailyGoal: 8 };
    const totals = map({ '2026-01-09': 8, '2026-01-10': 6 });
    expect(computeStreaks(goal, totals, '2026-01-10')).toMatchObject({ current: 1, doneDays: 1 });
    const bool = { type: 'boolean' as const, dailyGoal: null };
    expect(computeStreaks(bool, map({ '2026-01-10': 0 }), '2026-01-10').doneDays).toBe(0);
  });

  it('ignora días futuros', () => {
    expect(computeStreaks(counter, map({ '2026-01-11': 1 }), '2026-01-10').doneDays).toBe(0);
  });
});
