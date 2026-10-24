import { formatValue } from '../domain/format';
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
          : `meta ${formatValue(t, t.dailyGoal)}`,
    );
  }
  return parts.join(' · ');
}
