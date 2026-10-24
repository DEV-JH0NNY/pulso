import { useMemo, useState } from 'react';
import {
  formatNumber,
  formatShortDate,
  formatShortMonth,
  formatValue,
  formatMonthYear,
} from '../../domain/format';
import {
  buildSeries,
  GRANULARITY_LABELS,
  seriesMeaning,
  summarizeSeries,
  type Granularity,
  type SeriesPoint,
} from '../../domain/series';
import type { Tracker } from '../../domain/types';
import { BarChart, type Bar } from './BarChart';
import { StatCard } from './StatCard';

interface TrackerChartProps {
  tracker: Tracker;
  totals: Map<string, number>;
  todayDate: string;
}

const GRANULARITIES: Granularity[] = ['day', 'week', 'month'];

function periodLabel(p: SeriesPoint, g: Granularity): string {
  if (g === 'day') return formatShortDate(p.start);
  if (g === 'week') return `Semana del ${formatShortDate(p.start)}`;
  return formatMonthYear(p.start);
}

function axisLabel(p: SeriesPoint, i: number, n: number, g: Granularity): string {
  if (g === 'month') return formatShortMonth(p.start);
  const every = g === 'day' ? 7 : 3;
  // Se etiqueta desde el final para que el último periodo (el actual) siempre tenga etiqueta.
  if ((n - 1 - i) % every !== 0) return '';
  return g === 'day'
    ? String(Number(p.start.slice(8)))
    : formatShortDate(p.start).replace(' de ', ' ');
}

export function TrackerChart({ tracker, totals, todayDate }: TrackerChartProps) {
  const [granularity, setGranularity] = useState<Granularity>('day');
  const points = useMemo(
    () => buildSeries(tracker, totals, todayDate, granularity),
    [tracker, totals, todayDate, granularity],
  );
  const summary = summarizeSeries(points);

  // En sí/no por semana o mes el valor es un conteo de días, no un "Sí/No".
  const countsDays = tracker.type === 'boolean' && granularity !== 'day';
  const fmt = (v: number) =>
    countsDays ? `${formatNumber(v, 1)} ${v === 1 ? 'día' : 'días'}` : formatValue(tracker, v);

  const bars: Bar[] = points.map((p, i) => ({
    key: p.start,
    label: periodLabel(p, granularity),
    axisLabel: axisLabel(p, i, points.length, granularity),
    value: p.value,
    valueText: p.value === null ? 'sin registros' : fmt(p.value),
  }));

  const meaning = seriesMeaning(tracker.type, granularity);
  const yMax =
    tracker.type === 'scale'
      ? 5
      : tracker.type === 'boolean'
        ? granularity === 'day'
          ? 1
          : granularity === 'week'
            ? 7
            : 31
        : undefined;
  const showTotal = tracker.type === 'counter' || tracker.type === 'quantity';
  const periodName = { day: 'días', week: 'semanas', month: 'meses' }[granularity];

  return (
    <div>
      <div
        role="group"
        aria-label="Agrupar por"
        className="mb-3 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
      >
        {GRANULARITIES.map((g) => (
          <button
            key={g}
            type="button"
            aria-pressed={granularity === g}
            onClick={() => setGranularity(g)}
            className="min-h-10 flex-1 rounded-lg text-sm font-semibold text-slate-600 aria-pressed:bg-white aria-pressed:text-slate-900 aria-pressed:shadow-sm dark:text-slate-300 dark:aria-pressed:bg-slate-950 dark:aria-pressed:text-white"
          >
            {GRANULARITY_LABELS[g]}
          </button>
        ))}
      </div>
      <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">{meaning}</p>
      <BarChart
        bars={bars}
        color={tracker.color}
        title={`${tracker.name}: ${meaning.toLowerCase()}`}
        yMax={yMax}
        goal={granularity === 'day' && tracker.type !== 'boolean' ? tracker.dailyGoal : null}
      />
      <dl className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label={`Promedio (${periodName} con datos)`}
          value={summary.average === null ? '—' : fmt(summary.average)}
        />
        <StatCard label="Máximo" value={summary.max === null ? '—' : fmt(summary.max)} />
        {showTotal && (
          <StatCard label={`Total (${points.length} ${periodName})`} value={fmt(summary.total)} />
        )}
        <StatCard
          label="Periodos con datos"
          value={`${summary.periodsWithData} de ${points.length}`}
        />
      </dl>
    </div>
  );
}
