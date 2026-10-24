import { isDayDone } from './aggregate';
import { addDays, daysBetween } from './dates';
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
  tracker: Pick<Tracker, 'type' | 'dailyGoal'>,
  totals: Map<string, number>,
  todayDate: string,
): Streaks {
  const done = [...totals.entries()]
    .filter(([date, v]) => date <= todayDate && isDayDone(tracker, v))
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
