import { beforeEach, describe, expect, it } from 'vitest';
import { parseBackup } from '../domain/backup';
import { emptyDraft } from '../domain/trackers';
import { exportBackup, restoreBackup } from './backupIO';
import { db } from './db';
import { addEntry } from './entries';
import { resetDb } from './testUtils';
import { createTracker } from './trackers';

beforeEach(resetDb);

async function backupOf() {
  const res = parseBackup(await exportBackup());
  if (!res.ok) throw new Error(res.error);
  return res.backup;
}

describe('respaldo en la base de datos', () => {
  it('reemplazar deja exactamente lo del respaldo', async () => {
    const t = await createTracker({ ...emptyDraft(), name: 'Café', dailyGoal: 2 });
    await addEntry(t.id, { value: 1, date: '2026-01-01', time: '08:00', note: 'x' });
    const backup = await backupOf();
    await createTracker({ ...emptyDraft(), name: 'Otro' });
    await restoreBackup(backup, 'replace');
    expect((await db.trackers.toArray()).map((x) => x.name)).toEqual(['Café']);
    expect((await db.trackers.toArray())[0]?.dailyGoal).toBe(2);
    expect(await db.entries.count()).toBe(1);
  });

  it('combinar conserva lo existente y no duplica', async () => {
    const t = await createTracker({ ...emptyDraft(), name: 'Café' });
    await addEntry(t.id, { value: 1, date: '2026-01-01', time: '08:00', note: '' });
    const backup = await backupOf();
    await createTracker({ ...emptyDraft(), name: 'Otro' });
    await restoreBackup(backup, 'merge');
    expect(await db.trackers.count()).toBe(2);
    expect(await db.entries.count()).toBe(1);
  });
});
