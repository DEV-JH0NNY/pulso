import { colorHex } from '../../domain/colors';
import { formatCompact } from '../../domain/format';
import { niceMax } from '../../domain/series';

export interface Bar {
  key: string;
  label: string;
  /** Etiqueta del eje X; vacía para omitirla. */
  axisLabel: string;
  value: number | null;
  /** Texto del valor ya formateado, para la tabla accesible. */
  valueText: string;
}

interface BarChartProps {
  bars: Bar[];
  color: string;
  title: string;
  /** Valor fijo para el tope del eje Y (por ejemplo 5 en escalas). */
  yMax?: number;
  goal?: number | null;
}

const W = 340;
const H = 190;
const LEFT = 34;
const RIGHT = 6;
const TOP = 10;
const BOTTOM = 24;

/** Gráfico de barras en SVG, con tabla oculta para lectores de pantalla. */
export function BarChart({ bars, color, title, yMax, goal }: BarChartProps) {
  const hex = colorHex(color);
  const dataMax = Math.max(0, ...bars.map((b) => b.value ?? 0), goal ?? 0);
  const top = yMax ?? niceMax(dataMax);
  const innerW = W - LEFT - RIGHT;
  const innerH = H - TOP - BOTTOM;
  const slot = innerW / Math.max(1, bars.length);
  const barW = Math.max(2, slot * 0.7);
  const y = (v: number) => TOP + innerH - (v / top) * innerH;
  const ticks = [0, top / 2, top];

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full text-slate-500 dark:text-slate-400"
        aria-hidden="true"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={LEFT}
              x2={W - RIGHT}
              y1={y(t)}
              y2={y(t)}
              className="stroke-slate-200 dark:stroke-slate-800"
            />
            <text x={LEFT - 4} y={y(t) + 3} fontSize="9" textAnchor="end" fill="currentColor">
              {formatCompact(t)}
            </text>
          </g>
        ))}
        {bars.map((b, i) => {
          const x = LEFT + i * slot + (slot - barW) / 2;
          const v = b.value ?? 0;
          const h = Math.max(0, y(0) - y(Math.min(v, top)));
          return (
            <g key={b.key}>
              {b.value !== null && (
                <rect
                  x={x}
                  y={y(0) - Math.max(h, v > 0 ? 1.5 : 0)}
                  width={barW}
                  height={Math.max(h, v > 0 ? 1.5 : 0)}
                  rx={Math.min(3, barW / 3)}
                  fill={hex}
                >
                  <title>
                    {b.label}: {b.valueText}
                  </title>
                </rect>
              )}
              {b.axisLabel && (
                <text
                  x={x + barW / 2}
                  y={H - 8}
                  fontSize="9"
                  textAnchor="middle"
                  fill="currentColor"
                >
                  {b.axisLabel}
                </text>
              )}
            </g>
          );
        })}
        {goal !== null && goal !== undefined && goal > 0 && goal <= top && (
          <g>
            <line
              x1={LEFT}
              x2={W - RIGHT}
              y1={y(goal)}
              y2={y(goal)}
              stroke="currentColor"
              strokeDasharray="4 3"
            />
            <text x={W - RIGHT} y={y(goal) - 3} fontSize="9" textAnchor="end" fill="currentColor">
              meta
            </text>
          </g>
        )}
      </svg>
      <figcaption className="sr-only">{title}</figcaption>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Periodo</th>
            <th scope="col">Valor</th>
          </tr>
        </thead>
        <tbody>
          {bars.map((b) => (
            <tr key={b.key}>
              <th scope="row">{b.label}</th>
              <td>{b.valueText}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
