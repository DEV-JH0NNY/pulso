import { useMemo } from 'react';
import { dailyTotals } from '../../domain/aggregate';
import { computeStreaks } from '../../domain/streaks';
import { IconChevronRight } from '../components/icons';
import { cardBase, card, muted, sectionTitle } from '../components/styles';
import { TrackerBadge } from '../components/TrackerBadge';
import { useAllTrackers, useEntriesBetween } from '../hooks/useData';
import { useToday } from '../hooks/useToday';
import { routeHref } from '../router';
import type { Tracker } from '../../domain/types';

export function StatsScreen() {
  const trackers = useAllTrackers();
  const entries = useEntriesBetween('0000-01-01', '9999-12-31');
  const todayDate = useToday();

  const streaks = useMemo(() => {
    const map = new Map<string, number>();
    if (!trackers || !entries) return map;
    for (const t of trackers)
      map.set(t.id, computeStreaks(t, dailyTotals(t, entries), todayDate).current);
    return map;
  }, [trackers, entries, todayDate]);

  if (!trackers || !entries) return <p className={muted}>Cargando…</p>;
  if (trackers.length === 0)
    return <p className={`${card} ${muted}`}>Crea un rastreador para ver sus estadísticas.</p>;

  const active = trackers.filter((t) => !t.archived);
  const archived = trackers.filter((t) => t.archived);

  const list = (items: Tracker[]) => (
    <ul className={`${cardBase} divide-y divide-slate-100 overflow-hidden dark:divide-slate-800`}>
      {items.map((t) => {
        const s = streaks.get(t.id) ?? 0;
        return (
          <li key={t.id}>
            <a
              href={routeHref({ name: 'tracker', id: t.id })}
              className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              <TrackerBadge tracker={t} size="sm" />
              <span className="min-w-0 flex-1 truncate font-medium">{t.name}</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {s > 0 ? `🔥 ${s} ${s === 1 ? 'día' : 'días'}` : 'Sin racha'}
              </span>
              <IconChevronRight className="h-5 w-5 text-slate-400" />
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div>
      <p className={`${muted} mb-4`}>
        Elige un rastreador para ver sus rachas, calendario y gráficos.
      </p>
      {active.length > 0 && list(active)}
      {archived.length > 0 && (
        <>
          <h2 className={sectionTitle}>Archivados</h2>
          {list(archived)}
        </>
      )}
    </div>
  );
}
