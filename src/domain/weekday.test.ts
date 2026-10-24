import { describe, expect, it } from 'vitest';
import { weekdayExtremes, weekdayProfile } from './weekday';

describe('perfil por día de la semana', () => {
  it('promedia por día usando solo días con datos', () => {
    const totals = new Map([
      ['2026-10-19', 2], // lunes
      ['2026-10-26', 4], // lunes
      ['2026-10-24', 10], // sábado
    ]);
    const p = weekdayProfile({ type: 'counter' }, totals);
    expect(p[0]).toEqual({ weekday: 0, average: 3, days: 2 });
    expect(p[5]).toEqual({ weekday: 5, average: 10, days: 1 });
    expect(p[2]).toEqual({ weekday: 2, average: null, days: 0 });
    expect(weekdayExtremes(p)).toMatchObject({ best: { weekday: 5 }, worst: { weekday: 0 } });
  });

  it('en sí/no da la fracción de días con sí', () => {
    const totals = new Map([
      ['2026-10-19', 1],
      ['2026-10-26', 0],
    ]);
    expect(weekdayProfile({ type: 'boolean' }, totals)[0]?.average).toBe(0.5);
  });

  it('sin variación no hay extremos', () => {
    expect(
      weekdayExtremes(weekdayProfile({ type: 'counter' }, new Map([['2026-10-19', 1]]))),
    ).toBeNull();
  });
});
