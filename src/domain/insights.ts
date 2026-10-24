import { dailyTotals } from './aggregate';
import { formatNumber } from './format';
import { correlationPValue, pearson } from './stats';
import type { Entry, Tracker } from './types';

/** Días con datos en común necesarios para calcular una correlación. */
export const MIN_COMMON_DAYS = 14;
/** Nivel de significancia usado para decir "poco probable que sea casualidad". */
export const SIGNIFICANCE = 0.05;

export type Strength = 'nula' | 'débil' | 'moderada' | 'fuerte';

export interface Correlation {
  a: Tracker;
  b: Tracker;
  r: number;
  /** Días con datos en ambos rastreadores. */
  n: number;
  p: number;
  strength: Strength;
  /** Pares (valor de a, valor de b) de cada día en común, para el diagrama de dispersión. */
  points: [number, number][];
}

export interface PendingPair {
  a: Tracker;
  b: Tracker;
  n: number;
}

export interface Insights {
  correlations: Correlation[];
  /** Pares con menos de MIN_COMMON_DAYS días en común. */
  pending: PendingPair[];
  /** Pares con días suficientes pero donde algún rastreador no varía. */
  constant: PendingPair[];
}

export function strengthOf(r: number): Strength {
  const a = Math.abs(r);
  if (a < 0.1) return 'nula';
  if (a < 0.3) return 'débil';
  if (a < 0.5) return 'moderada';
  return 'fuerte';
}

/**
 * Correlaciones de Pearson entre los totales diarios de cada par de
 * rastreadores, usando solo los días en que ambos tienen registros.
 */
export function computeInsights(
  trackers: Tracker[],
  entries: Pick<Entry, 'trackerId' | 'date' | 'value'>[],
  minDays = MIN_COMMON_DAYS,
): Insights {
  const totals = new Map(trackers.map((t) => [t.id, dailyTotals(t, entries)]));
  const correlations: Correlation[] = [];
  const pending: PendingPair[] = [];
  const constant: PendingPair[] = [];

  for (let i = 0; i < trackers.length; i++) {
    for (let j = i + 1; j < trackers.length; j++) {
      const a = trackers[i] as Tracker;
      const b = trackers[j] as Tracker;
      const ta = totals.get(a.id) as Map<string, number>;
      const tb = totals.get(b.id) as Map<string, number>;
      const xs: number[] = [];
      const ys: number[] = [];
      for (const [date, va] of ta) {
        const vb = tb.get(date);
        if (vb !== undefined) {
          xs.push(va);
          ys.push(vb);
        }
      }
      const n = xs.length;
      if (n < minDays) {
        pending.push({ a, b, n });
        continue;
      }
      const r = pearson(xs, ys);
      if (r === null) {
        constant.push({ a, b, n });
        continue;
      }
      correlations.push({
        a,
        b,
        r,
        n,
        p: correlationPValue(r, n),
        strength: strengthOf(r),
        points: xs.map((x, k) => [x, ys[k] as number]),
      });
    }
  }

  correlations.sort((x, y) => Math.abs(y.r) - Math.abs(x.r));
  pending.sort((x, y) => y.n - x.n);
  return { correlations, pending, constant };
}

function condition(t: Tracker): string {
  switch (t.type) {
    case 'boolean':
      return `marcas «${t.name}» como Sí`;
    case 'scale':
      return `calificas «${t.name}» más alto`;
    default:
      return `registras más «${t.name}»`;
  }
}

function outcome(t: Tracker, positive: boolean): string {
  switch (t.type) {
    case 'boolean':
      return positive ? `marcar también «${t.name}»` : `no marcar «${t.name}»`;
    case 'scale':
      return `calificar «${t.name}» ${positive ? 'más alto' : 'más bajo'}`;
    default:
      return `registrar ${positive ? 'más' : 'menos'} «${t.name}»`;
  }
}

/** Frase en lenguaje simple: "Los días en que registras más «Café», tiendes a registrar menos «Sueño»." */
export function describeCorrelation(c: Pick<Correlation, 'a' | 'b' | 'r'>): string {
  return `Los días en que ${condition(c.a)}, tiendes a ${outcome(c.b, c.r > 0)}.`;
}

/** Explicación honesta de la confianza en el resultado. */
export function describeConfidence(c: Pick<Correlation, 'n' | 'p'>): string {
  const p = c.p < 0.001 ? 'p < 0,001' : `p = ${formatNumber(c.p, 3)}`;
  return c.p < SIGNIFICANCE
    ? `Con ${c.n} días en común, es poco probable que sea pura casualidad (${p}).`
    : `Con ${c.n} días en común, todavía podría ser casualidad (${p}). Sigue registrando para confirmarlo.`;
}
