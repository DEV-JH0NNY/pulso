import { useId, useMemo, useState } from 'react';
import { formatMonthYear, formatNumber, formatValue, plural } from '../../domain/format';
import { buildYearReview, yearsWithData, type TrackerYear } from '../../domain/yearReview';
import { BarChart } from '../components/BarChart';
import { StatCard } from '../components/StatCard';
import { card, cardBase, input, label, muted, sectionTitle } from '../components/styles';
import { TrackerBadge } from '../components/TrackerBadge';
import { useAllTrackers, useEntriesBetween } from '../hooks/useData';
import { useToday } from '../hooks/useToday';

const MONTHS = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
// prettier-ignore
const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function valueText(t: TrackerYear): string {
  if (t.value === null) return '—';
  if (t.tracker.type === 'boolean') return plural(t.value, 'día con «Sí»', 'días con «Sí»');
  if (t.tracker.type === 'scale') return `promedio ${formatValue(t.tracker, t.value)}`;
  return formatValue(t.tracker, t.value);
}

export function YearReviewScreen() {
  const trackers = useAllTrackers();
  const entries = useEntriesBetween('0000-01-01', '9999-12-31');
  const todayDate = useToday();
  const years = useMemo(() => yearsWithData(entries ?? []), [entries]);
  const [chosen, setChosen] = useState<number | null>(null);
  const year = chosen ?? years[0] ?? Number(todayDate.slice(0, 4));
  const review = useMemo(
    () => (trackers && entries ? buildYearReview(trackers, entries, year, todayDate) : null),
    [trackers, entries, year, todayDate],
  );
  const id = useId();

  if (!review) return <p className={muted}>Cargando…</p>;
  if (review.entries === 0)
    return (
      <p className={`${card} ${muted}`}>Todavía no hay registros para armar tu resumen anual.</p>
    );

  const busiest = review.entriesByMonth.indexOf(Math.max(...review.entriesByMonth));

  return (
    <div>
      {years.length > 1 && (
        <div className="mb-4">
          <label htmlFor={id} className={label}>
            Año
          </label>
          <select
            id={id}
            className={`${input} w-32`}
            value={year}
            onChange={(e) => setChosen(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      )}

      <p className="mb-3 text-lg">
        En <strong>{year}</strong> registraste <strong>{formatNumber(review.entries)}</strong> veces
        en <strong>{plural(review.activeDays, 'día')}</strong>. Tu mes más activo fue{' '}
        <strong>{MONTH_NAMES[busiest]}</strong>.
      </p>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Registros" value={formatNumber(review.entries)} />
        <StatCard label="Días con registros" value={formatNumber(review.activeDays)} />
        <StatCard label="Rastreadores usados" value={formatNumber(review.trackers.length)} />
      </dl>

      <h2 className={sectionTitle}>Registros por mes</h2>
      <div className={card}>
        <BarChart
          bars={review.entriesByMonth.map((n, i) => ({
            key: String(i),
            label: MONTH_NAMES[i] ?? '',
            axisLabel: MONTHS[i] ?? '',
            value: n,
            valueText: plural(n, 'registro'),
          }))}
          color="emerald"
          title={`Registros por mes en ${year}`}
        />
      </div>

      <h2 className={sectionTitle}>Por rastreador</h2>
      <ul className={`${cardBase} divide-y divide-slate-100 dark:divide-slate-800`}>
        {review.trackers.map((t) => (
          <li key={t.tracker.id} className="flex items-start gap-3 p-3">
            <TrackerBadge tracker={t.tracker} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {t.tracker.name}{' '}
                <span className="font-normal text-slate-600 dark:text-slate-400">
                  · {valueText(t)}
                </span>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {plural(t.daysWithData, 'día')} con registros · mejor racha{' '}
                {plural(t.longestStreak, 'día')}
                {t.bestMonth
                  ? ` · mejor mes: ${formatMonthYear(t.bestMonth).split(' de ')[0]?.toLowerCase()}`
                  : ''}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
