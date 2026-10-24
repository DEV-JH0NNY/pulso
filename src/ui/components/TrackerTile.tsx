import { useState } from 'react';
import { colorHex } from '../../domain/colors';
import { isLimitGoal, progressFor } from '../../domain/aggregate';
import { formatTime, formatValue } from '../../domain/format';
import type { Tracker } from '../../domain/types';
import { useLongPress } from '../hooks/useLongPress';
import type { WeekProgress } from '../../domain/weekly';
import { progressText } from '../trackerText';
import { IconCheck, IconPlus } from './icons';
import { SampleTag } from './SampleTag';

interface TrackerTileProps {
  tracker: Tracker;
  /** Valor del día o null si no hay registros. */
  value: number | null;
  /** Progreso de la meta semanal, si el rastreador tiene una. */
  week?: WeekProgress | null;
  /** Contador que cambia cada vez que hay que celebrar una meta cumplida. */
  celebrate?: number;
  /** Hora (HH:mm) del último registro del día, para contadores y cantidades. */
  lastTime?: string | null;
  onQuickLog: () => void;
  onDetailedLog: () => void;
}

export function TrackerTile({
  tracker,
  value,
  week,
  celebrate = 0,
  lastTime = null,
  onQuickLog,
  onDetailedLog,
}: TrackerTileProps) {
  const [pulse, setPulse] = useState(0);
  const press = useLongPress(onDetailedLog, () => {
    setPulse((p) => p + 1);
    onQuickLog();
  });
  const hex = colorHex(tracker.color);
  const valueText = progressText(tracker, value);
  const progress = progressFor(tracker, value);
  const overLimit =
    isLimitGoal(tracker) &&
    value !== null &&
    tracker.dailyGoal !== null &&
    value > tracker.dailyGoal;
  const tapHint =
    tracker.type === 'boolean'
      ? 'marcar Sí'
      : `sumar ${formatValue(tracker, tracker.defaultValue)}`;

  return (
    <div className="relative h-full">
      {celebrate > 0 && (
        <span
          key={celebrate}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden rounded-2xl motion-safe:block motion-safe:animate-[goal-ring_700ms_ease-out_forwards]"
          style={{ boxShadow: `0 0 0 3px ${hex}` }}
        />
      )}
      <button
        type="button"
        {...press}
        aria-label={`${tracker.name}: ${valueText}${progress.met ? (isLimitGoal(tracker) ? ', dentro del límite' : ', meta cumplida') : ''}${overLimit ? ', límite superado' : ''}${week ? `, semana ${week.done} de ${week.target} días` : ''}. Tocar para ${tapHint}; mantener presionado para ajustar.`}
        className="flex h-full w-full select-none flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-transform active:scale-[0.97] dark:border-slate-800 dark:bg-slate-900"
        style={{ borderTopColor: hex, borderTopWidth: 4 }}
      >
        <span
          key={pulse}
          aria-hidden="true"
          className={`text-3xl ${pulse > 0 ? 'motion-safe:animate-[tile-pop_250ms_ease-out]' : ''}`}
        >
          {tracker.icon}
        </span>
        <span className="w-full pr-8 font-semibold leading-tight">
          {tracker.name}
          {tracker.isSample && <SampleTag />}
        </span>
        <span className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
          {progress.met && <IconCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          {valueText}
        </span>
        {progress.ratio !== null && (
          <span
            aria-hidden="true"
            className="block h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
          >
            <span
              className="block h-full rounded-full transition-[width] duration-300"
              style={{
                width: `${Math.round(progress.ratio * 100)}%`,
                backgroundColor: overLimit ? '#e11d48' : hex,
              }}
            />
          </span>
        )}
        {lastTime && (tracker.type === 'counter' || tracker.type === 'quantity') && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Último: {formatTime(lastTime)}
          </span>
        )}
        {week && (
          <span
            className={`text-xs font-medium ${week.met ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Semana: {week.done}/{week.target} días{week.met ? ' ✓' : ''}
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={onDetailedLog}
        aria-label={`Registrar ${tracker.name} con detalles`}
        className="absolute right-1 top-2 inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <IconPlus className="h-5 w-5" />
      </button>
    </div>
  );
}
