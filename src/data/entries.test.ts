import { beforeEach, describe, expect, it } from 'vitest';
import { emptyDraft } from '../domain/trackers';
import {
  addEntry,
  deleteEntry,
  entriesBetween,
  entriesForDate,
  restoreEntry,
  updateEntry,
} from './entries';
import { resetDb } from './testUtils';
import { createTracker } from './trackers';

beforeEach(resetDb);

const base = { date: '2026-01-02', time: '09:30', note: '' };

describe('repositorio de registros', () => {
  it('agrega, edita, borra y restaura', async () => {
    const t = await createTracker({ ...emptyDraft(), name: 'Café' });
    const e = await addEntry(t.id, { ...base, value: 1, note: '  rico ' });
    expect(e.note).toBe('rico');
    await updateEntry(e.id, { ...base, value: 2 });
    expect((await entriesForDate('2026-01-02'))[0]?.value).toBe(2);
    const deleted = await deleteEntry(e.id);
    expect(await entriesForDate('2026-01-02')).toHaveLength(0);
    if (!deleted) throw new Error('debería devolver el registro borrado');
    await restoreEntry(deleted);
    expect(await entriesForDate('2026-01-02')).toHaveLength(1);
  });

  it('valida el valor según el tipo y la fecha', async () => {
    const t = await createTracker({
      ...emptyDraft(),
      name: 'Ánimo',
      type: 'scale',
      defaultValue: 3,
    });
    await expect(addEntry(t.id, { ...base, value: 7 })).rejects.toThrow();
    await expect(addEntry(t.id, { ...base, value: 3, date: '2026-02-30' })).rejects.toThrow();
    await expect(addEntry('no-existe', { ...base, value: 1 })).rejects.toThrow();
  });

  it('consulta por rango de fechas', async () => {
    const t = await createTracker({ ...emptyDraft(), name: 'Café' });
    for (const date of ['2026-01-01', '2026-01-05', '2026-01-10']) {
      await addEntry(t.id, { ...base, date, value: 1 });
    }
    expect((await entriesBetween('2026-01-01', '2026-01-05')).map((e) => e.date).sort()).toEqual([
      '2026-01-01',
      '2026-01-05',
    ]);
  });
});
