import { beforeEach, describe, expect, it } from 'vitest';
import { planImport } from '../domain/csvData';
import { emptyDraft } from '../domain/trackers';
import { applyImport, exportCsv } from './csvIO';
import { db } from './db';
import { addEntry } from './entries';
import { resetDb } from './testUtils';
import { createTracker } from './trackers';

beforeEach(resetDb);

describe('importación y exportación con la base de datos', () => {
  it('exporta, borra y vuelve a importar sin perder datos', async () => {
    const t = await createTracker({ ...emptyDraft(), name: 'Sueño', type: 'quantity', unit: 'h' });
    await addEntry(t.id, { value: 7.5, date: '2026-01-01', time: '07:00', note: 'bien' });
    await addEntry(t.id, { value: 6, date: '2026-01-02', time: '07:10', note: '' });
    const csv = await exportCsv();

    await resetDb();
    const plan = planImport(csv, [], []);
    const result = await applyImport(plan);
    expect(result).toEqual({ entries: 2, trackers: 1 });
    const [tracker] = await db.trackers.toArray();
    expect(tracker).toMatchObject({ name: 'Sueño', type: 'quantity', unit: 'h' });
    expect(await exportCsv()).toBe(csv);
  });

  it('agrega registros a rastreadores existentes', async () => {
    const t = await createTracker({ ...emptyDraft(), name: 'Café' });
    const trackers = await db.trackers.toArray();
    const plan = planImport('fecha,hora,rastreador,valor\n2026-01-01,08:00,café,2\n', trackers, []);
    await applyImport(plan);
    const [e] = await db.entries.toArray();
    expect(e).toMatchObject({ trackerId: t.id, value: 2 });
    expect(await db.trackers.count()).toBe(1);
  });
});

describe('apariencia al importar', () => {
  it('asigna ícono según el nombre del rastreador nuevo', async () => {
    const plan = planImport(
      'fecha,hora,rastreador,valor,unidad\n2026-01-01,08:00,Café,2,tazas\n2026-01-01,09:00,Raro,1,\n',
      [],
      [],
    );
    await applyImport(plan);
    const icons = Object.fromEntries((await db.trackers.toArray()).map((t) => [t.name, t.icon]));
    expect(icons).toEqual({ Café: '☕', Raro: '📊' });
  });
});
