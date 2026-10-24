import { validateDerivedDraft, type DerivedDraft, type DerivedMetric } from '../domain/derived';
import { newId } from '../domain/ids';
import { db } from './db';
import { ValidationError } from './trackers';

export async function createDerived(draft: DerivedDraft): Promise<DerivedMetric> {
  const ids = new Set((await db.trackers.toArray()).map((t) => t.id));
  const errors = validateDerivedDraft(draft, ids);
  if (Object.keys(errors).length > 0) throw new ValidationError(errors);
  const metric: DerivedMetric = {
    ...draft,
    name: draft.name.trim(),
    unit: draft.unit.trim(),
    id: newId(),
    createdAt: Date.now(),
  };
  await db.derived.add(metric);
  return metric;
}

export async function deleteDerived(id: string): Promise<void> {
  await db.derived.delete(id);
}
