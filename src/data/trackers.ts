import { today } from '../domain/dates';
import { recordGoalChange } from '../domain/goalHistory';
import { newId } from '../domain/ids';
import { normalizeDraft, sortTrackers, validateTrackerDraft } from '../domain/trackers';
import type { Tracker, TrackerDraft } from '../domain/types';
import { db } from './db';

export class ValidationError extends Error {
  readonly errors: Record<string, string>;

  constructor(errors: Record<string, string>) {
    super(Object.values(errors).join(' '));
    this.errors = errors;
    this.name = 'ValidationError';
  }
}

function assertValid(draft: TrackerDraft) {
  const errors = validateTrackerDraft(draft);
  if (Object.keys(errors).length > 0) throw new ValidationError(errors as Record<string, string>);
}

export async function listTrackers(): Promise<Tracker[]> {
  return sortTrackers(await db.trackers.toArray());
}

export async function getTracker(id: string): Promise<Tracker | undefined> {
  return db.trackers.get(id);
}

export async function createTracker(
  draft: TrackerDraft,
  options: { isSample?: boolean } = {},
): Promise<Tracker> {
  assertValid(draft);
  const last = await db.trackers.orderBy('order').last();
  const tracker: Tracker = {
    ...normalizeDraft(draft),
    id: newId(),
    archived: false,
    order: last ? last.order + 1 : 0,
    createdAt: Date.now(),
    isSample: options.isSample ?? false,
  };
  await db.trackers.add(tracker);
  return tracker;
}

/**
 * Guarda los cambios. Si cambia la meta, la anterior queda registrada como
 * vigente hasta ayer para que los días pasados se sigan evaluando con ella.
 */
export async function updateTracker(
  id: string,
  draft: TrackerDraft,
  todayDate: string = today(),
): Promise<void> {
  assertValid(draft);
  await db.transaction('rw', db.trackers, async () => {
    const existing = await db.trackers.get(id);
    if (!existing) throw new Error('El rastreador no existe.');
    const next = normalizeDraft(draft);
    const goalChanges = recordGoalChange(existing, next, todayDate);
    // Los campos opcionales que el borrador ya no trae deben borrarse, no heredarse.
    const { goalDirection: _gd, weeklyTarget: _wt, activeDays: _ad, ...base } = existing;
    await db.trackers.put({ ...base, ...next, goalChanges });
  });
}

export async function setTrackerArchived(id: string, archived: boolean): Promise<void> {
  await db.trackers.update(id, { archived });
}

/** Guarda el nuevo orden: la posición de cada id en la lista pasa a ser su `order`. */
export async function reorderTrackers(orderedIds: string[]): Promise<void> {
  await db.transaction('rw', db.trackers, async () => {
    await Promise.all(orderedIds.map((id, order) => db.trackers.update(id, { order })));
  });
}

/** Borra el rastreador, todos sus registros y las métricas derivadas que lo usan. */
export async function deleteTracker(id: string): Promise<void> {
  await db.transaction('rw', db.trackers, db.entries, db.derived, async () => {
    await db.entries.where('trackerId').equals(id).delete();
    await db.derived.filter((m) => m.aId === id || m.bId === id).delete();
    await db.trackers.delete(id);
  });
}
