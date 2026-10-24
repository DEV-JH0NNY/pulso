import { toISODate, toTime } from '../domain/dates';
import type { Entry, Tracker } from '../domain/types';
import { addEntry } from './entries';

/**
 * Registra el valor por defecto del rastreador con la fecha y hora actuales.
 * Devuelve null cuando no tiene sentido registrar (un sí/no que ya está en "Sí" hoy).
 */
export async function quickLog(
  tracker: Tracker,
  todayValue: number | null,
  now: Date = new Date(),
): Promise<Entry | null> {
  if (tracker.type === 'boolean' && tracker.defaultValue === 1 && todayValue === 1) return null;
  return addEntry(tracker.id, {
    value: tracker.defaultValue,
    date: toISODate(now),
    time: toTime(now),
    note: '',
  });
}
