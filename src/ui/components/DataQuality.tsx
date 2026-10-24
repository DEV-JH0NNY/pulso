import { formatNumber, formatShortDate, plural } from '../../domain/format';
import { coverage, longestGap } from '../../domain/quality';

/** Cobertura de registros y hueco más largo de un rastreador. */
export function DataQuality({
  totals,
  todayDate,
}: {
  totals: Map<string, number>;
  todayDate: string;
}) {
  const windows = [30, 90].map((d) => coverage(totals, todayDate, d));
  const gap = longestGap(totals, todayDate);
  return (
    <div className="space-y-3">
      {windows.map((c) => (
        <div key={c.days}>
          <div className="flex justify-between text-sm">
            <span>Últimos {c.days} días</span>
            <span className="tabular-nums">
              {c.daysWithData} de {c.days} ({formatNumber(c.ratio * 100, 0)} %)
            </span>
          </div>
          <div
            role="progressbar"
            aria-label={`Cobertura de los últimos ${c.days} días`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(c.ratio * 100)}
            className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
          >
            <div
              className="h-full rounded-full bg-sky-500"
              style={{ width: `${c.ratio * 100}%` }}
            />
          </div>
        </div>
      ))}
      <p className="text-sm text-slate-700 dark:text-slate-300">
        {gap
          ? `Hueco más largo sin registros: ${plural(gap.length, 'día')} (${formatShortDate(gap.from)} – ${formatShortDate(gap.to)}).`
          : 'Sin huecos desde el primer registro. 👌'}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Los días sin registro no cuentan como cero en ningún cálculo; mientras más cobertura, más
        confiables son los promedios y hallazgos.
      </p>
    </div>
  );
}
