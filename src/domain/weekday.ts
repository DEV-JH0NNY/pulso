import { weekdayIndex } from './dates';
import type { Tracker } from './types';

export const WEEKDAY_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;
export const WEEKDAY_NAMES = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
] as const;

export interface WeekdayStat {
  /** 0 = lunes … 6 = domingo. */
  weekday: number;
  /** Promedio del valor diario (en sí/no, fracción de días con «Sí»). Null sin datos. */
  average: number | null;
  days: number;
}

/** Promedio por día de la semana usando solo los días con registros. */
export function weekdayProfile(
  tracker: Pick<Tracker, 'type'>,
  totals: Map<string, number>,
): WeekdayStat[] {
  const sums = Array<number>(7).fill(0);
  const counts = Array<number>(7).fill(0);
  for (const [date, v] of totals) {
    const w = weekdayIndex(date);
    sums[w] = (sums[w] ?? 0) + (tracker.type === 'boolean' ? (v >= 1 ? 1 : 0) : v);
    counts[w] = (counts[w] ?? 0) + 1;
  }
  return sums.map((sum, weekday) => {
    const days = counts[weekday] ?? 0;
    return { weekday, average: days > 0 ? sum / days : null, days };
  });
}

/** Día con el promedio más alto y más bajo (si hay al menos dos días con datos). */
export function weekdayExtremes(
  stats: WeekdayStat[],
): { best: WeekdayStat; worst: WeekdayStat } | null {
  const withData = stats.filter((s) => s.average !== null);
  if (withData.length < 2) return null;
  const sorted = [...withData].sort((a, b) => (b.average as number) - (a.average as number));
  const best = sorted[0] as WeekdayStat;
  const worst = sorted[sorted.length - 1] as WeekdayStat;
  return best.average === worst.average ? null : { best, worst };
}
