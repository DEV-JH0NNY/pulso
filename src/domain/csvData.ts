import { parseCsv, toCsv } from './csv';
import { isValidISODate } from './dates';
import { parseDecimal } from './format';
import { NAME_MAX_LENGTH, validateEntryValue } from './trackers';
import type { Entry, Tracker, TrackerType } from './types';

/** Columnas del formato largo, en orden. */
export const CSV_COLUMNS = ['fecha', 'hora', 'rastreador', 'valor', 'unidad', 'nota'] as const;
const REQUIRED_COLUMNS = ['fecha', 'hora', 'rastreador', 'valor'] as const;

/** Unidades especiales que permiten reconstruir el tipo al importar. */
const BOOLEAN_UNIT = 'sí/no';
const SCALE_UNIT = '1-5';

/** Unidad que se escribe en el CSV para un rastreador. */
export function csvUnit(t: Pick<Tracker, 'type' | 'unit'>): string {
  if (t.type === 'boolean') return BOOLEAN_UNIT;
  if (t.type === 'scale') return SCALE_UNIT;
  return t.unit;
}

const normalizeName = (s: string) => s.trim().toLocaleLowerCase('es-CO');
const normalizeUnit = (s: string) =>
  s
    .trim()
    .toLocaleLowerCase('es-CO')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** Formato largo: una fila por registro, ordenado por fecha y hora. */
export function entriesToCsv(trackers: Tracker[], entries: Entry[]): string {
  const byId = new Map(trackers.map((t) => [t.id, t]));
  const rows = entries
    .filter((e) => byId.has(e.trackerId))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time) || a.createdAt - b.createdAt)
    .map((e) => {
      const t = byId.get(e.trackerId) as Tracker;
      // El valor va con punto decimal y sin separador de miles para que cualquier herramienta lo lea.
      return [e.date, e.time, t.name, String(e.value), csvUnit(t), e.note];
    });
  return toCsv([[...CSV_COLUMNS], ...rows]);
}

export interface ImportRow {
  line: number;
  date: string;
  time: string;
  /** Nombre del rastreador tal como quedará (el existente o el nuevo). */
  trackerName: string;
  value: number;
  note: string;
}

export interface NewTrackerPlan {
  name: string;
  type: TrackerType;
  unit: string;
}

export interface ImportIssue {
  line: number;
  message: string;
}

export interface ImportPlan {
  rows: ImportRow[];
  errors: ImportIssue[];
  /** Rastreadores que se crearán (no existen con ese nombre). */
  newTrackers: NewTrackerPlan[];
  /** Filas idénticas a registros que ya existen; se omiten. */
  duplicates: number;
  /** Error que impide leer el archivo completo. */
  fatal: string | null;
}

function normalizeTime(raw: string): string | null {
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(raw.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function inferType(unit: string, values: number[]): TrackerType {
  const u = normalizeUnit(unit);
  if (u === normalizeUnit(BOOLEAN_UNIT) || u === 'si/no') return 'boolean';
  if (u === SCALE_UNIT) return 'scale';
  // Una cantidad necesita unidad; sin unidad se trata como contador.
  if (!u) return 'counter';
  return values.every((v) => Number.isInteger(v) && v >= 0) ? 'counter' : 'quantity';
}

const emptyPlan = (fatal: string): ImportPlan => ({
  rows: [],
  errors: [],
  newTrackers: [],
  duplicates: 0,
  fatal,
});

const entryKey = (trackerName: string, date: string, time: string, value: number, note: string) =>
  [normalizeName(trackerName), date, time, value, note.trim()].join('\u0000');

/**
 * Valida un CSV en formato largo y arma el plan de importación sin tocar la base
 * de datos. Los nombres de rastreador se comparan sin distinguir mayúsculas.
 */
export function planImport(text: string, trackers: Tracker[], existing: Entry[]): ImportPlan {
  if (!text.trim()) return emptyPlan('El archivo está vacío.');
  const parsed = parseCsv(text);
  if (parsed.error) return emptyPlan(parsed.error);
  const [header, ...body] = parsed.rows;
  if (!header) return emptyPlan('El archivo está vacío.');

  const columns = header.fields.map((f) => normalizeUnit(f));
  const index = Object.fromEntries(CSV_COLUMNS.map((c) => [c, columns.indexOf(c)])) as Record<
    (typeof CSV_COLUMNS)[number],
    number
  >;
  const missing = REQUIRED_COLUMNS.filter((c) => index[c] < 0);
  if (missing.length > 0) {
    return emptyPlan(
      `Faltan columnas: ${missing.join(', ')}. El encabezado debe ser: ${CSV_COLUMNS.join(', ')}.`,
    );
  }
  if (body.length === 0) return emptyPlan('El archivo no tiene registros (solo el encabezado).');

  const byName = new Map(trackers.map((t) => [normalizeName(t.name), t]));
  const errors: ImportIssue[] = [];

  // Primera pasada: validar forma de cada fila y agrupar las de rastreadores nuevos.
  interface Raw {
    line: number;
    date: string;
    time: string;
    name: string;
    value: number;
    unit: string;
    note: string;
  }
  const raws: Raw[] = [];
  for (const { line, fields } of body) {
    const get = (c: (typeof CSV_COLUMNS)[number]) =>
      index[c] >= 0 ? (fields[index[c]] ?? '') : '';
    const problems: string[] = [];
    const date = get('fecha').trim();
    if (!isValidISODate(date)) problems.push(`fecha «${date}» no es válida (usa AAAA-MM-DD)`);
    const timeRaw = get('hora').trim();
    const time = timeRaw === '' ? '00:00' : normalizeTime(timeRaw);
    if (time === null) problems.push(`hora «${timeRaw}» no es válida (usa HH:mm)`);
    const name = get('rastreador').trim();
    if (!name) problems.push('falta el nombre del rastreador');
    else if (name.length > NAME_MAX_LENGTH)
      problems.push(`el nombre del rastreador supera ${NAME_MAX_LENGTH} caracteres`);
    const valueRaw = get('valor').trim();
    const value = parseDecimal(valueRaw);
    if (Number.isNaN(value)) problems.push(`valor «${valueRaw}» no es un número`);
    if (problems.length > 0) {
      errors.push({ line, message: capitalize(problems.join('; ')) + '.' });
      continue;
    }
    raws.push({
      line,
      date,
      time: time as string,
      name,
      value,
      unit: get('unidad').trim(),
      note: get('nota'),
    });
  }

  const newByName = new Map<string, { name: string; unit: string; values: number[] }>();
  for (const r of raws) {
    const key = normalizeName(r.name);
    if (byName.has(key)) continue;
    const plan = newByName.get(key);
    if (plan) plan.values.push(r.value);
    else newByName.set(key, { name: r.name, unit: r.unit, values: [r.value] });
  }
  const newTrackers: NewTrackerPlan[] = [...newByName.values()].map((p) => {
    const type = inferType(p.unit, p.values);
    return { name: p.name, type, unit: type === 'boolean' || type === 'scale' ? '' : p.unit };
  });
  const newPlanByName = new Map(newTrackers.map((t) => [normalizeName(t.name), t]));

  // Segunda pasada: validar contra el tipo y la unidad del rastreador destino.
  const existingKeys = new Set<string>();
  const nameById = new Map(trackers.map((t) => [t.id, t.name]));
  for (const e of existing) {
    const n = nameById.get(e.trackerId);
    if (n) existingKeys.add(entryKey(n, e.date, e.time, e.value, e.note));
  }

  const rows: ImportRow[] = [];
  let duplicates = 0;
  for (const r of raws) {
    const key = normalizeName(r.name);
    const target = byName.get(key) ?? newPlanByName.get(key);
    if (!target) continue;
    const expectedUnit = csvUnit(target);
    if (r.unit && normalizeUnit(r.unit) !== normalizeUnit(expectedUnit) && byName.has(key)) {
      errors.push({
        line: r.line,
        message: `La unidad «${r.unit}» no coincide con la de «${target.name}» (${expectedUnit || 'sin unidad'}).`,
      });
      continue;
    }
    const valueError = validateEntryValue(target.type, r.value);
    if (valueError) {
      errors.push({
        line: r.line,
        message: `Valor ${r.value} inválido para «${target.name}»: ${valueError}`,
      });
      continue;
    }
    const trackerName = target.name;
    if (existingKeys.has(entryKey(trackerName, r.date, r.time, r.value, r.note))) {
      duplicates++;
      continue;
    }
    rows.push({
      line: r.line,
      date: r.date,
      time: r.time,
      trackerName,
      value: r.value,
      note: r.note.trim(),
    });
  }

  errors.sort((a, b) => a.line - b.line);
  // Solo se crean los rastreadores nuevos que tengan al menos una fila válida.
  const usedNew = new Set(rows.map((r) => normalizeName(r.trackerName)));
  return {
    rows,
    errors,
    newTrackers: newTrackers.filter((t) => usedNew.has(normalizeName(t.name))),
    duplicates,
    fatal: null,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
