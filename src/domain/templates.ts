import type { TrackerDraft } from './types';

/** Rastreadores comunes listos para crear con un toque. */
// prettier-ignore
export const TRACKER_TEMPLATES: readonly TrackerDraft[] = [
  { name: 'Sueño', icon: '💤', color: 'violet', type: 'quantity', unit: 'h', defaultValue: 7, dailyGoal: 7.5 },
  { name: 'Agua', icon: '💧', color: 'sky', type: 'counter', unit: 'vasos', defaultValue: 1, dailyGoal: 8 },
  { name: 'Café', icon: '☕', color: 'amber', type: 'counter', unit: 'tazas', defaultValue: 1, dailyGoal: 3, goalDirection: 'atMost' },
  { name: 'Estudio', icon: '📚', color: 'indigo', type: 'quantity', unit: 'h', defaultValue: 1, dailyGoal: 3 },
  { name: 'Ejercicio', icon: '🏃', color: 'emerald', type: 'boolean', unit: '', defaultValue: 1, dailyGoal: null, weeklyTarget: 3 },
  { name: 'Ánimo', icon: '😊', color: 'pink', type: 'scale', unit: '', defaultValue: 3, dailyGoal: null },
  { name: 'Gastos', icon: '💸', color: 'rose', type: 'quantity', unit: 'COP', defaultValue: 10000, dailyGoal: null },
  { name: 'Lectura', icon: '📖', color: 'teal', type: 'quantity', unit: 'páginas', defaultValue: 10, dailyGoal: 20 },
  { name: 'Meditación', icon: '🧘', color: 'lime', type: 'quantity', unit: 'min', defaultValue: 10, dailyGoal: 10 },
  { name: 'Pasos', icon: '🚶', color: 'orange', type: 'quantity', unit: 'pasos', defaultValue: 1000, dailyGoal: 8000 },
  { name: 'Pantalla', icon: '📱', color: 'slate', type: 'quantity', unit: 'h', defaultValue: 1, dailyGoal: 3, goalDirection: 'atMost' },
  { name: 'Energía', icon: '⚡', color: 'amber', type: 'scale', unit: '', defaultValue: 3, dailyGoal: null },
];
