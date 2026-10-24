import { describe, expect, it } from 'vitest';
import { buildSeries, niceMax, seriesMeaning, summarizeSeries } from './series';

const map = (obj: Record<string, number>) => new Map(Object.entries(obj));

describe('series', () => {
  it('vista diaria: un punto por día terminando hoy', () => {
    const s = buildSeries(
      { type: 'counter', dailyGoal: null },
      map({ '2026-10-24': 3, '2026-10-22': 1, '2026-09-01': 9 }),
      '2026-10-24',
      'day',
      3,
    );
    expect(s).toEqual([
      { start: '2026-10-22', value: 1, daysWithData: 1 },
      { start: '2026-10-23', value: null, daysWithData: 0 },
      { start: '2026-10-24', value: 3, daysWithData: 1 },
    ]);
  });

  it('vista semanal suma contadores por semana (lunes a domingo)', () => {
    const s = buildSeries(
      { type: 'quantity', dailyGoal: null },
      map({ '2026-10-12': 1, '2026-10-18': 2, '2026-10-19': 4 }),
      '2026-10-24',
      'week',
      2,
    );
    expect(s.map((p) => [p.start, p.value, p.daysWithData])).toEqual([
      ['2026-10-12', 3, 2],
      ['2026-10-19', 4, 1],
    ]);
  });

  it('vista mensual cuenta días con sí y promedia escalas', () => {
    const totals = map({ '2026-09-03': 1, '2026-09-04': 0, '2026-10-01': 1, '2026-10-02': 1 });
    const bool = buildSeries(
      { type: 'boolean', dailyGoal: null },
      totals,
      '2026-10-24',
      'month',
      2,
    );
    expect(bool.map((p) => p.value)).toEqual([1, 2]);
    const scale = buildSeries(
      { type: 'scale', dailyGoal: null },
      map({ '2026-10-01': 2, '2026-10-02': 4 }),
      '2026-10-24',
      'month',
      1,
    );
    expect(scale[0]?.value).toBe(3);
  });

  it('resume la serie', () => {
    expect(
      summarizeSeries([
        { start: 'a', value: 2, daysWithData: 1 },
        { start: 'b', value: null, daysWithData: 0 },
        { start: 'c', value: 4, daysWithData: 1 },
      ]),
    ).toEqual({ average: 3, max: 4, total: 6, periodsWithData: 2 });
    expect(summarizeSeries([]).average).toBeNull();
  });

  it('calcula máximos redondos', () => {
    expect(niceMax(0)).toBe(1);
    expect(niceMax(7)).toBe(10);
    expect(niceMax(4.2)).toBe(5);
    expect(niceMax(1.8)).toBe(2);
    expect(niceMax(23000)).toBe(25000);
    expect(niceMax(100)).toBe(100);
  });

  it('describe qué significa cada valor', () => {
    expect(seriesMeaning('boolean', 'week')).toBe('Días con «Sí» en la semana');
    expect(seriesMeaning('quantity', 'day')).toBe('Total del día');
    expect(seriesMeaning('scale', 'month')).toBe('Promedio del mes');
  });
});
