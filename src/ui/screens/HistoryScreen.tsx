import { useLiveQuery } from 'dexie-react-hooks';
import { useId, useMemo, useState } from 'react';
import { db } from '../../data/db';
import { addDays } from '../../domain/dates';
import { formatDayLabel } from '../../domain/format';
import { groupEntriesByDay } from '../../domain/history';
import type { Entry } from '../../domain/types';
import { EntryEditDialog } from '../components/EntryEditDialog';
import { EntryRow } from '../components/EntryRow';
import { buttonSecondary, card, cardBase, input, label, muted } from '../components/styles';
import { useAllTrackers, useEntriesBetween } from '../hooks/useData';
import { useToday } from '../hooks/useToday';

const PAGE_DAYS = 30;

export function HistoryScreen() {
  const todayDate = useToday();
  const [days, setDays] = useState(PAGE_DAYS);
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState<Entry | null>(null);
  const trackers = useAllTrackers();
  const from = addDays(todayDate, -(days - 1));
  const entries = useEntriesBetween(from, '9999-12-31');
  const oldest = useLiveQuery(
    async () => (await db.entries.orderBy('date').first())?.date ?? null,
    [],
  );
  const filterId = useId();

  const byId = useMemo(() => new Map((trackers ?? []).map((t) => [t.id, t])), [trackers]);
  const groups = useMemo(
    () => groupEntriesByDay((entries ?? []).filter((e) => !filter || e.trackerId === filter)),
    [entries, filter],
  );

  if (!trackers || !entries || oldest === undefined) return <p className={muted}>Cargando…</p>;

  const hasOlder = oldest !== null && oldest < from;

  return (
    <div>
      {trackers.length > 0 && (
        <div className="mb-4">
          <label htmlFor={filterId} className={label}>
            Filtrar por rastreador
          </label>
          <select
            id={filterId}
            className={input}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Todos</option>
            {trackers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon} {t.name}
                {t.archived ? ' (archivado)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {groups.length === 0 ? (
        <p className={`${card} ${muted}`}>
          {hasOlder
            ? `No hay registros en los últimos ${days} días.`
            : 'Todavía no hay registros. Ve a «Hoy» y toca un rastreador para empezar.'}
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <section key={g.date} aria-labelledby={`dia-${g.date}`}>
              <h2
                id={`dia-${g.date}`}
                className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-400"
              >
                {formatDayLabel(g.date, todayDate)}
              </h2>
              <ul
                className={`${cardBase} divide-y divide-slate-100 overflow-hidden dark:divide-slate-800`}
              >
                {g.entries.map((e) => (
                  <li key={e.id}>
                    <EntryRow
                      entry={e}
                      tracker={byId.get(e.trackerId)}
                      onEdit={() => setEditing(e)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {hasOlder && (
        <div className="mt-4 text-center">
          <button
            type="button"
            className={buttonSecondary}
            onClick={() => setDays((d) => d + PAGE_DAYS)}
          >
            Ver {PAGE_DAYS} días más
          </button>
        </div>
      )}

      <EntryEditDialog
        entry={editing}
        tracker={editing ? byId.get(editing.trackerId) : undefined}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}
