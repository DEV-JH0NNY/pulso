import { isLimitGoal } from '../domain/aggregate';
import { formatValue, isCurrencyUnit } from '../domain/format';
import { TRACKER_TYPE_LABELS, type Tracker } from '../domain/types';

/** Descripción corta: "Cantidad con unidad · meta 8 h". */
export function describeTracker(t: Tracker): string {
  const parts: string[] = [TRACKER_TYPE_LABELS[t.type]];
  if (t.dailyGoal !== null) {
    parts.push(
      t.type === 'boolean'
        ? 'meta diaria'
        : t.type === 'scale'
          ? `meta ≥ ${formatValue(t, t.dailyGoal)}`
          : isLimitGoal(t)
            ? `límite ${formatValue(t, t.dailyGoal)}`
            : `meta ${formatValue(t, t.dailyGoal)}`,
    );
  }
  if (t.weeklyTarget)
    parts.push(`${t.weeklyTarget} ${t.weeklyTarget === 1 ? 'día' : 'días'}/semana`);
  return parts.join(' · ');
}

/** Texto del progreso del día: "3 / 8 h", "Hecho", "3,5/5 (meta 4)" o "Sin registros". */
export function progressText(t: Tracker, value: number | null): string {
  const goal = t.dailyGoal;
  if (t.type === 'boolean') {
    if (value === null) return goal !== null ? 'Pendiente' : 'Sin registros';
    return value >= 1 ? 'Hecho' : 'No';
  }
  if (goal === null) return value === null ? 'Sin registros' : formatValue(t, value);
  if (t.type === 'scale') {
    return value === null
      ? `Meta ≥ ${formatValue(t, goal)}`
      : `${formatValue(t, value)} (meta ${formatValue(t, goal)})`;
  }
  const current = value ?? 0;
  if (isLimitGoal(t))
    return `${formatValue({ ...t, unit: isCurrencyUnit(t.unit) ? t.unit : '' }, current)} / máx. ${formatValue(t, goal)}`;
  return `${formatValue({ ...t, unit: isCurrencyUnit(t.unit) ? t.unit : '' }, current)} / ${formatValue(t, goal)}`;
}
