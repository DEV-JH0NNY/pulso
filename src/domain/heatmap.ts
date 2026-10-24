import { progressFor } from './aggregate';
import { addDays, startOfWeek } from './dates';
import type { Tracker } from './types';

export type HeatLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatCell {
  date: string;
  value: number | null;
  level: HeatLevel;
  /** Días posteriores a hoy en la última semana (se dibujan vacíos). */
  future: boolean;
}

export interface Heatmap {
  /** Columnas = semanas (lunes a domingo), de la más antigua a la actual. */
  weeks: HeatCell[][];
  /** Índice de columna donde empieza cada mes, para las etiquetas. */
  months: { index: number; date: string }[];
}

const clampLevel = (n: number): HeatLevel => Math.max(0, Math.min(4, n)) as HeatLevel;

/** Intensidad de 0 a 4 para un valor diario. */
export function levelFor(
  tracker: Pick<Tracker, 'type' | 'dailyGoal'>,
  value: number | null,
  max: number,
): HeatLevel {
  if (value === null) return 0;
  if (tracker.dailyGoal !== null) {
    const { ratio, met } = progressFor(tracker, value);
    if (met) return 4;
    if (ratio === null || ratio <= 0) return 1;
    return clampLevel(Math.ceil(ratio * 3));
  }
  switch (tracker.type) {
    case 'boolean':
      return value >= 1 ? 4 : 1;
    case 'scale':
      return clampLevel(Math.ceil(((value - 1) / 4) * 3) + 1);
    case 'counter':
    case 'quantity':
      if (value <= 0 || max <= 0) return 1;
      return clampLevel(Math.ceil((value / max) * 4));
  }
}

/** Construye el calendario de las últimas `weeks` semanas terminando en la semana de hoy. */
export function buildHeatmap(
  tracker: Pick<Tracker, 'type' | 'dailyGoal'>,
  totals: Map<string, number>,
  todayDate: string,
  weeks = 53,
): Heatmap {
  const start = addDays(startOfWeek(todayDate), -(weeks - 1) * 7);
  let max = 0;
  for (const [date, v] of totals) if (date >= start && date <= todayDate) max = Math.max(max, v);

  const columns: HeatCell[][] = [];
  const months: Heatmap['months'] = [];
  let lastMonth = '';
  for (let w = 0; w < weeks; w++) {
    const column: HeatCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d);
      const future = date > todayDate;
      const value = future ? null : (totals.get(date) ?? null);
      column.push({ date, value, level: future ? 0 : levelFor(tracker, value, max), future });
    }
    const month = (column[0] as HeatCell).date.slice(0, 7);
    if (month !== lastMonth) {
      // La primera columna puede empezar a mitad de mes: solo se etiqueta si hay espacio.
      if (w > 0 || (column[0] as HeatCell).date.endsWith('-01') || weeks < 5)
        months.push({ index: w, date: (column[0] as HeatCell).date });
      lastMonth = month;
    }
    columns.push(column);
  }
  return { weeks: columns, months };
}
