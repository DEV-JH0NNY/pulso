import { isValidISODate, isValidTime } from './dates';
import { TRACKER_TYPES, type Entry, type Tracker } from './types';
import { validateEntryValue, validateTrackerDraft } from './trackers';

export const BACKUP_FORMAT = 1;

export interface Backup {
  app: 'pulso';
  format: typeof BACKUP_FORMAT;
  exportedAt: string;
  trackers: Tracker[];
  entries: Entry[];
}

export function createBackup(trackers: Tracker[], entries: Entry[], now = new Date()): Backup {
  return { app: 'pulso', format: BACKUP_FORMAT, exportedAt: now.toISOString(), trackers, entries };
}

export type BackupResult = { ok: true; backup: Backup } | { ok: false; error: string };

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === 'string';
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function parseTracker(raw: unknown, i: number): Tracker | string {
  const where = `Rastreador #${i + 1}`;
  if (!isObject(raw)) return `${where}: no es un objeto.`;
  const {
    id,
    name,
    icon,
    color,
    type,
    unit,
    defaultValue,
    dailyGoal,
    archived,
    order,
    createdAt,
    isSample,
  } = raw;
  if (!isString(id) || !id) return `${where}: falta el id.`;
  if (!isString(name) || !isString(icon) || !isString(color) || !isString(unit))
    return `${where}: faltan nombre, ícono, color o unidad.`;
  if (!isString(type) || !(TRACKER_TYPES as readonly string[]).includes(type))
    return `${where} («${name}»): tipo «${String(type)}» desconocido.`;
  if (!isNumber(defaultValue) || (dailyGoal !== null && !isNumber(dailyGoal)))
    return `${where} («${name}»): valor por defecto o meta inválidos.`;
  const tracker: Tracker = {
    id,
    name,
    icon,
    color,
    type: type as Tracker['type'],
    unit,
    defaultValue,
    dailyGoal: dailyGoal as number | null,
    ...(raw.goalDirection === 'atMost' ? { goalDirection: 'atMost' as const } : {}),
    archived: archived === true,
    order: isNumber(order) ? order : i,
    createdAt: isNumber(createdAt) ? createdAt : 0,
    isSample: isSample === true,
  };
  const errors = Object.values(validateTrackerDraft(tracker));
  if (errors.length > 0) return `${where} («${name}»): ${errors.join(' ')}`;
  return tracker;
}

function parseEntry(raw: unknown, i: number, trackers: Map<string, Tracker>): Entry | string {
  const where = `Registro #${i + 1}`;
  if (!isObject(raw)) return `${where}: no es un objeto.`;
  const { id, trackerId, value, date, time, note, createdAt, isSample } = raw;
  if (!isString(id) || !id) return `${where}: falta el id.`;
  const tracker = isString(trackerId) ? trackers.get(trackerId) : undefined;
  if (!tracker) return `${where}: su rastreador no está en el respaldo.`;
  if (!isString(date) || !isValidISODate(date)) return `${where}: fecha inválida.`;
  if (!isString(time) || !isValidTime(time)) return `${where}: hora inválida.`;
  if (!isNumber(value)) return `${where}: valor inválido.`;
  const valueError = validateEntryValue(tracker.type, value);
  if (valueError) return `${where} («${tracker.name}», ${date}): ${valueError}`;
  return {
    id,
    trackerId: tracker.id,
    value,
    date,
    time,
    note: isString(note) ? note : '',
    createdAt: isNumber(createdAt) ? createdAt : 0,
    isSample: isSample === true,
  };
}

/** Lee y valida un respaldo JSON. Rechaza el archivo completo ante el primer error. */
export function parseBackup(text: string): BackupResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'El archivo no es un JSON válido.' };
  }
  if (!isObject(data) || data.app !== 'pulso')
    return { ok: false, error: 'El archivo no es un respaldo de Pulso.' };
  if (data.format !== BACKUP_FORMAT)
    return { ok: false, error: `Versión de respaldo no soportada (${String(data.format)}).` };
  if (!Array.isArray(data.trackers) || !Array.isArray(data.entries))
    return { ok: false, error: 'Al respaldo le faltan los rastreadores o los registros.' };

  const trackers: Tracker[] = [];
  for (const [i, raw] of data.trackers.entries()) {
    const t = parseTracker(raw, i);
    if (typeof t === 'string') return { ok: false, error: t };
    trackers.push(t);
  }
  const byId = new Map(trackers.map((t) => [t.id, t]));
  if (byId.size !== trackers.length)
    return { ok: false, error: 'Hay rastreadores con id repetido.' };

  const entries: Entry[] = [];
  for (const [i, raw] of data.entries.entries()) {
    const e = parseEntry(raw, i, byId);
    if (typeof e === 'string') return { ok: false, error: e };
    entries.push(e);
  }
  return {
    ok: true,
    backup: {
      app: 'pulso',
      format: BACKUP_FORMAT,
      exportedAt: isString(data.exportedAt) ? data.exportedAt : '',
      trackers,
      entries,
    },
  };
}
