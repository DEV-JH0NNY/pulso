import { describe, expect, it } from 'vitest';
import { generateSampleData } from './sampleData';
import { buildYearReview, yearsWithData } from './yearReview';

describe('resumen anual', () => {
  const data = generateSampleData('2026-02-10', 60);

  it('lista los años con datos', () => {
    expect(yearsWithData(data.entries)).toEqual([2026, 2025]);
  });

  it('resume el año: registros, días activos, meses y rastreadores', () => {
    const r = buildYearReview(data.trackers, data.entries, 2026, '2026-02-10');
    expect(r.entries).toBe(data.entries.filter((e) => e.date.startsWith('2026')).length);
    expect(r.activeDays).toBe(41);
    expect(r.entriesByMonth.slice(2).every((n) => n === 0)).toBe(true);
    expect(r.entriesByMonth[0]).toBeGreaterThan(0);
    const cafe = r.trackers.find((t) => t.tracker.name === 'Café');
    expect(cafe?.bestMonth).toMatch(/^2026-0[12]-01$/);
    expect(cafe?.value).toBe(
      data.entries
        .filter((e) => e.trackerId === cafe?.tracker.id && e.date.startsWith('2026'))
        .reduce((a, e) => a + e.value, 0),
    );
    // Ordenados por cantidad de registros.
    const counts = r.trackers.map((t) => t.entries);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
  });
});
