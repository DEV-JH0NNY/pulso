import { newId } from '../domain/ids';
import { validateEntryValue } from '../domain/trackers';
import { isValidISODate, isValidTime } from '../domain/dates';
import type { Entry, EntryDraft } from '../domain/types';
import { db } from './db';

async function assertValid(trackerId: string, draft: EntryDraft) {
  const tracker = await db.trackers.get(trackerId);
  if (!tracker) throw new Error('El rastreador no existe.');
  const valueError = validateEntryValue(tracker.type, draft.value);
  if (valueError) throw new Error(valueError);
  if (!isValidISODate(draft.date)) throw new Error('Fecha inválida.');
  if (!isValidTime(draft.time)) throw new Error('Hora inválida.');
  return tracker;
}

export async function addEntry(trackerId: string, draft: EntryDraft): Promise<Entry> {
  const tracker = await assertValid(trackerId, draft);
  const entry: Entry = {
    id: newId(),
    trackerId,
    value: draft.value,
    date: draft.date,
    time: draft.time,
    note: draft.note.trim(),
    createdAt: Date.now(),
    isSample: tracker.isSample,
  };
  await db.entries.add(entry);
  return entry;
}

export async function updateEntry(id: string, draft: EntryDraft): Promise<void> {
  const existing = await db.entries.get(id);
  if (!existing) throw new Error('El registro no existe.');
  await assertValid(existing.trackerId, draft);
  await db.entries.update(id, { ...draft, note: draft.note.trim() });
}

export async function deleteEntry(id: string): Promise<Entry | undefined> {
  const existing = await db.entries.get(id);
  await db.entries.delete(id);
  return existing;
}

/** Vuelve a insertar un registro borrado (para deshacer). */
export async function restoreEntry(entry: Entry): Promise<void> {
  await db.entries.put(entry);
}

export async function entriesForDate(date: string): Promise<Entry[]> {
  return db.entries.where('date').equals(date).toArray();
}

/** Registros entre dos fechas (ambas incluidas). */
export async function entriesBetween(from: string, to: string): Promise<Entry[]> {
  return db.entries.where('date').between(from, to, true, true).toArray();
}

export async function entriesForTracker(trackerId: string): Promise<Entry[]> {
  return db.entries.where('trackerId').equals(trackerId).toArray();
}
