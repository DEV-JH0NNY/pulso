import { addDays } from './dates';
import type { GoalDirection, Tracker } from './types';

/** Meta que tuvo un rastreador hasta cierta fecha (incluida). */
export interface GoalChange {
  until: string;
  dailyGoal: number | null;
  goalDirection?: GoalDirection;
}

type GoalFields = Pick<Tracker, 'dailyGoal' | 'goalDirection' | 'goalChanges'>;

/**
 * El rastreador con la meta que tenía en `date`. Sin cambios registrados, o
 * para fechas posteriores al último cambio, es la meta actual.
 */
export function withGoalAt<T extends GoalFields>(tracker: T, date: string): T {
  const changes = tracker.goalChanges;
  if (!changes || changes.length === 0) return tracker;
  const change = changes.find((c) => date <= c.until);
  if (!change) return tracker;
  const out = { ...tracker, dailyGoal: change.dailyGoal };
  if (change.goalDirection) out.goalDirection = change.goalDirection;
  else delete out.goalDirection;
  return out;
}

const sameGoal = (a: GoalFields, b: GoalFields) =>
  a.dailyGoal === b.dailyGoal && (a.goalDirection ?? 'atLeast') === (b.goalDirection ?? 'atLeast');

/**
 * Historial actualizado al cambiar la meta en `todayDate`: la meta anterior
 * queda vigente hasta ayer. Si la meta no cambió, el historial sigue igual.
 */
export function recordGoalChange(
  previous: GoalFields,
  next: GoalFields,
  todayDate: string,
): GoalChange[] {
  const history = [...(previous.goalChanges ?? [])];
  if (sameGoal(previous, next)) return history;
  const until = addDays(todayDate, -1);
  // Varios cambios el mismo día: solo cuenta la meta que tenía antes de hoy.
  if (history.some((c) => c.until === until)) return history;
  const change: GoalChange = { until, dailyGoal: previous.dailyGoal };
  if (previous.goalDirection === 'atMost') change.goalDirection = 'atMost';
  return [...history, change].sort((a, b) => (a.until < b.until ? -1 : 1));
}
