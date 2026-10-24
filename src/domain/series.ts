import { isDayDone } from './aggregate';
import { addDays, addMonths, startOfMonth, startOfWeek } from './dates';
import type { Tracker } from './types';

export type Granularity = 'day' | 'week' | 'month';

export const GRANULARITY_LABELS: Record<Granularity, string> = {
  day: 'Día',
  week: 'Semana',
  month: 'Mes',
};

/** Cantidad de periodos que muestra cada vista. */
export const PERIODS: Record<Granularity, number> = { day: 30, week: 12, month: 12 };

export interface SeriesPoint {
  /** Primer día del periodo (AAAA-MM-DD). */
  start: string;
  value: number | null;
  /** Días del periodo con al menos un registro. */
  daysWithData: number;
}

/** Qué significa el valor de un periodo, según tipo y vista. */
export function seriesMeaning(type: Tracker['type'], granularity: Granularity): string {
  if (granularity === 'day') {
    return type === 'scale' ? 'Promedio del día' : type === 'boolean' ? 'Sí / No' : 'Total del día';
  }
  const week = granularity === 'week';
  switch (type) {
    case 'boolean':
      return `Días con «Sí» en ${week ? 'la semana' : 'el mes'}`;
    case 'scale':
      return week ? 'Promedio de la semana' : 'Promedio del mes';
    default:
      return week ? 'Total de la semana' : 'Total del mes';
  }
}

function periodStart(date: string, granularity: Granularity): string {
  if (granularity === 'week') return startOfWeek(date);
  if (granularity === 'month') return startOfMonth(date);
  return date;
}

function nextStart(start: string, granularity: Granularity): string {
  if (granularity === 'week') return addDays(start, 7);
  if (granularity === 'month') return addMonths(start, 1);
  return addDays(start, 1);
}

/**
 * Serie temporal para los gráficos. En vistas de semana y mes: contador y
 * cantidad suman, sí/no cuenta días con «Sí» y la escala promedia los días con datos.
 */
export function buildSeries(
  tracker: Pick<Tracker, 'type' | 'dailyGoal'>,
  totals: Map<string, number>,
  todayDate: string,
  granularity: Granularity,
  periods: number = PERIODS[granularity],
): SeriesPoint[] {
  const lastStart = periodStart(todayDate, granularity);
  let first = lastStart;
  for (let i = 1; i < periods; i++) {
    first =
      granularity === 'week'
        ? addDays(first, -7)
        : granularity === 'month'
          ? addMonths(first, -1)
          : addDays(first, -1);
  }

  const points: SeriesPoint[] = [];
  const index = new Map<string, SeriesPoint>();
  for (let s = first, i = 0; i < periods; s = nextStart(s, granularity), i++) {
    const p: SeriesPoint = { start: s, value: null, daysWithData: 0 };
    points.push(p);
    index.set(s, p);
  }

  const scaleSums = new Map<string, number>();
  for (const [date, v] of totals) {
    if (date < first || date > todayDate) continue;
    const p = index.get(periodStart(date, granularity));
    if (!p) continue;
    p.daysWithData++;
    if (granularity === 'day') {
      p.value = v;
    } else if (tracker.type === 'boolean') {
      p.value = (p.value ?? 0) + (isDayDone({ type: 'boolean', dailyGoal: null }, v) ? 1 : 0);
    } else if (tracker.type === 'scale') {
      scaleSums.set(p.start, (scaleSums.get(p.start) ?? 0) + v);
    } else {
      p.value = (p.value ?? 0) + v;
    }
  }
  if (granularity !== 'day' && tracker.type === 'scale') {
    for (const p of points) {
      const sum = scaleSums.get(p.start);
      if (sum !== undefined && p.daysWithData > 0) p.value = sum / p.daysWithData;
    }
  }
  return points;
}

export interface SeriesSummary {
  /** Promedio de los periodos con datos. */
  average: number | null;
  max: number | null;
  /** Suma de todos los periodos (solo tiene sentido en contador y cantidad). */
  total: number;
  periodsWithData: number;
}

export function summarizeSeries(points: SeriesPoint[]): SeriesSummary {
  const values = points.map((p) => p.value).filter((v): v is number => v !== null);
  if (values.length === 0) return { average: null, max: null, total: 0, periodsWithData: 0 };
  const total = values.reduce((a, b) => a + b, 0);
  return {
    average: total / values.length,
    max: Math.max(...values),
    total,
    periodsWithData: values.length,
  };
}

/** Máximo "redondo" (1, 2, 2,5 o 5 × 10ⁿ) para el eje Y. */
export function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = 10 ** exp;
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (m * base >= value - 1e-9) return m * base;
  }
  return 10 * base;
}
