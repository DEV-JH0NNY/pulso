import type { Entry } from './types';

export interface DayGroup {
  date: string;
  entries: Entry[];
}

/** Agrupa registros por día, del más reciente al más antiguo; dentro del día, por hora descendente. */
export function groupEntriesByDay(entries: Entry[]): DayGroup[] {
  const map = new Map<string, Entry[]>();
  for (const e of entries) {
    const list = map.get(e.date);
    if (list) list.push(e);
    else map.set(e.date, [e]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([date, list]) => ({
      date,
      entries: list.sort((a, b) =>
        a.time === b.time ? b.createdAt - a.createdAt : a.time < b.time ? 1 : -1,
      ),
    }));
}
