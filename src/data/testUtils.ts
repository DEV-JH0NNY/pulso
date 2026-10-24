import { db } from './db';

/** Vacía todas las tablas. Úsalo en `beforeEach` de las pruebas. */
export async function resetDb(): Promise<void> {
  await db.transaction('rw', [db.trackers, db.entries, db.settings, db.derived], async () => {
    await Promise.all([
      db.trackers.clear(),
      db.entries.clear(),
      db.settings.clear(),
      db.derived.clear(),
    ]);
  });
}
