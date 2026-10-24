import { describe, expect, it } from 'vitest';
import { recordGoalChange, withGoalAt } from './goalHistory';
import { computeStreaks } from './streaks';

describe('historial de metas', () => {
  it('registra la meta anterior hasta ayer', () => {
    const h = recordGoalChange({ dailyGoal: 2 }, { dailyGoal: 3 }, '2026-10-24');
    expect(h).toEqual([{ until: '2026-10-23', dailyGoal: 2 }]);
  });

  it('no registra nada si la meta no cambió y conserva el primer valor del día', () => {
    expect(
      recordGoalChange({ dailyGoal: 2 }, { dailyGoal: 2, goalDirection: 'atLeast' }, '2026-10-24'),
    ).toEqual([]);
    const once = recordGoalChange({ dailyGoal: 2 }, { dailyGoal: 3 }, '2026-10-24');
    const twice = recordGoalChange(
      { dailyGoal: 3, goalChanges: once },
      { dailyGoal: 5 },
      '2026-10-24',
    );
    expect(twice).toEqual(once);
  });

  it('devuelve la meta vigente en cada fecha', () => {
    const t = {
      dailyGoal: 5,
      goalChanges: [
        { until: '2026-01-31', dailyGoal: 2 },
        { until: '2026-02-28', dailyGoal: 3, goalDirection: 'atMost' as const },
      ],
    };
    expect(withGoalAt(t, '2026-01-15').dailyGoal).toBe(2);
    expect(withGoalAt(t, '2026-02-10')).toMatchObject({ dailyGoal: 3, goalDirection: 'atMost' });
    expect(withGoalAt(t, '2026-03-01').dailyGoal).toBe(5);
  });

  it('las rachas pasadas no cambian al subir la meta', () => {
    const totals = new Map([
      ['2026-10-21', 2],
      ['2026-10-22', 2],
      ['2026-10-23', 2],
    ]);
    const before = { type: 'counter' as const, dailyGoal: 2 };
    expect(computeStreaks(before, totals, '2026-10-24').current).toBe(3);
    const after = {
      ...before,
      dailyGoal: 4,
      goalChanges: recordGoalChange(before, { dailyGoal: 4 }, '2026-10-24'),
    };
    expect(computeStreaks(after, totals, '2026-10-24').current).toBe(3);
  });
});
