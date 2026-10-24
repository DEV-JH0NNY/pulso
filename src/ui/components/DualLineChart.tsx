import { colorHex } from '../../domain/colors';
import { formatShortDate } from '../../domain/format';
import { zScores } from '../../domain/stats';
import type { Tracker } from '../../domain/types';

const W = 340;
const H = 140;
const PAD = 8;
const MAX_POINTS = 60;

interface DualLineChartProps {
  a: Tracker;
  b: Tracker;
  dates: string[];
  points: [number, number][];
  lag: 0 | 1;
}

/**
 * Dos series normalizadas (puntaje z) en el tiempo, para ver si suben y bajan
 * juntas. Muestra los últimos 60 días en común.
 */
export function DualLineChart({ a, b, dates, points, lag }: DualLineChartProps) {
  const start = Math.max(0, points.length - MAX_POINTS);
  const shown = points.slice(start);
  const shownDates = dates.slice(start);
  const za = zScores(shown.map((p) => p[0]));
  const zb = zScores(shown.map((p) => p[1]));
  const limit = Math.max(2, ...za.map(Math.abs), ...zb.map(Math.abs));
  const x = (i: number) => PAD + (i / Math.max(1, shown.length - 1)) * (W - 2 * PAD);
  const y = (z: number) => H / 2 - (z / limit) * (H / 2 - PAD);
  const path = (zs: number[]) =>
    zs.map((z, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(z).toFixed(1)}`).join(' ');
  const hexA = colorHex(a.color);
  // La segunda serie va siempre punteada: hay colores de la paleta parecidos entre sí.
  const hexB = a.color === b.color ? '#64748b' : colorHex(b.color);

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${a.name} y ${b.name}${lag === 1 ? ' del día siguiente' : ''} normalizados en el tiempo`}
      >
        <line
          x1={PAD}
          x2={W - PAD}
          y1={H / 2}
          y2={H / 2}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeDasharray="3 3"
        />
        <path d={path(za)} fill="none" stroke={hexA} strokeWidth={2} strokeLinejoin="round" />
        <path
          d={path(zb)}
          fill="none"
          stroke={hexB}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeDasharray="5 3"
        />
      </svg>
      <figcaption className="mt-1 flex flex-wrap justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
        <span>
          <span style={{ color: hexA }}>━</span> {a.name} · <span style={{ color: hexB }}>╍</span>{' '}
          {b.name}
          {lag === 1 ? ' (día siguiente)' : ''}
        </span>
        {shownDates[0] && (
          <span>
            {formatShortDate(shownDates[0])} –{' '}
            {formatShortDate(shownDates[shownDates.length - 1] ?? shownDates[0])}
          </span>
        )}
      </figcaption>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Cada línea se escala a su propio promedio y variación (puntaje z) para poder compararlas
        aunque tengan unidades distintas. La línea punteada es el promedio.
      </p>
    </figure>
  );
}
