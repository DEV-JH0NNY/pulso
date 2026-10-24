import { describe, expect, it } from 'vitest';
import type { Tracker } from '../domain/types';
import { describeTracker, progressText } from './trackerText';

const base: Tracker = {
  id: 't',
  name: 'X',
  icon: '⭐',
  color: 'emerald',
  type: 'quantity',
  unit: 'h',
  defaultValue: 1,
  dailyGoal: 8,
  archived: false,
  order: 0,
  createdAt: 0,
  isSample: false,
};
const norm = (s: string) => s.replace(/\s/g, ' ');

describe('textos de rastreador', () => {
  it('describe tipo y meta', () => {
    expect(describeTracker(base)).toBe('Cantidad con unidad · meta 8 h');
    expect(describeTracker({ ...base, type: 'boolean', dailyGoal: 1 })).toBe(
      'Sí / No · meta diaria',
    );
    expect(describeTracker({ ...base, dailyGoal: null })).toBe('Cantidad con unidad');
  });

  it('muestra el progreso según el tipo', () => {
    expect(progressText(base, 3)).toBe('3 / 8 h');
    expect(progressText(base, null)).toBe('0 / 8 h');
    expect(progressText({ ...base, dailyGoal: null }, null)).toBe('Sin registros');
    expect(progressText({ ...base, type: 'boolean', dailyGoal: 1 }, null)).toBe('Pendiente');
    expect(progressText({ ...base, type: 'boolean', dailyGoal: 1 }, 1)).toBe('Hecho');
    expect(progressText({ ...base, type: 'scale', dailyGoal: 4 }, 3.5)).toBe('3,5/5 (meta 4/5)');
    expect(norm(progressText({ ...base, unit: 'COP', dailyGoal: 20000 }, 5000))).toBe(
      '$ 5.000 / $ 20.000',
    );
  });
});

describe('textos de límites', () => {
  it('muestra el límite', () => {
    const cafe = {
      ...base,
      type: 'counter' as const,
      unit: 'tazas',
      dailyGoal: 2,
      goalDirection: 'atMost' as const,
    };
    expect(describeTracker(cafe)).toBe('Contador · límite 2 tazas');
    expect(progressText(cafe, 1)).toBe('1 / máx. 2 tazas');
  });
});
