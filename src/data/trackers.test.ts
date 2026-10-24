import { beforeEach, describe, expect, it } from 'vitest';
import { emptyDraft } from '../domain/trackers';
import { addEntry } from './entries';
import { db } from './db';
import { resetDb } from './testUtils';
import {
  createTracker,
  deleteTracker,
  listTrackers,
  reorderTrackers,
  setTrackerArchived,
  updateTracker,
  ValidationError,
} from './trackers';

beforeEach(resetDb);

describe('repositorio de rastreadores', () => {
  it('crea rastreadores con orden incremental', async () => {
    const a = await createTracker({ ...emptyDraft(), name: ' Café ' });
    const b = await createTracker({ ...emptyDraft(), name: 'Agua' });
    expect(a.name).toBe('Café');
    expect(a.order).toBe(0);
    expect(b.order).toBe(1);
    expect((await listTrackers()).map((t) => t.name)).toEqual(['Café', 'Agua']);
  });

  it('rechaza borradores inválidos', async () => {
    await expect(createTracker({ ...emptyDraft(), name: '' })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it('edita, archiva y reordena', async () => {
    const a = await createTracker({ ...emptyDraft(), name: 'A' });
    const b = await createTracker({ ...emptyDraft(), name: 'B' });
    await updateTracker(a.id, { ...emptyDraft(), name: 'A2', dailyGoal: 3 });
    await setTrackerArchived(b.id, true);
    await reorderTrackers([b.id, a.id]);
    const list = await listTrackers();
    expect(list.map((t) => t.name)).toEqual(['B', 'A2']);
    expect(list[0]?.archived).toBe(true);
    expect(list[1]?.dailyGoal).toBe(3);
  });

  it('al borrar un rastreador borra sus registros', async () => {
    const a = await createTracker({ ...emptyDraft(), name: 'A' });
    await addEntry(a.id, { value: 1, date: '2026-01-01', time: '08:00', note: '' });
    await deleteTracker(a.id);
    expect(await db.entries.count()).toBe(0);
    expect(await db.trackers.count()).toBe(0);
  });
});
