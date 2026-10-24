import type { DaySummary } from '../../domain/aggregate';
import { card, muted } from './styles';

/** Anillo con las metas cumplidas del día y cuántos rastreadores tienen registros. */

export function DaySummaryCard({
  summary,
  total,
  dayLabel,
}: {
  summary: DaySummary;
  total: number;
  dayLabel: string;
}) {
  const ratio = summary.withGoal > 0 ? summary.met / summary.withGoal : 0;
  const r = 26;
  const circumference = 2 * Math.PI * r;
  return (
    <section aria-label="Resumen del día" className={`${card} mb-4 flex items-center gap-4`}>
      {summary.withGoal > 0 && (
        <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0 -rotate-90" aria-hidden="true">
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            strokeWidth="8"
            className="stroke-slate-200 dark:stroke-slate-800"
          />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className="stroke-emerald-500 transition-[stroke-dashoffset] duration-500"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - ratio)}
          />
        </svg>
      )}
      <div>
        {summary.withGoal > 0 ? (
          <p className="text-lg font-semibold">
            {summary.met} de {summary.withGoal} metas cumplidas
          </p>
        ) : (
          <p className="text-lg font-semibold">Sin metas diarias</p>
        )}
        <p className={muted}>
          {summary.logged} de {total} rastreadores con registros {dayLabel}
          {summary.withGoal > 0 && summary.met === summary.withGoal ? ' · ¡Día completo! 🎉' : ''}
        </p>
      </div>
    </section>
  );
}
