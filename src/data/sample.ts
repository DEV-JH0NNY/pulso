import { toTime, today } from '../domain/dates';
import { generateSampleData } from '../domain/sampleData';
import { db } from './db';
import { ONBOARDING_DONE, setSetting } from './settings';

/** Carga los datos de ejemplo (todos marcados con `isSample`). */
export async function loadSampleData(now: Date = new Date()): Promise<void> {
  const todayDate = today(now);
  const currentTime = toTime(now);
  const data = generateSampleData(todayDate);
  const trackers = data.trackers;
  // No se crean registros de hoy con una hora que todavía no ha llegado.
  const entries = data.entries.filter((e) => e.date < todayDate || e.time <= currentTime);
  await db.transaction('rw', db.trackers, db.entries, db.settings, async () => {
    const last = await db.trackers.orderBy('order').last();
    const offset = last ? last.order + 1 : 0;
    // bulkPut: si ya estaban cargados, se reemplazan en lugar de duplicarse.
    await db.trackers.bulkPut(trackers.map((t) => ({ ...t, order: t.order + offset })));
    await db.entries.bulkPut(entries);
    await setSetting(ONBOARDING_DONE, true);
  });
}

/** Borra todos los rastreadores y registros de ejemplo, y los registros hechos en ellos. */
export async function clearSampleData(): Promise<number> {
  return db.transaction('rw', db.trackers, db.entries, async () => {
    const sampleIds = (await db.trackers.filter((t) => t.isSample).toArray()).map((t) => t.id);
    const removed = await db.entries
      .filter((e) => e.isSample || sampleIds.includes(e.trackerId))
      .delete();
    await db.trackers.bulkDelete(sampleIds);
    return removed;
  });
}

export async function hasSampleData(): Promise<boolean> {
  return (await db.trackers.filter((t) => t.isSample).count()) > 0;
}
