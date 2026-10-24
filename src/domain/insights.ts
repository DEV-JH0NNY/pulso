import { dailyTotals } from './aggregate';
import { toCsv } from './csv';
import { addDays } from './dates';
import { formatNumber } from './format';
import { benjaminiHochberg, correlationPValue, pearson } from './stats';
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
  /**
   * Valor p ajustado por Benjamini–Hochberg dentro de su familia (todas las
   * correlaciones del mismo día, o todas las de un día de desfase).
   */
  q: number;
  /** Cantidad de pares comparados en su familia. */
  comparisons: number;
  strength: Strength;
  /** Pares (valor de a, valor de b) de cada día en común, para el diagrama de dispersión. */
  points: [number, number][];
  /** Fecha de cada punto (la del valor de a). */
  dates: string[];
  /** 0: mismo día; 1: a de un día frente a b del día siguiente. */
  lag: 0 | 1;
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
      const res = correlatePair(a, b, totals, 0, minDays);
      if (res.kind === 'ok') correlations.push(res.correlation);
      else if (res.kind === 'pending') pending.push(res.pair);
      else constant.push(res.pair);
    }
  }

  adjustFamily(correlations);
  correlations.sort((x, y) => Math.abs(y.r) - Math.abs(x.r));
  pending.sort((x, y) => y.n - x.n);
  return { correlations, pending, constant };
}

type PairResult =
  { kind: 'pending' | 'constant'; pair: PendingPair } | { kind: 'ok'; correlation: Correlation };

function correlatePair(
  a: Tracker,
  b: Tracker,
  totals: Map<string, Map<string, number>>,
  lag: 0 | 1,
  minDays: number,
): PairResult {
  const ta = totals.get(a.id) as Map<string, number>;
  const tb = totals.get(b.id) as Map<string, number>;
  const xs: number[] = [];
  const ys: number[] = [];
  const dates: string[] = [];
  for (const [date, va] of [...ta].sort(([d1], [d2]) => (d1 < d2 ? -1 : 1))) {
    const vb = tb.get(lag === 0 ? date : addDays(date, lag));
    if (vb !== undefined) {
      xs.push(va);
      ys.push(vb);
      dates.push(date);
    }
  }
  const n = xs.length;
  if (n < minDays) return { kind: 'pending', pair: { a, b, n } };
  const r = pearson(xs, ys);
  if (r === null) return { kind: 'constant', pair: { a, b, n } };
  return {
    kind: 'ok',
    correlation: {
      a,
      b,
      r,
      n,
      p: correlationPValue(r, n),
      q: 1,
      comparisons: 1,
      strength: strengthOf(r),
      points: xs.map((x, k) => [x, ys[k] as number]),
      dates,
      lag,
    },
  };
}

/**
 * Correlaciones con un día de desfase: el total de `a` en un día frente al de
 * `b` al día siguiente, para cada par ordenado (a ≠ b). Solo devuelve las calculables.
 */
export function computeLaggedCorrelations(
  trackers: Tracker[],
  entries: Pick<Entry, 'trackerId' | 'date' | 'value'>[],
  minDays = MIN_COMMON_DAYS,
): Correlation[] {
  const totals = new Map(trackers.map((t) => [t.id, dailyTotals(t, entries)]));
  const out: Correlation[] = [];
  for (const a of trackers) {
    for (const b of trackers) {
      if (a.id === b.id) continue;
      const res = correlatePair(a, b, totals, 1, minDays);
      if (res.kind === 'ok') out.push(res.correlation);
    }
  }
  adjustFamily(out);
  return out.sort((x, y) => Math.abs(y.r) - Math.abs(x.r));
}

/** Asigna q (Benjamini–Hochberg) y el tamaño de la familia a cada correlación. */
function adjustFamily(family: Correlation[]): void {
  const q = benjaminiHochberg(family.map((c) => c.p));
  family.forEach((c, i) => {
    c.q = q[i] as number;
    c.comparisons = family.length;
  });
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
export function describeCorrelation(
  c: Pick<Correlation, 'a' | 'b' | 'r'> & { lag?: 0 | 1 },
): string {
  const when = c.lag === 1 ? 'al día siguiente ' : '';
  return `Los días en que ${condition(c.a)}, ${when}tiendes a ${outcome(c.b, c.r > 0)}.`;
}

const formatP = (name: string, v: number) =>
  v < 0.001 ? `${name} < 0,001` : `${name} = ${formatNumber(v, 3)}`;

/**
 * Explicación honesta de la confianza en el resultado. Si hay varias
 * comparaciones, aclara si el hallazgo resiste la corrección por comparaciones múltiples.
 */
export function describeConfidence(
  c: Pick<Correlation, 'n' | 'p'> & Partial<Pick<Correlation, 'q' | 'comparisons'>>,
): string {
  const p = formatP('p', c.p);
  if (c.p >= SIGNIFICANCE)
    return `Con ${c.n} días en común, todavía podría ser casualidad (${p}). Sigue registrando para confirmarlo.`;
  const base = `Con ${c.n} días en común, es poco probable que sea pura casualidad (${p})`;
  if (c.q === undefined || !c.comparisons || c.comparisons < 2) return `${base}.`;
  return c.q < SIGNIFICANCE
    ? `${base}, incluso considerando que se compararon ${c.comparisons} pares (${formatP('p ajustado', c.q)}).`
    : `${base}, pero como se compararon ${c.comparisons} pares podría ser un falso positivo (${formatP('p ajustado', c.q)}).`;
}

/** Tabla de correlaciones para analizar fuera de la app (una fila por par y desfase). */
export function correlationsToCsv(correlations: Correlation[]): string {
  const rows = correlations.map((c) => [
    c.a.name,
    c.b.name,
    String(c.lag),
    String(Math.round(c.r * 1e4) / 1e4),
    String(c.n),
    c.p.toPrecision(3),
    c.q.toPrecision(3),
    c.strength,
  ]);
  return toCsv([
    ['rastreador_a', 'rastreador_b', 'desfase_dias', 'r', 'n', 'p', 'p_ajustado_bh', 'fuerza'],
    ...rows,
  ]);
}
