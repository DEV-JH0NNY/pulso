import { describe, expect, it } from 'vitest';
import { buildHeatmap, levelFor } from './heatmap';

describe('nivel del mapa de calor', () => {
  it('sin registro es 0', () => {
    expect(levelFor({ type: 'counter', dailyGoal: null }, null, 10)).toBe(0);
  });
  it('con meta: 4 si se cumple, proporcional si no', () => {
    const t = { type: 'quantity' as const, dailyGoal: 8 };
    expect(levelFor(t, 8, 10)).toBe(4);
    expect(levelFor(t, 2, 10)).toBe(1);
    expect(levelFor(t, 5, 10)).toBe(2);
    expect(levelFor(t, 7, 10)).toBe(3);
    expect(levelFor(t, 0, 10)).toBe(1);
  });
  it('sin meta: relativo al máximo', () => {
    const t = { type: 'counter' as const, dailyGoal: null };
    expect(levelFor(t, 10, 10)).toBe(4);
    expect(levelFor(t, 1, 10)).toBe(1);
    expect(levelFor(t, 6, 10)).toBe(3);
  });
  it('sí/no y escala', () => {
    expect(levelFor({ type: 'boolean', dailyGoal: null }, 1, 1)).toBe(4);
    expect(levelFor({ type: 'boolean', dailyGoal: null }, 0, 1)).toBe(1);
    expect(levelFor({ type: 'scale', dailyGoal: null }, 1, 5)).toBe(1);
    expect(levelFor({ type: 'scale', dailyGoal: null }, 5, 5)).toBe(4);
  });
});

describe('buildHeatmap', () => {
  it('genera 53 semanas de lunes a domingo terminando en la semana de hoy', () => {
    const hm = buildHeatmap({ type: 'counter', dailyGoal: null }, new Map(), '2026-10-24');
    expect(hm.weeks).toHaveLength(53);
    expect(hm.weeks.every((w) => w.length === 7)).toBe(true);
    const last = hm.weeks[52];
    expect(last?.[0]?.date).toBe('2026-10-19');
    expect(last?.[5]).toMatchObject({ date: '2026-10-24', future: false });
    expect(last?.[6]).toMatchObject({ date: '2026-10-25', future: true });
    expect(hm.weeks[0]?.[0]?.date).toBe('2025-10-20');
  });

  it('asigna valores y etiqueta meses', () => {
    const totals = new Map([
      ['2026-10-24', 4],
      ['2026-10-20', 2],
    ]);
    const hm = buildHeatmap({ type: 'counter', dailyGoal: null }, totals, '2026-10-24', 4);
    const cells = hm.weeks.flat();
    expect(cells.find((c) => c.date === '2026-10-24')).toMatchObject({ value: 4, level: 4 });
    expect(cells.find((c) => c.date === '2026-10-20')).toMatchObject({ value: 2, level: 2 });
    expect(hm.months.map((m) => m.date.slice(0, 7))).toEqual(['2026-09', '2026-10']);
  });
});
