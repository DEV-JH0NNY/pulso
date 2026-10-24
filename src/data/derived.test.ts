import { beforeEach, describe, expect, it } from 'vitest';
import { emptyDraft } from '../domain/trackers';
import { db } from './db';
import { createDerived, deleteDerived } from './derived';
import { resetDb } from './testUtils';
import { createTracker, ValidationError } from './trackers';

beforeEach(resetDb);

describe('repositorio de métricas derivadas', () => {
  it('crea y borra', async () => {
    const a = await createTracker({ ...emptyDraft(), name: 'A' });
    const b = await createTracker({ ...emptyDraft(), name: 'B' });
    const m = await createDerived({
      name: ' A por B ',
      icon: '🧮',
      op: 'ratio',
      aId: a.id,
      bId: b.id,
      unit: '',
    });
    expect(m.name).toBe('A por B');
    expect(await db.derived.count()).toBe(1);
    await deleteDerived(m.id);
    expect(await db.derived.count()).toBe(0);
  });
  it('rechaza rastreadores inexistentes', async () => {
    await expect(
      createDerived({ name: 'X', icon: '🧮', op: 'sum', aId: 'no', bId: 'nada', unit: '' }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
