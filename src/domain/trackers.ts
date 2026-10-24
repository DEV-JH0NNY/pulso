import { isValidColor } from './colors';
import type { Tracker, TrackerDraft, TrackerType } from './types';

export const NAME_MAX_LENGTH = 40;
export const UNIT_MAX_LENGTH = 12;

/** Valores iniciales razonables al crear o cambiar el tipo de un rastreador. */
export function defaultsForType(type: TrackerType): Pick<TrackerDraft, 'unit' | 'defaultValue'> {
  switch (type) {
    case 'counter':
      return { unit: '', defaultValue: 1 };
    case 'quantity':
      return { unit: 'h', defaultValue: 1 };
    case 'boolean':
      return { unit: '', defaultValue: 1 };
    case 'scale':
      return { unit: '', defaultValue: 3 };
  }
}

export function emptyDraft(): TrackerDraft {
  return {
    name: '',
    icon: '⭐',
    color: 'emerald',
    type: 'counter',
    dailyGoal: null,
    ...defaultsForType('counter'),
  };
}

export type DraftErrors = Partial<Record<keyof TrackerDraft, string>>;

const isInt = (n: number) => Number.isInteger(n);

/** Valida un borrador de rastreador. Devuelve un objeto vacío si es válido. */
export function validateTrackerDraft(draft: TrackerDraft): DraftErrors {
  const errors: DraftErrors = {};
  const name = draft.name.trim();
  if (!name) errors.name = 'Escribe un nombre.';
  else if (name.length > NAME_MAX_LENGTH) errors.name = `Máximo ${NAME_MAX_LENGTH} caracteres.`;

  if (!draft.icon.trim()) errors.icon = 'Elige un ícono.';
  if (!isValidColor(draft.color)) errors.color = 'Elige un color de la paleta.';
  if (draft.unit.trim().length > UNIT_MAX_LENGTH)
    errors.unit = `Máximo ${UNIT_MAX_LENGTH} caracteres.`;

  const v = draft.defaultValue;
  const g = draft.dailyGoal;
  if (!Number.isFinite(v)) errors.defaultValue = 'Escribe un número.';

  const w = draft.weeklyTarget ?? null;
  if (w !== null && (!Number.isInteger(w) || w < 1 || w > 7))
    errors.weeklyTarget = 'La meta semanal debe ser un entero de 1 a 7 días.';

  const days = draft.activeDays ?? null;
  if (days !== null && days.length > 0) {
    if (
      days.some((d) => !Number.isInteger(d) || d < 0 || d > 6) ||
      new Set(days).size !== days.length
    )
      errors.activeDays = 'Días de la semana inválidos.';
  }

  switch (draft.type) {
    case 'counter':
      if (Number.isFinite(v) && (!isInt(v) || v < 1))
        errors.defaultValue = 'Debe ser un entero mayor o igual a 1.';
      if (g !== null && (!Number.isFinite(g) || g <= 0))
        errors.dailyGoal = 'La meta debe ser mayor que 0.';
      break;
    case 'quantity':
      if (!draft.unit.trim()) errors.unit = 'Escribe la unidad (por ejemplo: h, km, COP).';
      if (Number.isFinite(v) && v <= 0) errors.defaultValue = 'Debe ser mayor que 0.';
      if (g !== null && (!Number.isFinite(g) || g <= 0))
        errors.dailyGoal = 'La meta debe ser mayor que 0.';
      break;
    case 'boolean':
      if (v !== 0 && v !== 1) errors.defaultValue = 'Debe ser Sí o No.';
      if (g !== null && g !== 1) errors.dailyGoal = 'La meta de un sí/no es hacerlo.';
      break;
    case 'scale':
      if (Number.isFinite(v) && (!isInt(v) || v < 1 || v > 5))
        errors.defaultValue = 'Debe ser un entero entre 1 y 5.';
      if (g !== null && (!Number.isFinite(g) || g < 1 || g > 5))
        errors.dailyGoal = 'La meta debe estar entre 1 y 5.';
      break;
  }
  return errors;
}

/** Borrador editable a partir de un rastreador guardado. */
export function draftFromTracker(t: Tracker): TrackerDraft {
  return {
    name: t.name,
    icon: t.icon,
    color: t.color,
    type: t.type,
    unit: t.unit,
    defaultValue: t.defaultValue,
    dailyGoal: t.dailyGoal,
    goalDirection: t.goalDirection,
    weeklyTarget: t.weeklyTarget ?? null,
    activeDays: t.activeDays ?? null,
  };
}

/** Borrador para duplicar un rastreador: misma configuración, nombre «Copia de …». */
export function duplicateDraft(t: Tracker): TrackerDraft {
  return { ...draftFromTracker(t), name: `Copia de ${t.name}`.slice(0, NAME_MAX_LENGTH) };
}

/** Limpia espacios y campos que no aplican al tipo. */
export function normalizeDraft(draft: TrackerDraft): TrackerDraft {
  const numeric = draft.type === 'counter' || draft.type === 'quantity';
  const unit = numeric ? draft.unit.trim() : '';
  const out: TrackerDraft = { ...draft, name: draft.name.trim(), icon: draft.icon.trim(), unit };
  // Solo se guarda el sentido cuando es un límite con meta; el resto es "al menos" implícito.
  if (numeric && draft.dailyGoal !== null && draft.goalDirection === 'atMost')
    out.goalDirection = 'atMost';
  else delete out.goalDirection;
  if (draft.weeklyTarget == null) delete out.weeklyTarget;
  // Todos los días (o ninguno marcado) equivale a no tener horario.
  const days = draft.activeDays ?? [];
  if (days.length === 0 || days.length === 7) delete out.activeDays;
  else out.activeDays = [...days].sort((a, b) => a - b);
  return out;
}

/** Valida que un valor sea registrable para el tipo del rastreador. */
export function validateEntryValue(type: TrackerType, value: number): string | null {
  if (!Number.isFinite(value)) return 'Escribe un número.';
  switch (type) {
    case 'counter':
      return value < 0 ? 'No puede ser negativo.' : null;
    case 'quantity':
      return value < 0 ? 'No puede ser negativo.' : null;
    case 'boolean':
      return value === 0 || value === 1 ? null : 'Debe ser Sí (1) o No (0).';
    case 'scale':
      return isInt(value) && value >= 1 && value <= 5 ? null : 'Debe ser un entero entre 1 y 5.';
  }
}

/** Ordena rastreadores por su posición y, a igualdad, por fecha de creación. */
export function sortTrackers<T extends Pick<Tracker, 'order' | 'createdAt'>>(trackers: T[]): T[] {
  return [...trackers].sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
}

/**
 * Mueve el elemento `id` una posición hacia arriba (-1) o abajo (+1) y
 * devuelve la nueva lista de ids en orden.
 */
export function moveId(ids: string[], id: string, direction: -1 | 1): string[] {
  const i = ids.indexOf(id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= ids.length) return ids;
  const out = [...ids];
  [out[i], out[j]] = [out[j] as string, out[i] as string];
  return out;
}
