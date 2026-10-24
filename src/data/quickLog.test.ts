import { beforeEach, describe, expect, it } from 'vitest';
import { emptyDraft } from '../domain/trackers';
import { db } from './db';
import { quickLog } from './quickLog';
import { resetDb } from './testUtils';
import { createTracker } from './trackers';

beforeEach(resetDb);

describe('quickLog', () => {
  it('registra el valor por defecto con la fecha y hora actuales', async () => {
    const t = await createTracker({ ...emptyDraft(), name: 'Café', defaultValue: 2 });
    const e = await quickLog(t, null, new Date(2026, 9, 24, 8, 5));
    expect(e).toMatchObject({ value: 2, date: '2026-10-24', time: '08:05', trackerId: t.id });
  });

  it('no duplica un sí/no ya marcado hoy', async () => {
    const t = await createTracker({ ...emptyDraft(), name: 'Ejercicio', type: 'boolean' });
    expect(await quickLog(t, 1)).toBeNull();
    expect(await db.entries.count()).toBe(0);
    expect(await quickLog(t, 0)).not.toBeNull();
  });
});
