import { isDayDone } from './aggregate';
import { withGoalAt } from './goalHistory';
import { addDays, daysBetween } from './dates';
import { isScheduled } from './schedule';
import type { Tracker } from './types';

export interface Streaks {
  /** Días seguidos cumplidos hasta hoy (o hasta ayer si hoy aún no se cumple). */
  current: number;
  longest: number;
  /** Total de días cumplidos. */
  doneDays: number;
}

/**
 * Calcula rachas a partir de los valores diarios. Un día "cumplido" es el que
 * alcanza la meta o, si no hay meta, el que tiene registros (un "sí" en sí/no).
 * La racha actual no se rompe por hoy: el día todavía no termina.
 */
export function computeStreaks(
  tracker: Pick<Tracker, 'type' | 'dailyGoal' | 'goalDirection' | 'activeDays' | 'goalChanges'>,
  totals: Map<string, number>,
  todayDate: string,
): Streaks {
  if (tracker.activeDays && tracker.activeDays.length > 0)
    return scheduledStreaks(tracker, totals, todayDate);
  const done = [...totals.entries()]
    .filter(([date, v]) => date <= todayDate && isDayDone(withGoalAt(tracker, date), v))
    .map(([date]) => date)
    .sort();
  const doneSet = new Set(done);

  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const date of done) {
    run = prev !== null && daysBetween(prev, date) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = date;
  }

  let current = 0;
  let cursor = doneSet.has(todayDate) ? todayDate : addDays(todayDate, -1);
  while (doneSet.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }

  return { current, longest, doneDays: done.length };
}

/**
 * Rachas para rastreadores con días de la semana: los días que no aplican se
 * saltan (ni suman ni rompen). Un día programado sin cumplir rompe la racha,
 * salvo hoy, que todavía no termina.
 */
function scheduledStreaks(
  tracker: Pick<Tracker, 'type' | 'dailyGoal' | 'goalDirection' | 'activeDays' | 'goalChanges'>,
  totals: Map<string, number>,
  todayDate: string,
): Streaks {
  const dates = [...totals.keys()].filter((d) => d <= todayDate).sort();
  const first = dates[0];
  if (!first) return { current: 0, longest: 0, doneDays: 0 };
  let run = 0;
  let longest = 0;
  let doneDays = 0;
  let current = 0;
  for (let d = first; d <= todayDate; d = addDays(d, 1)) {
    const done = isDayDone(withGoalAt(tracker, d), totals.get(d) ?? null);
    if (done) doneDays++;
    // Un día libre con registro cumplido también suma, pero nunca rompe la racha.
    if (done) run++;
    else if (isScheduled(tracker, d) && d !== todayDate) run = 0;
    longest = Math.max(longest, run);
    current = run;
  }
  return { current, longest, doneDays };
}
