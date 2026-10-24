import { describe, expect, it } from 'vitest';
import { parseCsv } from './csv';
import { csvUnit, entriesToCsv, entriesToWideCsv, planImport } from './csvData';
import type { Entry, Tracker } from './types';

const tracker = (over: Partial<Tracker>): Tracker => ({
  id: 'x',
  name: 'X',
  icon: '⭐',
  color: 'emerald',
  type: 'counter',
  unit: '',
  defaultValue: 1,
  dailyGoal: null,
  archived: false,
  order: 0,
  createdAt: 0,
  isSample: false,
  ...over,
});
const entry = (over: Partial<Entry>): Entry => ({
  id: Math.random().toString(),
  trackerId: 'x',
  value: 1,
  date: '2026-01-01',
  time: '08:00',
  note: '',
  createdAt: 0,
  isSample: false,
  ...over,
});

const sleep = tracker({ id: 's', name: 'Sueño', type: 'quantity', unit: 'h' });
const gym = tracker({ id: 'g', name: 'Ejercicio', type: 'boolean' });
const mood = tracker({ id: 'm', name: 'Ánimo', type: 'scale', defaultValue: 3 });

describe('exportar CSV', () => {
  it('genera formato largo ordenado con unidades que conservan el tipo', () => {
    const csv = entriesToCsv(
      [sleep, gym, mood],
      [
        entry({
          trackerId: 's',
          value: 7.5,
          date: '2026-01-02',
          time: '07:00',
          note: 'bien, "rico"',
        }),
        entry({ trackerId: 'g', value: 1, date: '2026-01-01', time: '18:30' }),
        entry({ trackerId: 'm', value: 4, date: '2026-01-01', time: '21:00' }),
        entry({ trackerId: 'borrado', value: 9 }),
      ],
    );
    expect(csv).toBe(
      'fecha,hora,rastreador,valor,unidad,nota\r\n' +
        '2026-01-01,18:30,Ejercicio,1,sí/no,\r\n' +
        '2026-01-01,21:00,Ánimo,4,1-5,\r\n' +
        '2026-01-02,07:00,Sueño,7.5,h,"bien, ""rico"""\r\n',
    );
    expect(csvUnit(sleep)).toBe('h');
  });
});

describe('importar CSV', () => {
  it('ida y vuelta conserva tipos y valores', () => {
    const entries = [
      entry({ trackerId: 's', value: 7.5, note: 'nota, con coma' }),
      entry({ trackerId: 'g', value: 0 }),
      entry({ trackerId: 'm', value: 5 }),
    ];
    const csv = entriesToCsv([sleep, gym, mood], entries);
    const plan = planImport(csv, [], []);
    expect(plan.errors).toEqual([]);
    expect(plan.newTrackers).toEqual([
      { name: 'Sueño', type: 'quantity', unit: 'h' },
      { name: 'Ejercicio', type: 'boolean', unit: '' },
      { name: 'Ánimo', type: 'scale', unit: '' },
    ]);
    expect(plan.rows.map((r) => [r.trackerName, r.value, r.note])).toEqual([
      ['Sueño', 7.5, 'nota, con coma'],
      ['Ejercicio', 0, ''],
      ['Ánimo', 5, ''],
    ]);
  });

  it('asocia con rastreadores existentes sin distinguir mayúsculas', () => {
    const plan = planImport('fecha,hora,rastreador,valor\n2026-01-01,07:00,sueño,8\n', [sleep], []);
    expect(plan.newTrackers).toEqual([]);
    expect(plan.rows[0]?.trackerName).toBe('Sueño');
  });

  it('acepta punto y coma, coma decimal, columnas en otro orden y horas sin cero', () => {
    const plan = planImport(
      'rastreador;valor;fecha;hora;nota\nSueño;7,5;2026-01-01;7:05;ok\n',
      [sleep],
      [],
    );
    expect(plan.errors).toEqual([]);
    expect(plan.rows[0]).toMatchObject({ value: 7.5, time: '07:05', note: 'ok' });
  });

  it('infiere contador con enteros y cantidad con decimales', () => {
    const plan = planImport(
      'fecha,hora,rastreador,valor,unidad\n2026-01-01,08:00,Café,2,tazas\n2026-01-01,09:00,Km,3.2,km\n',
      [],
      [],
    );
    expect(plan.newTrackers).toEqual([
      { name: 'Café', type: 'counter', unit: 'tazas' },
      { name: 'Km', type: 'quantity', unit: 'km' },
    ]);
  });

  it('reporta errores claros por línea', () => {
    const plan = planImport(
      [
        'fecha,hora,rastreador,valor,unidad,nota',
        '2026-02-30,08:00,Sueño,7,h,',
        '2026-01-01,25:00,Sueño,7,h,',
        '2026-01-01,08:00,,7,h,',
        '2026-01-01,08:00,Sueño,siete,h,',
        '2026-01-01,08:00,Sueño,7,min,',
        '2026-01-01,08:00,Ánimo,9,1-5,',
        '2026-01-01,08:00,Sueño,7,h,válida',
      ].join('\n'),
      [sleep, mood],
      [],
    );
    expect(plan.errors.map((e) => e.line)).toEqual([2, 3, 4, 5, 6, 7]);
    expect(plan.errors[0]?.message).toMatch(/fecha «2026-02-30» no es válida/i);
    expect(plan.errors[1]?.message).toMatch(/hora «25:00»/i);
    expect(plan.errors[2]?.message).toMatch(/falta el nombre/i);
    expect(plan.errors[3]?.message).toMatch(/valor «siete» no es un número/i);
    expect(plan.errors[4]?.message).toMatch(/unidad «min» no coincide/i);
    expect(plan.errors[5]?.message).toMatch(/entre 1 y 5/);
    expect(plan.rows).toHaveLength(1);
  });

  it('omite duplicados de registros existentes', () => {
    const existing = [entry({ trackerId: 's', value: 7, date: '2026-01-01', time: '08:00' })];
    const plan = planImport(
      'fecha,hora,rastreador,valor\n2026-01-01,08:00,Sueño,7\n2026-01-02,08:00,Sueño,7\n',
      [sleep],
      existing,
    );
    expect(plan.duplicates).toBe(1);
    expect(plan.rows).toHaveLength(1);
  });

  it('errores fatales: vacío, sin columnas, solo encabezado, comillas', () => {
    expect(planImport('', [], []).fatal).toMatch(/vacío/);
    expect(planImport('a,b\n1,2', [], []).fatal).toMatch(/Faltan columnas: fecha, hora/);
    expect(planImport('fecha,hora,rastreador,valor\n', [], []).fatal).toMatch(/solo el encabezado/);
    expect(planImport('fecha,hora,rastreador,valor\n"x', [], []).fatal).toMatch(/Comillas/);
  });

  it('el CSV exportado es legible por un parser estándar', () => {
    const csv = entriesToCsv([sleep], [entry({ trackerId: 's', value: 1234.5 })]);
    expect(parseCsv(csv).rows[1]?.fields).toEqual([
      '2026-01-01',
      '08:00',
      'Sueño',
      '1234.5',
      'h',
      '',
    ]);
  });
});

describe('exportar CSV ancho', () => {
  it('una fila por día con huecos vacíos y valores diarios agregados', () => {
    const csv = entriesToWideCsv(
      [sleep, mood],
      [
        entry({ trackerId: 's', value: 7, date: '2026-01-01' }),
        entry({ trackerId: 'm', value: 2, date: '2026-01-01' }),
        entry({ trackerId: 'm', value: 3, date: '2026-01-01' }),
        entry({ trackerId: 's', value: 8.5, date: '2026-01-03' }),
      ],
    );
    expect(csv).toBe(
      'fecha,Sueño (h),Ánimo (1-5)\r\n2026-01-01,7,2.5\r\n2026-01-02,,\r\n2026-01-03,8.5,\r\n',
    );
  });

  it('sin registros solo trae el encabezado', () => {
    expect(entriesToWideCsv([sleep], [])).toBe('fecha,Sueño (h)\r\n');
  });
});
