import { formatDayLabel, formatLongDate } from '../../domain/format';
import { IconChevronLeft, IconChevronRight } from './icons';
import { iconButton, muted } from './styles';

interface DayNavProps {
  day: string;
  todayDate: string;
  /** Días hacia atrás desde hoy (0 = hoy). */
  offset: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

/** Flechas para moverse entre días en la pantalla principal. */
export function DayNav({ day, todayDate, offset, onPrev, onNext, onToday }: DayNavProps) {
  const isToday = offset === 0;
  return (
    <nav aria-label="Cambiar de día" className="-mt-2 mb-3 flex items-center justify-between">
      <button type="button" className={iconButton} aria-label="Día anterior" onClick={onPrev}>
        <IconChevronLeft />
      </button>
      <div className="text-center" aria-live="polite">
        <p className="font-semibold">{formatDayLabel(day, todayDate)}</p>
        {offset <= 1 && <p className={muted}>{formatLongDate(day)}</p>}
        {!isToday && (
          <button
            type="button"
            className="text-sm font-semibold text-emerald-700 underline underline-offset-2 dark:text-emerald-400"
            onClick={onToday}
          >
            Volver a hoy
          </button>
        )}
      </div>
      <button
        type="button"
        className={iconButton}
        aria-label="Día siguiente"
        disabled={isToday}
        onClick={onNext}
      >
        <IconChevronRight />
      </button>
    </nav>
  );
}
