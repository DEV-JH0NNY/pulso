import { useMemo, useState } from 'react';
import { dailyTotals, isLimitGoal } from '../../domain/aggregate';
import { formatNumber, formatValue, plural } from '../../domain/format';
import { comparePeriods, type PeriodComparison, type SummaryPeriod } from '../../domain/summary';
import type { Entry, Tracker } from '../../domain/types';
import { cardBase, muted } from './styles';
import { TrackerBadge } from './TrackerBadge';

interface PeriodSummaryProps {
  trackers: Tracker[];
  entries: Entry[];
  todayDate: string;
}

function valueText(t: Tracker, v: number | null): string {
  if (v === null) return 'Sin datos';
  return t.type === 'boolean' ? plural(v, 'día con «Sí»', 'días con «Sí»') : formatValue(t, v);
}

function changeText(t: Tracker, c: PeriodComparison): string {
  if (c.delta === null) return 'sin datos para comparar';
  if (c.delta === 0) return 'igual';
  const arrow = c.delta > 0 ? '↑' : '↓';
  if (c.percent !== null) return `${arrow} ${formatNumber(Math.abs(c.percent), 0)} %`;
  if (t.type === 'scale') return `${arrow} ${formatNumber(Math.abs(c.delta), 1)} puntos`;
  return `${arrow} ${t.type === 'boolean' ? plural(Math.abs(c.delta), 'día') : formatValue(t, Math.abs(c.delta))}`;
}

/** Resumen de la semana o el mes en curso frente al periodo anterior. */
export function PeriodSummary({ trackers, entries, todayDate }: PeriodSummaryProps) {
  const [period, setPeriod] = useState<SummaryPeriod>('week');
  const rows = useMemo(
    () =>
      trackers.map((t) => ({
        t,
        c: comparePeriods(t, dailyTotals(t, entries), todayDate, period),
      })),
    [trackers, entries, todayDate, period],
  );
  const elapsed = rows[0]?.c.elapsedDays ?? 0;
  const previousName = period === 'week' ? 'la semana pasada' : 'el mes pasado';

  return (
    <section aria-labelledby="resumen-periodo" className="mb-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 id="resumen-periodo" className="text-lg font-semibold">
          {period === 'week' ? 'Esta semana' : 'Este mes'}
        </h2>
        <div
          role="group"
          aria-label="Periodo del resumen"
          className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
        >
          {(['week', 'month'] as const).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
              className="min-h-9 rounded-lg px-3 text-sm font-semibold text-slate-600 aria-pressed:bg-white aria-pressed:text-slate-900 aria-pressed:shadow-sm dark:text-slate-300 dark:aria-pressed:bg-slate-950 dark:aria-pressed:text-white"
            >
              {p === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>
      <p className={`${muted} mb-2`}>
        Primeros {plural(elapsed, 'día')} frente a los mismos días de {previousName}.
      </p>
      <ul className={`${cardBase} divide-y divide-slate-100 dark:divide-slate-800`}>
        {rows.map(({ t, c }) => (
          <li key={t.id} className="flex items-center gap-3 p-3">
            <TrackerBadge tracker={t} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{t.name}</p>
              {t.dailyGoal !== null && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {isLimitGoal(t) ? 'Dentro del límite' : 'Meta cumplida'} {c.current.daysDone} de{' '}
                  {plural(c.elapsedDays, 'día')}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold tabular-nums">{valueText(t, c.current.value)}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {(t.type === 'counter' || t.type === 'quantity') &&
                  c.current.value !== null &&
                  `${formatValue(t, c.current.value / c.current.daysWithData)}/día · `}
                {changeText(t, c)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
