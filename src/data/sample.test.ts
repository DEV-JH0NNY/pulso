import { beforeEach, describe, expect, it } from 'vitest';
import { emptyDraft } from '../domain/trackers';
import { db } from './db';
import { addEntry } from './entries';
import { clearSampleData, hasSampleData, loadSampleData } from './sample';
import { getSetting, ONBOARDING_DONE } from './settings';
import { resetDb } from './testUtils';
import { createTracker } from './trackers';

beforeEach(resetDb);

describe('datos de ejemplo en la base de datos', () => {
  it('carga una sola vez aunque se llame dos veces', async () => {
    await loadSampleData(new Date(2026, 9, 24, 12, 0));
    const count = await db.entries.count();
    await loadSampleData(new Date(2026, 9, 24, 12, 0));
    expect(await db.entries.count()).toBe(count);
    expect(await db.trackers.count()).toBe(6);
    expect(await hasSampleData()).toBe(true);
    expect(await getSetting(ONBOARDING_DONE, false)).toBe(true);
    const todays = await db.entries.where('date').equals('2026-10-24').toArray();
    expect(todays.every((e) => e.time <= '12:00')).toBe(true);
  });

  it('borra solo lo de ejemplo y conserva los datos reales', async () => {
    const mine = await createTracker({ ...emptyDraft(), name: 'Mío' });
    await addEntry(mine.id, { value: 1, date: '2026-10-24', time: '08:00', note: '' });
    await loadSampleData(new Date(2026, 9, 24, 12, 0));
    const sampleTracker = (await db.trackers.toArray()).find((t) => t.isSample);
    // Un registro hecho a mano en un rastreador de ejemplo también se borra.
    if (!sampleTracker) throw new Error('faltan rastreadores de ejemplo');
    await addEntry(sampleTracker.id, { value: 1, date: '2026-10-24', time: '09:00', note: '' });
    await clearSampleData();
    expect(await hasSampleData()).toBe(false);
    expect((await db.trackers.toArray()).map((t) => t.name)).toEqual(['Mío']);
    expect(await db.entries.count()).toBe(1);
  });
});
