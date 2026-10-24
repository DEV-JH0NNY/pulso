import { describe, expect, it } from 'vitest';
import {
  benjaminiHochberg,
  correlationPValue,
  logGamma,
  mean,
  median,
  pearson,
  regularizedBeta,
} from './stats';

describe('estadística', () => {
  it('promedio', () => {
    expect(mean([1, 2, 3, 4])).toBe(2.5);
  });

  it('pearson: casos perfectos y nulos', () => {
    expect(pearson([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1);
    expect(pearson([1, 2, 3, 4], [8, 6, 4, 2])).toBeCloseTo(-1);
    expect(pearson([1, 2, 3], [5, 5, 5])).toBeNull();
    expect(pearson([1, 2], [1, 2])).toBeNull();
  });

  it('pearson: valor conocido', () => {
    // Calculado con numpy.corrcoef
    const x = [43, 21, 25, 42, 57, 59];
    const y = [99, 65, 79, 75, 87, 81];
    expect(pearson(x, y)).toBeCloseTo(0.529809, 5);
  });

  it('pearson exige series de igual longitud', () => {
    expect(() => pearson([1, 2, 3], [1, 2])).toThrow();
  });

  it('logGamma coincide con factoriales', () => {
    expect(Math.exp(logGamma(5))).toBeCloseTo(24, 6);
    expect(Math.exp(logGamma(0.5))).toBeCloseTo(Math.sqrt(Math.PI), 6);
  });

  it('beta incompleta regularizada', () => {
    expect(regularizedBeta(0.5, 2, 2)).toBeCloseTo(0.5, 8);
    expect(regularizedBeta(0.3, 1, 1)).toBeCloseTo(0.3, 8);
    expect(regularizedBeta(0, 2, 3)).toBe(0);
    expect(regularizedBeta(1, 2, 3)).toBe(1);
  });

  it('valor p de una correlación (comparado con scipy.stats.pearsonr)', () => {
    expect(correlationPValue(0.529809, 6)).toBeCloseTo(0.2796, 3);
    expect(correlationPValue(0.5, 20)).toBeCloseTo(0.02477, 4);
    expect(correlationPValue(0, 30)).toBeCloseTo(1, 6);
    expect(correlationPValue(1, 30)).toBe(0);
  });
});

describe('mediana', () => {
  it('impar, par y vacía', () => {
    expect(median([3, 1, 100])).toBe(3);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBeNull();
  });
});

describe('Benjamini–Hochberg', () => {
  it('coincide con statsmodels multipletests(method="fdr_bh")', () => {
    const q = benjaminiHochberg([0.01, 0.04, 0.03, 0.005]);
    expect(q.map((x) => Number(x.toFixed(4)))).toEqual([0.02, 0.04, 0.04, 0.02]);
  });
  it('lista vacía y tope en 1', () => {
    expect(benjaminiHochberg([])).toEqual([]);
    expect(benjaminiHochberg([0.9, 0.95])).toEqual([0.95, 0.95]);
  });
});
