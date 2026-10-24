import { dailyTotals } from './aggregate';
import { buildSeries } from './series';
import { computeStreaks } from './streaks';
import type { Entry, Tracker } from './types';

export interface TrackerYear {
  tracker: Tracker;
  entries: number;
  daysWithData: number;
  /** Total del año (contador/cantidad), días con «Sí» (sí/no) o promedio (escala). */
  value: number | null;
  longestStreak: number;
  /** Primer día del mes con el valor más alto (null sin datos). */
  bestMonth: string | null;
}

export interface YearReview {
  year: number;
  entries: number;
  activeDays: number;
  /** Registros por mes, de enero a diciembre. */
  entriesByMonth: number[];
  trackers: TrackerYear[];
}

/** Años con registros, del más reciente al más antiguo. */
export function yearsWithData(entries: Pick<Entry, 'date'>[]): number[] {
  return [...new Set(entries.map((e) => Number(e.date.slice(0, 4))))].sort((a, b) => b - a);
}

export function buildYearReview(
  trackers: Tracker[],
  allEntries: Entry[],
  year: number,
  todayDate: string,
): YearReview {
  const prefix = String(year);
  const entries = allEntries.filter((e) => e.date.startsWith(prefix));
  const yearEnd = `${prefix}-12-31`;
  const lastDay = todayDate < yearEnd ? todayDate : yearEnd;
  const entriesByMonth = Array<number>(12).fill(0);
  for (const e of entries) {
    const m = Number(e.date.slice(5, 7)) - 1;
    entriesByMonth[m] = (entriesByMonth[m] ?? 0) + 1;
  }

  const perTracker: TrackerYear[] = trackers
    .map((tracker) => {
      const own = entries.filter((e) => e.trackerId === tracker.id);
      const totals = dailyTotals(tracker, own);
      const values = [...totals.values()];
      let value: number | null = null;
      if (values.length > 0) {
        if (tracker.type === 'scale') value = values.reduce((a, b) => a + b, 0) / values.length;
        else if (tracker.type === 'boolean') value = values.filter((v) => v >= 1).length;
        else value = values.reduce((a, b) => a + b, 0);
      }
      const months = buildSeries(tracker, totals, lastDay, 'month', Number(lastDay.slice(5, 7)));
      const best = months.reduce<(typeof months)[number] | null>(
        (acc, p) =>
          p.value !== null && (acc === null || (acc.value ?? -Infinity) < p.value) ? p : acc,
        null,
      );
      return {
        tracker,
        entries: own.length,
        daysWithData: totals.size,
        value,
        longestStreak: computeStreaks(tracker, totals, lastDay).longest,
        bestMonth: best?.start ?? null,
      };
    })
    .filter((t) => t.entries > 0)
    .sort((a, b) => b.entries - a.entries);

  return {
    year,
    entries: entries.length,
    activeDays: new Set(entries.map((e) => e.date)).size,
    entriesByMonth,
    trackers: perTracker,
  };
}
