import { describe, expect, it } from 'vitest';
import { addDays } from './dates';
import {
  computeInsights,
  computeLaggedCorrelations,
  correlationsToCsv,
  describeConfidence,
  describeCorrelation,
  strengthOf,
} from './insights';
import type { Entry, Tracker } from './types';

const tracker = (id: string, name: string, type: Tracker['type'] = 'quantity'): Tracker => ({
  id,
  name,
  icon: '⭐',
  color: 'emerald',
  type,
  unit: '',
  defaultValue: 1,
  dailyGoal: null,
  archived: false,
  order: 0,
  createdAt: 0,
  isSample: false,
});

function entries(trackerId: string, values: number[], start = '2026-01-01') {
  return values.map((value, i): Pick<Entry, 'trackerId' | 'date' | 'value'> => ({
    trackerId,
    date: addDays(start, i),
    value,
  }));
}

describe('hallazgos', () => {
  const sleep = tracker('s', 'Sueño');
  const coffee = tracker('c', 'Café', 'counter');
  const mood = tracker('m', 'Ánimo', 'scale');

  it('no calcula con menos de 14 días en común', () => {
    const data = [...entries('s', [7, 8, 6, 7, 8]), ...entries('c', [1, 2, 3, 1, 2])];
    const res = computeInsights([sleep, coffee], data);
    expect(res.correlations).toHaveLength(0);
    expect(res.pending).toEqual([{ a: sleep, b: coffee, n: 5 }]);
  });

  it('solo usa días con datos en ambos rastreadores', () => {
    const s = Array.from({ length: 20 }, (_, i) => 5 + (i % 4));
    const c = s.map((v) => 10 - v);
    // El café arranca 10 días después: solo 10 días en común.
    const data = [...entries('s', s), ...entries('c', c.slice(10), '2026-01-11')];
    const res = computeInsights([sleep, coffee], data);
    expect(res.pending[0]?.n).toBe(10);
  });

  it('detecta una correlación negativa fuerte y significativa', () => {
    const s = Array.from({ length: 20 }, (_, i) => 5 + (i % 4));
    const c = s.map((v, i) => 10 - v + (i % 2) * 0.5);
    const res = computeInsights([sleep, coffee], [...entries('s', s), ...entries('c', c)]);
    const [corr] = res.correlations;
    expect(corr?.r).toBeLessThan(-0.9);
    expect(corr?.n).toBe(20);
    expect(corr?.strength).toBe('fuerte');
    expect(corr?.p).toBeLessThan(0.001);
  });

  it('separa pares donde un rastreador no varía', () => {
    const s = Array.from({ length: 15 }, (_, i) => i);
    const c = Array.from({ length: 15 }, () => 1);
    const res = computeInsights([sleep, coffee], [...entries('s', s), ...entries('c', c)]);
    expect(res.constant).toHaveLength(1);
    expect(res.correlations).toHaveLength(0);
  });

  it('ordena por fuerza absoluta', () => {
    const base = Array.from({ length: 30 }, (_, i) => (i * 7) % 11);
    const strong = base.map((v) => v * 2);
    const weak = base.map((v, i) => ((i * 13) % 7) + v * 0.1);
    const res = computeInsights(
      [sleep, coffee, mood],
      [...entries('s', base), ...entries('c', strong), ...entries('m', weak)],
    );
    const rs = res.correlations.map((c) => Math.abs(c.r));
    expect(rs).toEqual([...rs].sort((a, b) => b - a));
  });

  it('clasifica la fuerza', () => {
    expect(strengthOf(0.05)).toBe('nula');
    expect(strengthOf(-0.2)).toBe('débil');
    expect(strengthOf(0.4)).toBe('moderada');
    expect(strengthOf(-0.8)).toBe('fuerte');
  });

  it('explica en lenguaje simple', () => {
    expect(describeCorrelation({ a: coffee, b: sleep, r: -0.6 })).toBe(
      'Los días en que registras más «Café», tiendes a registrar menos «Sueño».',
    );
    expect(describeCorrelation({ a: tracker('e', 'Ejercicio', 'boolean'), b: mood, r: 0.4 })).toBe(
      'Los días en que marcas «Ejercicio» como Sí, tiendes a calificar «Ánimo» más alto.',
    );
    expect(describeConfidence({ n: 20, p: 0.0004 })).toMatch(/poco probable.*p < 0,001/);
    expect(describeConfidence({ n: 15, p: 0.2 })).toMatch(/podría ser casualidad \(p = 0,2\)/);
  });
});

describe('hallazgos con desfase', () => {
  it('detecta que lo de un día se relaciona con el día siguiente', () => {
    const sleep = tracker('s', 'Sueño');
    const mood = tracker('m', 'Ánimo', 'scale');
    const s = Array.from({ length: 30 }, (_, i) => 5 + ((i * 7) % 5));
    // El ánimo de cada día copia el sueño del día anterior.
    const m = [3, ...s.slice(0, -1).map((v) => Math.min(5, Math.max(1, v - 4)))];
    const lagged = computeLaggedCorrelations(
      [sleep, mood],
      [...entries('s', s), ...entries('m', m)],
    );
    const top = lagged[0];
    expect(top?.a.id).toBe('s');
    expect(top?.b.id).toBe('m');
    expect(top?.lag).toBe(1);
    expect(top?.r).toBeGreaterThan(0.9);
    expect(top?.n).toBe(29);
    if (!top) throw new Error('sin resultados');
    expect(describeCorrelation(top)).toBe(
      'Los días en que registras más «Sueño», al día siguiente tiendes a calificar «Ánimo» más alto.',
    );
  });
});

describe('exportar hallazgos', () => {
  it('genera una fila por correlación', () => {
    const a = tracker('a', 'Café, con leche');
    const b = tracker('b', 'Sueño');
    const csv = correlationsToCsv([
      {
        a,
        b,
        r: -0.61234,
        n: 30,
        p: 0.000312,
        q: 0.001,
        comparisons: 3,
        strength: 'fuerte',
        points: [],
        dates: [],
        lag: 1,
      },
    ]);
    expect(csv).toBe(
      'rastreador_a,rastreador_b,desfase_dias,r,n,p,p_ajustado_bh,fuerza\r\n"Café, con leche",Sueño,1,-0.6123,30,0.000312,0.00100,fuerte\r\n',
    );
  });
});

describe('comparaciones múltiples', () => {
  it('explica si un hallazgo resiste la corrección', () => {
    expect(describeConfidence({ n: 30, p: 0.01, q: 0.02, comparisons: 10 })).toMatch(
      /incluso considerando que se compararon 10 pares \(p ajustado = 0,02\)/,
    );
    expect(describeConfidence({ n: 30, p: 0.03, q: 0.2, comparisons: 10 })).toMatch(
      /podría ser un falso positivo \(p ajustado = 0,2\)/,
    );
  });

  it('computeInsights asigna q a cada correlación', () => {
    const s = Array.from({ length: 20 }, (_, i) => (i * 7) % 11);
    const res = computeInsights(
      [tracker('a', 'A'), tracker('b', 'B'), tracker('c', 'C')],
      [
        ...entries('a', s),
        ...entries(
          'b',
          s.map((v) => v * 2 + 1),
        ),
        ...entries(
          'c',
          s.map((v, i) => (v * i) % 5),
        ),
      ],
    );
    for (const c of res.correlations) {
      expect(c.comparisons).toBe(3);
      expect(c.q).toBeGreaterThanOrEqual(c.p);
    }
  });
});
