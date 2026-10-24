import { colorHex } from '../../domain/colors';
import { formatCompact } from '../../domain/format';
import type { Tracker } from '../../domain/types';

const W = 160;
const H = 120;
const PAD = 22;

/** Diagrama de dispersión compacto: un punto por día en común. */
export function ScatterPlot({
  points,
  a,
  b,
}: {
  points: [number, number][];
  a: Tracker;
  b: Tracker;
}) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
  const sx = (v: number) => PAD + ((v - x0) / (x1 - x0 || 1)) * (W - PAD - 6);
  const sy = (v: number) => H - PAD - ((v - y0) / (y1 - y0 || 1)) * (H - PAD - 6);
  const hex = colorHex(b.color);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-40 shrink-0 text-slate-500 dark:text-slate-400"
      role="img"
      aria-label={`Diagrama de dispersión: ${a.name} en el eje horizontal y ${b.name} en el vertical, ${points.length} días`}
    >
      <line x1={PAD} y1={H - PAD} x2={W - 4} y2={H - PAD} stroke="currentColor" strokeWidth="0.5" />
      <line x1={PAD} y1={4} x2={PAD} y2={H - PAD} stroke="currentColor" strokeWidth="0.5" />
      {points.map(([x, y], i) => (
        <circle key={i} cx={sx(x)} cy={sy(y)} r={2.5} fill={hex} fillOpacity={0.6} />
      ))}
      <text x={PAD} y={H - 10} fontSize="8" fill="currentColor">
        {formatCompact(x0)}
      </text>
      <text x={W - 4} y={H - 10} fontSize="8" textAnchor="end" fill="currentColor">
        {formatCompact(x1)}
      </text>
      <text x={(W + PAD) / 2} y={H - 2} fontSize="8" textAnchor="middle" fill="currentColor">
        {a.icon} {a.name.slice(0, 14)}
      </text>
      <text x={PAD - 3} y={H - PAD} fontSize="8" textAnchor="end" fill="currentColor">
        {formatCompact(y0)}
      </text>
      <text x={PAD - 3} y={10} fontSize="8" textAnchor="end" fill="currentColor">
        {formatCompact(y1)}
      </text>
      <text
        x={8}
        y={(H - PAD) / 2}
        fontSize="8"
        textAnchor="middle"
        fill="currentColor"
        transform={`rotate(-90 8 ${(H - PAD) / 2})`}
      >
        {b.icon} {b.name.slice(0, 14)}
      </text>
    </svg>
  );
}
