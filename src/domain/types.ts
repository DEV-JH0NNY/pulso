/** Tipos de rastreador soportados. */
export type TrackerType = 'counter' | 'quantity' | 'boolean' | 'scale';

export const TRACKER_TYPES: readonly TrackerType[] = ['counter', 'quantity', 'boolean', 'scale'];

export const TRACKER_TYPE_LABELS: Record<TrackerType, string> = {
  counter: 'Contador',
  quantity: 'Cantidad con unidad',
  boolean: 'Sí / No',
  scale: 'Escala 1–5',
};

export interface Tracker {
  id: string;
  name: string;
  /** Emoji que identifica al rastreador. */
  icon: string;
  /** Clave de la paleta (ver colors.ts). */
  color: string;
  type: TrackerType;
  /** Unidad de medida ("h", "COP", "tazas"…). Vacía si no aplica. */
  unit: string;
  /** Valor que se registra con un solo toque. */
  defaultValue: number;
  /** Meta diaria opcional. En sí/no es 1 (hacerlo); en escala, el promedio mínimo. */
  dailyGoal: number | null;
  archived: boolean;
  /** Posición en las listas (menor primero). */
  order: number;
  createdAt: number;
  /** Marca los datos de ejemplo para poder borrarlos todos. */
  isSample: boolean;
}

export interface Entry {
  id: string;
  trackerId: string;
  value: number;
  /** Fecha local en formato AAAA-MM-DD. */
  date: string;
  /** Hora local en formato HH:mm. */
  time: string;
  note: string;
  createdAt: number;
  isSample: boolean;
}

/** Datos editables de un rastreador (sin campos de sistema). */
export type TrackerDraft = Pick<
  Tracker,
  'name' | 'icon' | 'color' | 'type' | 'unit' | 'defaultValue' | 'dailyGoal'
>;

/** Datos editables de un registro. */
export type EntryDraft = Pick<Entry, 'value' | 'date' | 'time' | 'note'>;
