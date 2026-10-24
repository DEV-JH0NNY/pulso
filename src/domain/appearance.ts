import { normalizeForSearch } from './history';

/** Palabras clave (sin tildes) → ícono y color sugeridos para rastreadores importados. */
const KEYWORDS: { words: string[]; icon: string; color: string }[] = [
  { words: ['sueno', 'dormir', 'sleep'], icon: '💤', color: 'violet' },
  { words: ['cafe', 'coffee', 'tinto'], icon: '☕', color: 'amber' },
  { words: ['agua', 'water', 'vaso'], icon: '💧', color: 'sky' },
  { words: ['estudi', 'study', 'clase', 'tarea'], icon: '📚', color: 'indigo' },
  { words: ['lectura', 'leer', 'libro', 'pagina'], icon: '📖', color: 'teal' },
  {
    words: ['ejercicio', 'gym', 'gimnasio', 'correr', 'trote', 'deporte'],
    icon: '🏃',
    color: 'emerald',
  },
  { words: ['animo', 'humor', 'mood', 'felicidad'], icon: '😊', color: 'pink' },
  { words: ['energia'], icon: '⚡', color: 'amber' },
  { words: ['gasto', 'dinero', 'plata', 'cop', 'compra'], icon: '💸', color: 'rose' },
  { words: ['ahorro'], icon: '💰', color: 'lime' },
  { words: ['medita', 'mindful', 'respira'], icon: '🧘', color: 'lime' },
  { words: ['paso', 'caminar', 'step'], icon: '🚶', color: 'orange' },
  { words: ['pantalla', 'celular', 'redes', 'screen'], icon: '📱', color: 'slate' },
  { words: ['trabajo', 'work', 'codigo', 'programar'], icon: '💻', color: 'sky' },
  { words: ['cerveza', 'alcohol', 'trago'], icon: '🍺', color: 'orange' },
  { words: ['cigarr', 'fumar', 'tabaco'], icon: '🚭', color: 'slate' },
  { words: ['peso', 'kg'], icon: '⚖️', color: 'teal' },
  { words: ['medicina', 'pastilla', 'remedio'], icon: '💊', color: 'rose' },
];

/** Ícono y color para un rastreador según su nombre, o null si no se reconoce. */
export function suggestAppearance(name: string): { icon: string; color: string } | null {
  const n = normalizeForSearch(name);
  const hit = KEYWORDS.find((k) => k.words.some((w) => n.includes(w)));
  return hit ? { icon: hit.icon, color: hit.color } : null;
}
