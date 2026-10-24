import { describe, expect, it } from 'vitest';
import { computeInsights } from './insights';
import { generateSampleData, seededRandom } from './sampleData';
import { validateEntryValue, validateTrackerDraft } from './trackers';

describe('datos de ejemplo', () => {
  it('el generador con semilla es reproducible', () => {
    const a = seededRandom(1);
    const b = seededRandom(1);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  const data = generateSampleData('2026-10-24');

  it('todo queda marcado como ejemplo y es válido', () => {
    expect(data.trackers).toHaveLength(6);
    expect(data.trackers.every((t) => t.isSample)).toBe(true);
    expect(data.entries.every((e) => e.isSample)).toBe(true);
    for (const t of data.trackers) expect(validateTrackerDraft(t)).toEqual({});
    const byId = new Map(data.trackers.map((t) => [t.id, t]));
    for (const e of data.entries) {
      const t = byId.get(e.trackerId);
      if (!t) throw new Error(`registro sin rastreador: ${e.trackerId}`);
      expect(validateEntryValue(t.type, e.value)).toBeNull();
      expect(e.date <= '2026-10-24').toBe(true);
      expect(e.time).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  it('cubre el rango pedido y es determinista', () => {
    const dates = data.entries.map((e) => e.date).sort();
    expect(dates[0]).toBe('2026-06-27');
    expect(dates.at(-1)).toBe('2026-10-24');
    expect(generateSampleData('2026-10-24').entries.map((e) => e.value)).toEqual(
      data.entries.map((e) => e.value),
    );
  });

  it('produce hallazgos para la pantalla de correlaciones', () => {
    const insights = computeInsights(data.trackers, data.entries);
    const strong = insights.correlations.filter((c) => Math.abs(c.r) >= 0.3);
    expect(strong.length).toBeGreaterThanOrEqual(3);
  });
});
