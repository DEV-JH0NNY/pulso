import { describe, expect, it } from 'vitest';
import { dailyTotals, dailyValue, isDayDone, progressFor, summarizeDay } from './aggregate';

describe('valor diario', () => {
  it('suma contadores y cantidades', () => {
    expect(dailyValue('counter', [1, 2, 3])).toBe(6);
    expect(dailyValue('quantity', [1.5, 2])).toBe(3.5);
  });
  it('sí/no vale 1 si hubo algún sí', () => {
    expect(dailyValue('boolean', [0, 1])).toBe(1);
    expect(dailyValue('boolean', [0])).toBe(0);
  });
  it('la escala promedia', () => {
    expect(dailyValue('scale', [2, 4, 5])).toBeCloseTo(11 / 3);
  });
  it('sin registros es null', () => {
    expect(dailyValue('counter', [])).toBeNull();
  });
});

describe('totales diarios', () => {
  it('agrupa por fecha e ignora otros rastreadores', () => {
    const totals = dailyTotals({ id: 't1', type: 'counter' }, [
      { trackerId: 't1', date: '2026-01-01', value: 1 },
      { trackerId: 't1', date: '2026-01-01', value: 2 },
      { trackerId: 't2', date: '2026-01-01', value: 9 },
      { trackerId: 't1', date: '2026-01-02', value: 4 },
    ]);
    expect(Object.fromEntries(totals)).toEqual({ '2026-01-01': 3, '2026-01-02': 4 });
  });
});

describe('progreso', () => {
  it('sin meta no hay razón', () => {
    expect(progressFor({ type: 'counter', dailyGoal: null }, 3)).toEqual({
      value: 3,
      ratio: null,
      met: false,
    });
  });
  it('calcula la fracción y la limita a 1', () => {
    expect(progressFor({ type: 'quantity', dailyGoal: 8 }, 4).ratio).toBe(0.5);
    expect(progressFor({ type: 'quantity', dailyGoal: 8 }, 10)).toMatchObject({
      ratio: 1,
      met: true,
    });
    expect(progressFor({ type: 'quantity', dailyGoal: 8 }, null).ratio).toBe(0);
  });
  it('en escala parte de 1', () => {
    expect(progressFor({ type: 'scale', dailyGoal: 5 }, 3).ratio).toBe(0.5);
    expect(progressFor({ type: 'scale', dailyGoal: 4 }, 4).met).toBe(true);
  });
  it('día cumplido con y sin meta', () => {
    expect(isDayDone({ type: 'counter', dailyGoal: null }, 1)).toBe(true);
    expect(isDayDone({ type: 'counter', dailyGoal: null }, null)).toBe(false);
    expect(isDayDone({ type: 'boolean', dailyGoal: null }, 0)).toBe(false);
    expect(isDayDone({ type: 'counter', dailyGoal: 3 }, 2)).toBe(false);
    expect(isDayDone({ type: 'counter', dailyGoal: 3 }, 3)).toBe(true);
  });
});

describe('resumen del día', () => {
  it('cuenta metas cumplidas y rastreadores registrados', () => {
    const trackers = [
      { id: 'a', type: 'counter' as const, dailyGoal: 2 },
      { id: 'b', type: 'boolean' as const, dailyGoal: 1 },
      { id: 'c', type: 'scale' as const, dailyGoal: null },
      { id: 'd', type: 'quantity' as const, dailyGoal: 8 },
    ];
    const values = new Map([
      ['a', 3],
      ['b', 0],
      ['c', 4],
    ]);
    expect(summarizeDay(trackers, values)).toEqual({ withGoal: 3, met: 1, logged: 3 });
  });
});
