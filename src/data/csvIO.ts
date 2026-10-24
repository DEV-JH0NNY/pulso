import { TRACKER_COLORS } from '../domain/colors';
import { entriesToCsv, entriesToWideCsv, type ImportPlan } from '../domain/csvData';
import { newId } from '../domain/ids';
import { defaultsForType } from '../domain/trackers';
import type { Entry, Tracker } from '../domain/types';
import { db } from './db';

export async function exportCsv(): Promise<string> {
  const [trackers, entries] = await Promise.all([db.trackers.toArray(), db.entries.toArray()]);
  return entriesToCsv(trackers, entries);
}

export async function exportWideCsv(): Promise<string> {
  const [trackers, entries] = await Promise.all([db.trackers.toArray(), db.entries.toArray()]);
  return entriesToWideCsv(trackers, entries);
}

export interface ImportResult {
  entries: number;
  trackers: number;
}

/** Aplica un plan de importación en una sola transacción: o entra todo o nada. */
export async function applyImport(plan: ImportPlan): Promise<ImportResult> {
  return db.transaction('rw', db.trackers, db.entries, async () => {
    const existing = await db.trackers.toArray();
    const byName = new Map(existing.map((t) => [t.name.trim().toLocaleLowerCase('es-CO'), t]));
    let order = existing.reduce((max, t) => Math.max(max, t.order), -1) + 1;
    const now = Date.now();

    const created: Tracker[] = plan.newTrackers.map((p, i) => {
      const t: Tracker = {
        id: newId(),
        name: p.name,
        icon: '📊',
        color:
          (TRACKER_COLORS[(order + i) % TRACKER_COLORS.length] ?? TRACKER_COLORS[0])?.key ??
          'emerald',
        type: p.type,
        unit: p.unit,
        defaultValue: defaultsForType(p.type).defaultValue,
        dailyGoal: null,
        archived: false,
        order: order + i,
        createdAt: now,
        isSample: false,
      };
      byName.set(p.name.trim().toLocaleLowerCase('es-CO'), t);
      return t;
    });
    order += created.length;
    await db.trackers.bulkAdd(created);

    const entries: Entry[] = plan.rows.map((r, i) => {
      const t = byName.get(r.trackerName.trim().toLocaleLowerCase('es-CO'));
      if (!t) throw new Error(`Rastreador no encontrado: ${r.trackerName}`);
      return {
        id: newId(),
        trackerId: t.id,
        value: r.value,
        date: r.date,
        time: r.time,
        note: r.note,
        createdAt: now + i,
        isSample: false,
      };
    });
    await db.entries.bulkAdd(entries);
    return { entries: entries.length, trackers: created.length };
  });
}
