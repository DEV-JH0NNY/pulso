import { describe, expect, it } from 'vitest';
import { comparePeriods } from './summary';

const map = (obj: Record<string, number>) => new Map(Object.entries(obj));
const qty = { type: 'quantity' as const, dailyGoal: 2 };

describe('comparación de periodos', () => {
  it('semana en curso frente a los mismos días de la semana pasada', () => {
    // Hoy es miércoles 21 de octubre de 2026: se comparan lun–mié con lun–mié anteriores.
    const totals = map({
      '2026-10-19': 2,
      '2026-10-21': 4,
      '2026-10-12': 1,
      '2026-10-14': 1,
      '2026-10-15': 50, // jueves anterior: no cuenta
    });
    const c = comparePeriods(qty, totals, '2026-10-21', 'week');
    expect(c.elapsedDays).toBe(3);
    expect(c.current).toMatchObject({
      from: '2026-10-19',
      to: '2026-10-21',
      value: 6,
      daysDone: 2,
    });
    expect(c.previous).toMatchObject({ from: '2026-10-12', to: '2026-10-14', value: 2 });
    expect(c.delta).toBe(4);
    expect(c.percent).toBe(200);
  });

  it('mes con anterior más corto', () => {
    const c = comparePeriods(qty, map({ '2026-02-28': 3, '2026-03-31': 1 }), '2026-03-31', 'month');
    expect(c.previous).toMatchObject({ from: '2026-02-01', to: '2026-02-28', value: 3 });
    expect(c.current.value).toBe(1);
  });

  it('escala promedia y no da porcentaje; sin datos previos no hay cambio', () => {
    const scale = { type: 'scale' as const, dailyGoal: null };
    const c = comparePeriods(
      scale,
      map({ '2026-10-19': 4, '2026-10-20': 2, '2026-10-12': 2 }),
      '2026-10-20',
      'week',
    );
    expect(c.current.value).toBe(3);
    expect(c.delta).toBe(1);
    expect(c.percent).toBeNull();
    const empty = comparePeriods(qty, map({ '2026-10-19': 1 }), '2026-10-20', 'week');
    expect(empty.delta).toBeNull();
  });

  it('sí/no cuenta días con sí', () => {
    const bool = { type: 'boolean' as const, dailyGoal: 1 };
    const c = comparePeriods(bool, map({ '2026-10-19': 1, '2026-10-20': 0 }), '2026-10-20', 'week');
    expect(c.current).toMatchObject({ value: 1, daysWithData: 2, daysDone: 1 });
  });
});
