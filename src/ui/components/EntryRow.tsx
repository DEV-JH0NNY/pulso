import { formatTime, formatValue } from '../../domain/format';
import type { Entry, Tracker } from '../../domain/types';
import { TrackerBadge } from './TrackerBadge';

interface EntryRowProps {
  entry: Entry;
  tracker: Tracker | undefined;
  onEdit: () => void;
}

export function EntryRow({ entry, tracker, onEdit }: EntryRowProps) {
  const name = tracker?.name ?? 'Rastreador eliminado';
  const value = tracker ? formatValue(tracker, entry.value) : String(entry.value);
  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label={`${name}: ${value} a las ${formatTime(entry.time)}${entry.note ? `, nota: ${entry.note}` : ''}. Editar`}
      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60"
    >
      {tracker && <TrackerBadge tracker={tracker} size="sm" />}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">
          {name}
          {tracker?.archived && (
            <span className="ml-1 text-xs font-normal text-slate-500 dark:text-slate-400">
              (archivado)
            </span>
          )}
        </span>
        {entry.note && (
          <span className="block truncate text-sm text-slate-600 dark:text-slate-400">
            {entry.note}
          </span>
        )}
      </span>
      <span className="shrink-0 text-right">
        <span className="block font-semibold tabular-nums">{value}</span>
        <span className="block text-xs text-slate-500 dark:text-slate-400">
          {formatTime(entry.time)}
        </span>
      </span>
    </button>
  );
}
