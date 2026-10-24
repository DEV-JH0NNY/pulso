import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';
import { sortTrackers } from '../../domain/trackers';
import type { Entry, Tracker } from '../../domain/types';

/** Todos los rastreadores ordenados (incluye archivados). `undefined` mientras carga. */
export function useAllTrackers(): Tracker[] | undefined {
  return useLiveQuery(async () => sortTrackers(await db.trackers.toArray()), []);
}

/** Rastreadores activos ordenados. */
export function useActiveTrackers(): Tracker[] | undefined {
  const all = useAllTrackers();
  return all?.filter((t) => !t.archived);
}

export function useTracker(id: string): Tracker | null | undefined {
  return useLiveQuery(async () => (await db.trackers.get(id)) ?? null, [id]);
}

export function useEntriesForDate(date: string): Entry[] | undefined {
  return useLiveQuery(() => db.entries.where('date').equals(date).toArray(), [date]);
}

export function useEntriesBetween(from: string, to: string): Entry[] | undefined {
  return useLiveQuery(
    () => db.entries.where('date').between(from, to, true, true).toArray(),
    [from, to],
  );
}

export function useEntriesForTracker(trackerId: string): Entry[] | undefined {
  return useLiveQuery(() => db.entries.where('trackerId').equals(trackerId).toArray(), [trackerId]);
}
