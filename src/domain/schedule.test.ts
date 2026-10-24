import { describe, expect, it } from 'vitest';
import { describeSchedule, isScheduled } from './schedule';
import { computeStreaks } from './streaks';

describe('días de la semana', () => {
  it('sin horario aplica siempre', () => {
    expect(isScheduled({}, '2026-10-24')).toBe(true);
    expect(isScheduled({ activeDays: [] }, '2026-10-24')).toBe(true);
  });

  it('solo aplica en los días marcados', () => {
    const gym = { activeDays: [0, 2, 4] }; // lunes, miércoles, viernes
    expect(isScheduled(gym, '2026-10-19')).toBe(true); // lunes
    expect(isScheduled(gym, '2026-10-20')).toBe(false); // martes
    expect(describeSchedule([4, 0, 2])).toBe('L, X, V');
  });

  it('los días libres no rompen la racha', () => {
    const gym = { type: 'boolean' as const, dailyGoal: null, activeDays: [0, 2, 4] };
    // Lunes 12, miércoles 14, viernes 16, lunes 19 cumplidos: martes, jueves y fin de semana libres.
    const totals = new Map(
      ['2026-10-12', '2026-10-14', '2026-10-16', '2026-10-19'].map((d) => [d, 1]),
    );
    expect(computeStreaks(gym, totals, '2026-10-20')).toEqual({
      current: 4,
      longest: 4,
      doneDays: 4,
    });
    // Faltar el miércoles 21 (día programado) la rompe.
    expect(computeStreaks(gym, totals, '2026-10-22').current).toBe(0);
    expect(computeStreaks(gym, totals, '2026-10-22').longest).toBe(4);
  });

  it('hoy sin cumplir no rompe la racha', () => {
    const gym = { type: 'boolean' as const, dailyGoal: null, activeDays: [0, 2, 4] };
    const totals = new Map([['2026-10-19', 1]]);
    expect(computeStreaks(gym, totals, '2026-10-21').current).toBe(1); // miércoles, aún no registra
  });
});
