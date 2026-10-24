import { addDays } from './dates';
import type { Entry, Tracker } from './types';

/** Generador pseudoaleatorio con semilla (mulberry32): los datos de ejemplo son reproducibles. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type SampleTracker = Omit<Tracker, 'order' | 'createdAt'>;

const SAMPLE_TRACKERS: SampleTracker[] = [
  {
    id: 'estudio',
    name: 'Estudio',
    icon: '📚',
    color: 'indigo',
    type: 'quantity',
    unit: 'h',
    defaultValue: 1,
    dailyGoal: 3,
  },
  {
    id: 'sueno',
    name: 'Sueño',
    icon: '💤',
    color: 'violet',
    type: 'quantity',
    unit: 'h',
    defaultValue: 7,
    dailyGoal: 7.5,
  },
  {
    id: 'cafe',
    name: 'Café',
    icon: '☕',
    color: 'amber',
    type: 'counter',
    unit: 'tazas',
    defaultValue: 1,
    dailyGoal: 3,
    goalDirection: 'atMost',
  },
  {
    id: 'ejercicio',
    name: 'Ejercicio',
    icon: '🏃',
    color: 'emerald',
    type: 'boolean',
    unit: '',
    defaultValue: 1,
    dailyGoal: null,
    weeklyTarget: 3,
  },
  {
    id: 'animo',
    name: 'Ánimo',
    icon: '😊',
    color: 'pink',
    type: 'scale',
    unit: '',
    defaultValue: 3,
    dailyGoal: 4,
  },
  {
    id: 'gastos',
    name: 'Gastos',
    icon: '💸',
    color: 'rose',
    type: 'quantity',
    unit: 'COP',
    defaultValue: 10000,
    dailyGoal: null,
  },
].map((t) => ({ ...t, archived: false, isSample: true }) as SampleTracker);

const round = (v: number, step: number) => Math.round(v / step) * step;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const pad = (n: number) => String(n).padStart(2, '0');

export interface SampleData {
  trackers: Tracker[];
  entries: Entry[];
}

/**
 * Genera `days` días de datos ficticios terminando en `todayDate`. Las
 * relaciones son intencionales para que la pantalla de hallazgos tenga algo
 * que mostrar: las semanas de "parciales" suben el estudio y el café y bajan
 * el sueño; dormir bien y hacer ejercicio suben el ánimo.
 */
export function generateSampleData(todayDate: string, days = 120, seed = 42): SampleData {
  const rand = seededRandom(seed);
  const noise = (scale: number) => (rand() + rand() + rand() - 1.5) * scale;
  const now = Date.now();
  const prefix = `ejemplo-${seed}`;
  const trackers: Tracker[] = SAMPLE_TRACKERS.map((t, i) => ({
    ...t,
    id: `${prefix}-${t.id}`,
    order: i,
    createdAt: now + i,
  }));
  const id = (key: string) => `${prefix}-${key}`;
  const entries: Entry[] = [];
  let n = 0;
  const push = (trackerKey: string, date: string, hour: number, value: number, note = '') => {
    const minute = Math.floor(rand() * 60);
    entries.push({
      id: `${prefix}-e${n++}`,
      trackerId: id(trackerKey),
      value,
      date,
      time: `${pad(clamp(Math.floor(hour), 0, 23))}:${pad(minute)}`,
      note,
      createdAt: now + n,
      isSample: true,
    });
  };

  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(todayDate, -i);
    const weekday = (new Date(`${date}T12:00:00`).getDay() + 6) % 7; // 0 = lunes
    const weekend = weekday >= 5;
    // Estrés: picos de parciales cada ~5 semanas más ruido diario.
    const cycle = Math.max(0, Math.sin(((days - i) / 35) * Math.PI * 2));
    const stress = clamp(cycle * 0.9 + noise(0.25), 0, 1);
    const skip = () => rand() < 0.08;

    const sleep = clamp(round(7.6 - 1.6 * stress + (weekend ? 0.7 : 0) + noise(0.8), 0.25), 4, 10);
    if (!skip()) push('sueno', date, 7, sleep);

    const coffee = Math.max(0, Math.round(1 + 2.2 * stress + noise(1)));
    if (!skip()) {
      for (let c = 0; c < coffee; c++)
        push(
          'cafe',
          date,
          7 + c * 3 + rand() * 2,
          1,
          c === 0 && coffee >= 4 ? 'Semana pesada' : '',
        );
    }

    const study = clamp(round((weekend ? 1 : 2.2) + 2.5 * stress + noise(1), 0.25), 0, 9);
    if (study > 0 && !skip()) push('estudio', date, 15 + rand() * 5, study);

    const exercised = rand() < (weekend ? 0.7 : 0.55) - 0.35 * stress ? 1 : 0;
    if (!skip())
      push(
        'ejercicio',
        date,
        18,
        exercised,
        exercised && rand() < 0.15 ? 'Trote en el parque' : '',
      );

    const mood = clamp(
      Math.round(3 + 0.6 * (sleep - 7) + 0.7 * exercised - 0.8 * stress + noise(1.2)),
      1,
      5,
    );
    if (!skip()) push('animo', date, 21, mood);

    const spend = round(
      Math.max(0, (weekend ? 45000 : 18000) + noise(weekend ? 30000 : 12000)),
      500,
    );
    if (spend > 0 && !skip())
      push('gastos', date, 13, spend, weekend && rand() < 0.2 ? 'Salida con amigos' : '');
  }
  return { trackers, entries };
}
