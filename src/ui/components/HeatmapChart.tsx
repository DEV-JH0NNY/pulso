import { useEffect, useMemo, useRef } from 'react';
import { colorHex } from '../../domain/colors';
import { formatShortDate, formatShortMonth, formatValue } from '../../domain/format';
import { buildHeatmap, type HeatLevel } from '../../domain/heatmap';
import type { Tracker } from '../../domain/types';

const CELL = 12;
const GAP = 3;
const STEP = CELL + GAP;
const LEFT = 26;
const TOP = 16;
const ALPHA: Record<HeatLevel, string> = { 0: '', 1: '4d', 2: '80', 3: 'bf', 4: 'ff' };
const WEEKDAYS = ['lun', '', 'mié', '', 'vie', '', ''];

interface HeatmapChartProps {
  tracker: Tracker;
  totals: Map<string, number>;
  todayDate: string;
}

/** Calendario anual estilo contribuciones de GitHub. Se desplaza para mostrar lo más reciente. */
export function HeatmapChart({ tracker, totals, todayDate }: HeatmapChartProps) {
  const heatmap = useMemo(
    () => buildHeatmap(tracker, totals, todayDate),
    [tracker, totals, todayDate],
  );
  const scroller = useRef<HTMLDivElement>(null);
  const hex = colorHex(tracker.color);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const width = LEFT + heatmap.weeks.length * STEP;
  const height = TOP + 7 * STEP;
  const fill = (level: HeatLevel) => (level === 0 ? undefined : `${hex}${ALPHA[level]}`);

  return (
    <div>
      <div
        ref={scroller}
        className="overflow-x-auto pb-2"
        tabIndex={0}
        aria-label="Calendario del último año (desplazable)"
      >
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`Calendario de ${tracker.name} del último año`}
          className="text-slate-500 dark:text-slate-400"
        >
          {heatmap.months.map((m) => (
            <text key={m.date} x={LEFT + m.index * STEP} y={10} fontSize="10" fill="currentColor">
              {formatShortMonth(m.date)}
            </text>
          ))}
          {WEEKDAYS.map((d, i) =>
            d ? (
              <text key={d} x={0} y={TOP + i * STEP + CELL - 2} fontSize="10" fill="currentColor">
                {d}
              </text>
            ) : null,
          )}
          {heatmap.weeks.map((week, w) =>
            week.map((cell, d) =>
              cell.future ? null : (
                <rect
                  key={cell.date}
                  x={LEFT + w * STEP}
                  y={TOP + d * STEP}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  fill={fill(cell.level)}
                  className={cell.level === 0 ? 'fill-slate-200 dark:fill-slate-800' : undefined}
                >
                  <title>
                    {formatShortDate(cell.date)}:{' '}
                    {cell.value === null ? 'sin registros' : formatValue(tracker, cell.value)}
                  </title>
                </rect>
              ),
            ),
          )}
        </svg>
      </div>
      <div
        className="mt-1 flex items-center justify-end gap-1 text-xs text-slate-500 dark:text-slate-400"
        aria-hidden="true"
      >
        <span>Menos</span>
        {([0, 1, 2, 3, 4] as HeatLevel[]).map((l) => (
          <span
            key={l}
            className={`inline-block h-3 w-3 rounded-sm ${l === 0 ? 'bg-slate-200 dark:bg-slate-800' : ''}`}
            style={l === 0 ? undefined : { backgroundColor: fill(l) }}
          />
        ))}
        <span>Más</span>
      </div>
    </div>
  );
}
