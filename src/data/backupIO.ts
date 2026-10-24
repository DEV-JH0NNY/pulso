import { createBackup, type Backup } from '../domain/backup';
import { db } from './db';

export async function exportBackup(): Promise<string> {
  const [trackers, entries, derived] = await Promise.all([
    db.trackers.toArray(),
    db.entries.toArray(),
    db.derived.toArray(),
  ]);
  return JSON.stringify(createBackup(trackers, entries, new Date(), derived), null, 2);
}

export type RestoreMode = 'replace' | 'merge';

/**
 * Restaura un respaldo validado. "replace" borra todo antes; "merge" agrega o
 * actualiza por id y conserva lo que no esté en el respaldo.
 */
export async function restoreBackup(backup: Backup, mode: RestoreMode): Promise<void> {
  await db.transaction('rw', db.trackers, db.entries, db.derived, async () => {
    if (mode === 'replace') {
      await db.entries.clear();
      await db.trackers.clear();
      await db.derived.clear();
    }
    await db.trackers.bulkPut(backup.trackers);
    await db.entries.bulkPut(backup.entries);
    await db.derived.bulkPut(backup.derived ?? []);
  });
}
