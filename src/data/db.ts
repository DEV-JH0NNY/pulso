import Dexie, { type EntityTable } from 'dexie';
import type { DerivedMetric } from '../domain/derived';
import type { Entry, Tracker } from '../domain/types';

export interface Setting {
  key: string;
  value: unknown;
}

export class PulsoDB extends Dexie {
  trackers!: EntityTable<Tracker, 'id'>;
  entries!: EntityTable<Entry, 'id'>;
  settings!: EntityTable<Setting, 'key'>;
  derived!: EntityTable<DerivedMetric, 'id'>;

  constructor(name = 'pulso') {
    super(name);
    this.version(1).stores({
      trackers: 'id, order',
      entries: 'id, trackerId, date, [trackerId+date]',
      settings: 'key',
    });
    // v2: métricas derivadas. Solo agrega una tabla; los datos existentes no cambian.
    this.version(2).stores({ derived: 'id' });
  }
}

export const db = new PulsoDB();
