import Dexie, { type EntityTable } from 'dexie';
import type { Entry, Tracker } from '../domain/types';

export interface Setting {
  key: string;
  value: unknown;
}

export class PulsoDB extends Dexie {
  trackers!: EntityTable<Tracker, 'id'>;
  entries!: EntityTable<Entry, 'id'>;
  settings!: EntityTable<Setting, 'key'>;

  constructor(name = 'pulso') {
    super(name);
    this.version(1).stores({
      trackers: 'id, order',
      entries: 'id, trackerId, date, [trackerId+date]',
      settings: 'key',
    });
  }
}

export const db = new PulsoDB();
