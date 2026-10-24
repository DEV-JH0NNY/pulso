import { describe, expect, it } from 'vitest';
import { weekProgress, weeklyStreak } from './weekly';

const gym = { type: 'boolean' as const, dailyGoal: null, weeklyTarget: 3 };
const map = (dates: string[], v = 1) => new Map(dates.map((d) => [d, v]));

describe('metas semanales', () => {
  it('sin meta semanal no hay progreso', () => {
    expect(weekProgress({ ...gym, weeklyTarget: null }, new Map(), '2026-10-24')).toBeNull();
  });

  it('cuenta los días cumplidos de la semana en curso', () => {
    // Semana del lunes 19 de octubre de 2026.
    const totals = map(['2026-10-19', '2026-10-21', '2026-10-18']);
    expect(weekProgress(gym, totals, '2026-10-22')).toEqual({ done: 2, target: 3, met: false });
    totals.set('2026-10-22', 1);
    expect(weekProgress(gym, totals, '2026-10-22')?.met).toBe(true);
    totals.set('2026-10-23', 0); // un «No» no cuenta
    expect(weekProgress(gym, totals, '2026-10-23')?.done).toBe(3);
  });

  it('racha de semanas: la semana en curso no la rompe', () => {
    const totals = map([
      // semana del 5: 3 días
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      // semana del 12: 3 días
      '2026-10-12',
      '2026-10-14',
      '2026-10-16',
      // semana del 19 (en curso): 1 día
      '2026-10-19',
    ]);
    expect(weeklyStreak(gym, totals, '2026-10-20')).toBe(2);
    totals.set('2026-10-20', 1);
    totals.set('2026-10-21', 1);
    expect(weeklyStreak(gym, totals, '2026-10-21')).toBe(3);
  });
});
