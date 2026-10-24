import Dexie from 'dexie';
import { describe, expect, it } from 'vitest';
import { PulsoDB } from './db';

describe('migraciones de la base de datos', () => {
  it('abrir una base v1 con la versión actual conserva los datos y agrega las tablas nuevas', async () => {
    const name = 'pulso-migracion';
    const v1 = new Dexie(name);
    v1.version(1).stores({
      trackers: 'id, order',
      entries: 'id, trackerId, date, [trackerId+date]',
      settings: 'key',
    });
    await v1.table('trackers').add({ id: 't1', name: 'Café', order: 0 });
    await v1.table('entries').add({ id: 'e1', trackerId: 't1', date: '2026-01-01', value: 1 });
    v1.close();

    const current = new PulsoDB(name);
    expect(await current.trackers.count()).toBe(1);
    expect(
      await current.entries.where('[trackerId+date]').equals(['t1', '2026-01-01']).count(),
    ).toBe(1);
    expect(await current.derived.count()).toBe(0);
    current.close();
    await Dexie.delete(name);
  });
});
