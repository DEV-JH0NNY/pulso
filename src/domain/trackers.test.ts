import { describe, expect, it } from 'vitest';
import {
  emptyDraft,
  moveId,
  normalizeDraft,
  sortTrackers,
  validateEntryValue,
  validateTrackerDraft,
} from './trackers';
import type { TrackerDraft } from './types';

const draft = (over: Partial<TrackerDraft>): TrackerDraft => ({
  ...emptyDraft(),
  name: 'Café',
  ...over,
});

describe('validación de rastreadores', () => {
  it('acepta un contador válido', () => {
    expect(validateTrackerDraft(draft({}))).toEqual({});
  });

  it('exige nombre', () => {
    expect(validateTrackerDraft(draft({ name: '   ' })).name).toBeDefined();
    expect(validateTrackerDraft(draft({ name: 'x'.repeat(41) })).name).toBeDefined();
  });

  it('exige color de la paleta', () => {
    expect(validateTrackerDraft(draft({ color: 'fucsia' })).color).toBeDefined();
  });

  it('contador: valor por defecto entero ≥ 1', () => {
    expect(validateTrackerDraft(draft({ defaultValue: 0 })).defaultValue).toBeDefined();
    expect(validateTrackerDraft(draft({ defaultValue: 1.5 })).defaultValue).toBeDefined();
    expect(validateTrackerDraft(draft({ dailyGoal: 0 })).dailyGoal).toBeDefined();
  });

  it('cantidad: exige unidad', () => {
    const e = validateTrackerDraft(draft({ type: 'quantity', unit: '', defaultValue: 0.5 }));
    expect(e.unit).toBeDefined();
    expect(e.defaultValue).toBeUndefined();
  });

  it('sí/no: la meta solo puede ser 1', () => {
    expect(validateTrackerDraft(draft({ type: 'boolean', dailyGoal: 1 }))).toEqual({});
    expect(validateTrackerDraft(draft({ type: 'boolean', dailyGoal: 2 })).dailyGoal).toBeDefined();
  });

  it('escala: valores entre 1 y 5', () => {
    expect(validateTrackerDraft(draft({ type: 'scale', defaultValue: 3, dailyGoal: 4 }))).toEqual(
      {},
    );
    expect(
      validateTrackerDraft(draft({ type: 'scale', defaultValue: 6 })).defaultValue,
    ).toBeDefined();
    expect(validateTrackerDraft(draft({ type: 'scale', dailyGoal: 0.5 })).dailyGoal).toBeDefined();
  });

  it('normaliza espacios y descarta la unidad donde no aplica', () => {
    const n = normalizeDraft(draft({ name: '  Ánimo ', type: 'scale', unit: 'h' }));
    expect(n.name).toBe('Ánimo');
    expect(n.unit).toBe('');
  });
});

describe('valores de registro', () => {
  it('valida según el tipo', () => {
    expect(validateEntryValue('counter', 2)).toBeNull();
    expect(validateEntryValue('counter', -1)).not.toBeNull();
    expect(validateEntryValue('boolean', 0)).toBeNull();
    expect(validateEntryValue('boolean', 2)).not.toBeNull();
    expect(validateEntryValue('scale', 5)).toBeNull();
    expect(validateEntryValue('scale', 2.5)).not.toBeNull();
    expect(validateEntryValue('quantity', Number.NaN)).not.toBeNull();
  });
});

describe('orden', () => {
  it('ordena por posición y luego por creación', () => {
    const list = [
      { id: 'b', order: 1, createdAt: 1 },
      { id: 'a', order: 0, createdAt: 5 },
      { id: 'c', order: 1, createdAt: 0 },
    ];
    expect(sortTrackers(list).map((t) => t.id)).toEqual(['a', 'c', 'b']);
  });

  it('mueve un id hacia arriba o abajo sin salirse', () => {
    expect(moveId(['a', 'b', 'c'], 'b', -1)).toEqual(['b', 'a', 'c']);
    expect(moveId(['a', 'b', 'c'], 'b', 1)).toEqual(['a', 'c', 'b']);
    expect(moveId(['a', 'b', 'c'], 'a', -1)).toEqual(['a', 'b', 'c']);
    expect(moveId(['a', 'b', 'c'], 'z', 1)).toEqual(['a', 'b', 'c']);
  });
});

describe('normalización del sentido de la meta', () => {
  it('solo guarda atMost en contador/cantidad con meta', () => {
    expect(normalizeDraft(draft({ dailyGoal: 2, goalDirection: 'atMost' })).goalDirection).toBe(
      'atMost',
    );
    expect(
      'goalDirection' in normalizeDraft(draft({ dailyGoal: null, goalDirection: 'atMost' })),
    ).toBe(false);
    expect(
      'goalDirection' in
        normalizeDraft(draft({ type: 'scale', dailyGoal: 4, goalDirection: 'atMost' })),
    ).toBe(false);
    expect(
      'goalDirection' in normalizeDraft(draft({ dailyGoal: 2, goalDirection: 'atLeast' })),
    ).toBe(false);
  });
});
