import { weekdayIndex } from './dates';
import type { Tracker } from './types';

/** ¿El rastreador aplica en esa fecha? Sin días configurados aplica todos los días. */
export function isScheduled(tracker: Pick<Tracker, 'activeDays'>, date: string): boolean {
  const days = tracker.activeDays;
  return !days || days.length === 0 || days.includes(weekdayIndex(date));
}

/** "L, X, V" a partir de los días configurados (lunes = 0). */
export function describeSchedule(days: number[]): string {
  const short = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  return [...days]
    .sort((a, b) => a - b)
    .map((d) => short[d])
    .join(', ');
}
