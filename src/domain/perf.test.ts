import { describe, expect, it } from 'vitest';
import { dailyTotals } from './aggregate';
import { buildHeatmap } from './heatmap';
import { computeInsights, computeLaggedCorrelations } from './insights';
import { generateSampleData } from './sampleData';
import { buildSeries } from './series';
import { computeStreaks } from './streaks';
import { comparePeriods } from './summary';
import { weekdayProfile } from './weekday';

const time = (fn: () => unknown) => {
  const t0 = performance.now();
  fn();
  return performance.now() - t0;
};

describe('rendimiento con 3 años de datos', () => {
  const data = generateSampleData('2026-10-24', 3 * 365);

  it('el volumen es realista', () => {
    expect(data.entries.length).toBeGreaterThan(6000);
  });

  it('los cálculos de cada pantalla toman menos de lo perceptible', () => {
    const ms: Record<string, number> = {};
    ms.hallazgos = time(() => computeInsights(data.trackers, data.entries));
    ms.desfase = time(() => computeLaggedCorrelations(data.trackers, data.entries));
    ms.estadisticas = time(() => {
      for (const t of data.trackers) {
        const totals = dailyTotals(t, data.entries);
        computeStreaks(t, totals, '2026-10-24');
        comparePeriods(t, totals, '2026-10-24', 'month');
      }
    });
    ms.detalle = time(() => {
      const t = data.trackers[0];
      if (!t) return;
      const totals = dailyTotals(t, data.entries);
      buildHeatmap(t, totals, '2026-10-24');
      buildSeries(t, totals, '2026-10-24', 'month');
      weekdayProfile(t, totals);
    });
    console.info(
      'Tiempos (ms):',
      Object.fromEntries(Object.entries(ms).map(([k, v]) => [k, Math.round(v)])),
    );
    // Umbrales holgados para máquinas de CI lentas; en un portátil son de un dígito a decenas de ms.
    for (const v of Object.values(ms)) expect(v).toBeLessThan(1500);
  });
});
