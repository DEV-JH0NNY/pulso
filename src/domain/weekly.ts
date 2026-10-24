import { isDayDone } from './aggregate';
import { withGoalAt } from './goalHistory';
import { addDays, startOfWeek } from './dates';
import type { Tracker } from './types';

type WeeklyTracker = Pick<
  Tracker,
  'type' | 'dailyGoal' | 'goalDirection' | 'weeklyTarget' | 'goalChanges'
>;

/** Días cumplidos (ver `isDayDone`) en la semana de lunes a domingo que empieza en `weekStart`. */
function doneInWeek(
  tracker: WeeklyTracker,
  totals: Map<string, number>,
  weekStart: string,
  upTo: string,
) {
  let done = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i);
    if (d > upTo) break;
    if (isDayDone(withGoalAt(tracker, d), totals.get(d) ?? null)) done++;
  }
  return done;
}

export interface WeekProgress {
  done: number;
  target: number;
  met: boolean;
}

/** Progreso de la semana en curso frente a la meta semanal (null si no tiene). */
export function weekProgress(
  tracker: WeeklyTracker,
  totals: Map<string, number>,
  todayDate: string,
): WeekProgress | null {
  const target = tracker.weeklyTarget ?? null;
  if (target === null) return null;
  const done = doneInWeek(tracker, totals, startOfWeek(todayDate), todayDate);
  return { done, target, met: done >= target };
}

/**
 * Semanas seguidas cumpliendo la meta semanal. La semana en curso suma si ya
 * se cumplió, pero no rompe la racha si aún no (todavía quedan días).
 */
export function weeklyStreak(
  tracker: WeeklyTracker,
  totals: Map<string, number>,
  todayDate: string,
): number {
  const target = tracker.weeklyTarget ?? null;
  if (target === null) return 0;
  let week = startOfWeek(todayDate);
  let streak = 0;
  if (doneInWeek(tracker, totals, week, todayDate) >= target) streak++;
  // Límite de seguridad: diez años de semanas.
  for (let i = 0; i < 520; i++) {
    week = addDays(week, -7);
    if (doneInWeek(tracker, totals, week, todayDate) >= target) streak++;
    else break;
  }
  return streak;
}
