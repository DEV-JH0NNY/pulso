import { describe, expect, it } from 'vitest';
import { groupEntriesByDay } from './history';
import type { Entry } from './types';

const e = (id: string, date: string, time: string, createdAt = 0): Entry => ({
  id,
  trackerId: 't',
  value: 1,
  date,
  time,
  note: '',
  createdAt,
  isSample: false,
});

describe('groupEntriesByDay', () => {
  it('agrupa y ordena de lo más reciente a lo más antiguo', () => {
    const groups = groupEntriesByDay([
      e('a', '2026-01-01', '08:00'),
      e('b', '2026-01-02', '07:00'),
      e('c', '2026-01-01', '21:00'),
      e('d', '2026-01-01', '21:00', 5),
    ]);
    expect(groups.map((g) => g.date)).toEqual(['2026-01-02', '2026-01-01']);
    expect(groups[1]?.entries.map((x) => x.id)).toEqual(['d', 'c', 'a']);
  });

  it('lista vacía', () => {
    expect(groupEntriesByDay([])).toEqual([]);
  });
});
