import { toISODate, toTime } from '../domain/dates';
import type { Entry, Tracker } from '../domain/types';
import { addEntry } from './entries';

/**
 * Registra el valor por defecto del rastreador con la fecha y hora actuales
 * (o en `date`, con la hora actual, cuando se registra un día anterior).
 * Devuelve null cuando no tiene sentido registrar (un sí/no que ya está en "Sí" hoy).
 */
export async function quickLog(
  tracker: Tracker,
  todayValue: number | null,
  now: Date = new Date(),
  date: string = toISODate(now),
): Promise<Entry | null> {
  if (tracker.type === 'boolean' && tracker.defaultValue === 1 && todayValue === 1) return null;
  return addEntry(tracker.id, {
    value: tracker.defaultValue,
    date,
    time: toTime(now),
    note: '',
  });
}
