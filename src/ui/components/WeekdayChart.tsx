import { useMemo } from 'react';
import { formatNumber, formatValue } from '../../domain/format';
import type { Tracker } from '../../domain/types';
import {
  WEEKDAY_NAMES,
  WEEKDAY_SHORT,
  weekdayExtremes,
  weekdayProfile,
} from '../../domain/weekday';
import { BarChart } from './BarChart';

export function WeekdayChart({
  tracker,
  totals,
}: {
  tracker: Tracker;
  totals: Map<string, number>;
}) {
  const stats = useMemo(() => weekdayProfile(tracker, totals), [tracker, totals]);
  const extremes = weekdayExtremes(stats);
  const isBool = tracker.type === 'boolean';
  const fmt = (v: number) =>
    isBool ? `${formatNumber(v * 100, 0)} % de los días` : formatValue(tracker, v);

  return (
    <div>
      <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">
        {isBool ? 'Porcentaje de días con «Sí»' : 'Promedio de los días con registros'}
      </p>
      <BarChart
        bars={stats.map((s) => ({
          key: String(s.weekday),
          label: WEEKDAY_NAMES[s.weekday] ?? '',
          axisLabel: WEEKDAY_SHORT[s.weekday] ?? '',
          value: s.average,
          valueText: s.average === null ? 'sin registros' : `${fmt(s.average)} (${s.days} días)`,
        }))}
        color={tracker.color}
        title={`${tracker.name} por día de la semana`}
        yMax={isBool ? 1 : tracker.type === 'scale' ? 5 : undefined}
      />
      {extremes && (
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          Tu {isBool ? 'mejor' : 'mayor'} día es el{' '}
          <strong>{WEEKDAY_NAMES[extremes.best.weekday]}</strong> (
          {fmt(extremes.best.average as number)}) y el {isBool ? 'peor' : 'menor'}, el{' '}
          <strong>{WEEKDAY_NAMES[extremes.worst.weekday]}</strong> (
          {fmt(extremes.worst.average as number)}).
        </p>
      )}
    </div>
  );
}
