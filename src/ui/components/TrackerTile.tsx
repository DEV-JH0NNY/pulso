import { useState } from 'react';
import { colorHex } from '../../domain/colors';
import { formatValue } from '../../domain/format';
import type { Tracker } from '../../domain/types';
import { useLongPress } from '../hooks/useLongPress';
import { IconPlus } from './icons';
import { SampleTag } from './SampleTag';

interface TrackerTileProps {
  tracker: Tracker;
  /** Valor del día o null si no hay registros. */
  value: number | null;
  onQuickLog: () => void;
  onDetailedLog: () => void;
}

export function TrackerTile({ tracker, value, onQuickLog, onDetailedLog }: TrackerTileProps) {
  const [pulse, setPulse] = useState(0);
  const press = useLongPress(onDetailedLog, () => {
    setPulse((p) => p + 1);
    onQuickLog();
  });
  const hex = colorHex(tracker.color);
  const valueText = value === null ? 'Sin registros' : formatValue(tracker, value);
  const tapHint =
    tracker.type === 'boolean'
      ? 'marcar Sí'
      : `sumar ${formatValue(tracker, tracker.defaultValue)}`;

  return (
    <div className="relative">
      <button
        type="button"
        {...press}
        aria-label={`${tracker.name}: ${valueText}. Tocar para ${tapHint}; mantener presionado para ajustar.`}
        className="flex w-full select-none flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-transform active:scale-[0.97] dark:border-slate-800 dark:bg-slate-900"
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
        <span className="text-sm text-slate-600 dark:text-slate-400">{valueText}</span>
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
