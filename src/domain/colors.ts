/** Paleta de colores para rastreadores. Tonos que funcionan en modo claro y oscuro. */
export interface TrackerColor {
  key: string;
  label: string;
  hex: string;
}

export const TRACKER_COLORS: readonly TrackerColor[] = [
  { key: 'emerald', label: 'Esmeralda', hex: '#10b981' },
  { key: 'sky', label: 'Cielo', hex: '#0ea5e9' },
  { key: 'indigo', label: 'Índigo', hex: '#6366f1' },
  { key: 'violet', label: 'Violeta', hex: '#8b5cf6' },
  { key: 'pink', label: 'Rosa', hex: '#ec4899' },
  { key: 'rose', label: 'Rojo', hex: '#f43f5e' },
  { key: 'orange', label: 'Naranja', hex: '#f97316' },
  { key: 'amber', label: 'Ámbar', hex: '#f59e0b' },
  { key: 'lime', label: 'Lima', hex: '#84cc16' },
  { key: 'teal', label: 'Verde azulado', hex: '#14b8a6' },
  { key: 'slate', label: 'Pizarra', hex: '#64748b' },
];

const DEFAULT_COLOR = TRACKER_COLORS[0] as TrackerColor;

export function colorHex(key: string): string {
  return (TRACKER_COLORS.find((c) => c.key === key) ?? DEFAULT_COLOR).hex;
}

export function isValidColor(key: string): boolean {
  return TRACKER_COLORS.some((c) => c.key === key);
}

/** Emojis sugeridos para el selector de íconos. */
// prettier-ignore
export const SUGGESTED_ICONS: readonly string[] = [
  '📚', '💤', '☕', '🏃', '💪', '🧘', '💧', '🍎', '💸', '💰',
  '😊', '🧠', '💻', '🎸', '🎨', '📖', '✍️', '🚶', '🚴', '🏊',
  '🍺', '🚭', '💊', '🦷', '🧹', '📞', '🎮', '📺', '🌱', '⚖️',
  '❤️', '🔥', '⭐', '🎯', '⏱️', '🛒', '🍽️', '🥗', '🌙', '☀️',
];
