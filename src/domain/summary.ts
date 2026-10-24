import { isDayDone } from './aggregate';
import { withGoalAt } from './goalHistory';
import { addDays, addMonths, daysBetween, startOfMonth, startOfWeek } from './dates';
import type { Tracker } from './types';

export type SummaryPeriod = 'week' | 'month';

export interface PeriodStats {
  from: string;
  to: string;
  /** Total (contador/cantidad), días con «Sí» (sí/no) o promedio (escala). Null sin datos. */
  value: number | null;
  daysWithData: number;
  /** Días que cumplieron la meta (o con registro si no hay meta). */
  daysDone: number;
}

export interface PeriodComparison {
  current: PeriodStats;
  previous: PeriodStats;
  /** Días transcurridos del periodo actual (incluye hoy). */
  elapsedDays: number;
  /** Diferencia absoluta (actual − anterior), null si falta alguno. */
  delta: number | null;
  /** Cambio relativo en %, solo para contador/cantidad/sí-no con base > 0. */
  percent: number | null;
}

function statsFor(
  tracker: Pick<Tracker, 'type' | 'dailyGoal' | 'goalDirection' | 'goalChanges'>,
  totals: Map<string, number>,
  from: string,
  to: string,
): PeriodStats {
  let sum = 0;
  let daysWithData = 0;
  let daysDone = 0;
  let yes = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const v = totals.get(d);
    if (v === undefined) continue;
    daysWithData++;
    sum += v;
    if (v >= 1) yes++;
    if (isDayDone(withGoalAt(tracker, d), v)) daysDone++;
  }
  let value: number | null = null;
  if (daysWithData > 0) {
    value = tracker.type === 'scale' ? sum / daysWithData : tracker.type === 'boolean' ? yes : sum;
  }
  return { from, to, value, daysWithData, daysDone };
}

/**
 * Compara el periodo en curso (de lunes o del día 1 hasta hoy) con el mismo
 * número de días del periodo anterior, para que la comparación sea justa a mitad de semana o mes.
 */
export function comparePeriods(
  tracker: Pick<Tracker, 'type' | 'dailyGoal' | 'goalDirection' | 'goalChanges'>,
  totals: Map<string, number>,
  todayDate: string,
  period: SummaryPeriod,
): PeriodComparison {
  const from = period === 'week' ? startOfWeek(todayDate) : startOfMonth(todayDate);
  const elapsedDays = daysBetween(from, todayDate) + 1;
  const prevFrom = period === 'week' ? addDays(from, -7) : addMonths(from, -1);
  // En meses, el anterior puede ser más corto (31 de marzo → 28 de febrero).
  const prevTo =
    period === 'week'
      ? addDays(prevFrom, elapsedDays - 1)
      : minDate(addDays(prevFrom, elapsedDays - 1), addDays(from, -1));
  const current = statsFor(tracker, totals, from, todayDate);
  const previous = statsFor(tracker, totals, prevFrom, prevTo);
  const delta =
    current.value !== null && previous.value !== null ? current.value - previous.value : null;
  const percent =
    delta !== null && tracker.type !== 'scale' && previous.value !== null && previous.value > 0
      ? (delta / previous.value) * 100
      : null;
  return { current, previous, elapsedDays, delta, percent };
}

function minDate(a: string, b: string): string {
  return a < b ? a : b;
}
