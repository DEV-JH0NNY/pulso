import { describe, expect, it } from 'vitest';
import { createBackup, parseBackup } from './backup';
import { generateSampleData } from './sampleData';

const sample = generateSampleData('2026-10-24', 10);

describe('respaldo JSON', () => {
  it('ida y vuelta sin pérdidas', () => {
    const backup = createBackup(sample.trackers, sample.entries, new Date('2026-10-24T12:00:00Z'));
    const res = parseBackup(JSON.stringify(backup));
    expect(res).toEqual({ ok: true, backup });
  });

  it('rechaza archivos que no son respaldos', () => {
    expect(parseBackup('no json')).toEqual({
      ok: false,
      error: 'El archivo no es un JSON válido.',
    });
    expect(parseBackup('{"app":"otra"}')).toMatchObject({ ok: false, error: /no es un respaldo/ });
    expect(parseBackup('{"app":"pulso","format":99}')).toMatchObject({
      ok: false,
      error: /no soportada/,
    });
    expect(parseBackup('{"app":"pulso","format":1}')).toMatchObject({ ok: false, error: /faltan/ });
  });

  it('valida rastreadores y registros', () => {
    const base = createBackup(sample.trackers, sample.entries);
    const badTracker = { ...base, trackers: [{ ...base.trackers[0], type: 'raro' }] };
    expect(parseBackup(JSON.stringify(badTracker))).toMatchObject({
      ok: false,
      error: /tipo «raro»/,
    });

    const orphan = { ...base, entries: [{ ...base.entries[0], trackerId: 'nada' }] };
    expect(parseBackup(JSON.stringify(orphan))).toMatchObject({
      ok: false,
      error: /no está en el respaldo/,
    });

    const scale = base.trackers.find((t) => t.type === 'scale');
    const badValue = {
      ...base,
      entries: [{ ...base.entries[0], trackerId: scale?.id, value: 9 }],
    };
    expect(parseBackup(JSON.stringify(badValue))).toMatchObject({
      ok: false,
      error: /entre 1 y 5/,
    });

    const dup = { ...base, trackers: [base.trackers[0], base.trackers[0]], entries: [] };
    expect(parseBackup(JSON.stringify(dup))).toMatchObject({ ok: false, error: /repetido/ });
  });
});

describe('respaldo con métricas derivadas', () => {
  it('las conserva y valida sus rastreadores', () => {
    const [a, b] = sample.trackers;
    const metric = {
      id: 'm1',
      name: 'Prueba',
      icon: '🧮',
      op: 'ratio' as const,
      aId: a?.id ?? '',
      bId: b?.id ?? '',
      unit: '',
      createdAt: 1,
    };
    const backup = createBackup(sample.trackers, [], new Date(0), [metric]);
    expect(parseBackup(JSON.stringify(backup))).toEqual({ ok: true, backup });
    const broken = { ...backup, derived: [{ ...metric, bId: 'nada' }] };
    expect(parseBackup(JSON.stringify(broken))).toMatchObject({
      ok: false,
      error: /Métrica derivada #1/,
    });
  });
});
