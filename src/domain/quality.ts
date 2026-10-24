import { addDays, daysBetween } from './dates';

export interface Coverage {
  days: number;
  daysWithData: number;
  ratio: number;
}

/** Días con registros en los últimos `days` días (incluye hoy). */
export function coverage(totals: Map<string, number>, todayDate: string, days: number): Coverage {
  const from = addDays(todayDate, -(days - 1));
  let daysWithData = 0;
  for (const date of totals.keys()) if (date >= from && date <= todayDate) daysWithData++;
  return { days, daysWithData, ratio: daysWithData / days };
}

export interface Gap {
  from: string;
  to: string;
  length: number;
}

/**
 * Racha más larga de días sin registros entre el primer registro y hoy.
 * Los días antes del primer registro no cuentan (el rastreador aún no existía).
 */
export function longestGap(totals: Map<string, number>, todayDate: string): Gap | null {
  const dates = [...totals.keys()].filter((d) => d <= todayDate).sort();
  if (dates.length === 0) return null;
  let best: Gap | null = null;
  const consider = (prev: string, next: string) => {
    const length = daysBetween(prev, next) - 1;
    if (length > 0 && (!best || length > best.length))
      best = { from: addDays(prev, 1), to: addDays(next, -1), length };
  };
  for (let i = 1; i < dates.length; i++) consider(dates[i - 1] as string, dates[i] as string);
  // Hueco abierto desde el último registro hasta ayer (hoy aún puede registrarse).
  consider(dates[dates.length - 1] as string, todayDate);
  return best;
}
