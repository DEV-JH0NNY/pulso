import type { Entry, Tracker, TrackerType } from './types';

/**
 * Valor diario de un rastreador a partir de sus registros del día:
 * contador y cantidad suman, sí/no vale 1 si hubo algún "sí", la escala promedia.
 */
export function dailyValue(type: TrackerType, values: number[]): number | null {
  if (values.length === 0) return null;
  switch (type) {
    case 'counter':
    case 'quantity':
      return values.reduce((a, b) => a + b, 0);
    case 'boolean':
      return values.some((v) => v >= 1) ? 1 : 0;
    case 'scale':
      return values.reduce((a, b) => a + b, 0) / values.length;
  }
}

/** Mapa fecha → valor diario de un rastreador. */
export function dailyTotals(
  tracker: Pick<Tracker, 'id' | 'type'>,
  entries: Pick<Entry, 'trackerId' | 'date' | 'value'>[],
): Map<string, number> {
  const byDate = new Map<string, number[]>();
  for (const e of entries) {
    if (e.trackerId !== tracker.id) continue;
    const list = byDate.get(e.date);
    if (list) list.push(e.value);
    else byDate.set(e.date, [e.value]);
  }
  const out = new Map<string, number>();
  for (const [date, values] of byDate) {
    const v = dailyValue(tracker.type, values);
    if (v !== null) out.set(date, v);
  }
  return out;
}

export interface Progress {
  /** Valor del día (null si no hay registros). */
  value: number | null;
  /** Fracción de la meta cumplida, entre 0 y 1 (null si no hay meta). */
  ratio: number | null;
  met: boolean;
}

/** Progreso de un valor diario frente a la meta del rastreador. */
export function progressFor(
  tracker: Pick<Tracker, 'type' | 'dailyGoal'>,
  value: number | null,
): Progress {
  const goal = tracker.dailyGoal;
  if (goal === null || goal <= 0) return { value, ratio: null, met: false };
  if (value === null) return { value, ratio: 0, met: false };
  if (tracker.type === 'scale') {
    // En escala la meta es un promedio mínimo: el progreso parte de 1 (el mínimo posible).
    const ratio = goal <= 1 ? 1 : Math.min(1, Math.max(0, (value - 1) / (goal - 1)));
    return { value, ratio, met: value >= goal };
  }
  const ratio = Math.min(1, Math.max(0, value / goal));
  return { value, ratio, met: value >= goal };
}

/** ¿El día cuenta como "cumplido" para rachas y calendario? */
export function isDayDone(
  tracker: Pick<Tracker, 'type' | 'dailyGoal'>,
  value: number | null,
): boolean {
  if (value === null) return false;
  if (tracker.dailyGoal !== null && tracker.dailyGoal > 0) return progressFor(tracker, value).met;
  // Sin meta: cuenta haber registrado (en sí/no, haber respondido "sí").
  return tracker.type === 'boolean' ? value >= 1 : true;
}
