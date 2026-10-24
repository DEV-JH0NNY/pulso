import { useMemo, useState } from 'react';
import { addEntry, deleteEntry } from '../../data/entries';
import { quickLog } from '../../data/quickLog';
import { dailyTotals, reachesGoal, summarizeDay } from '../../domain/aggregate';
import { addDays, startOfWeek, toTime } from '../../domain/dates';
import { formatDayLabel, formatLongDate, formatValue } from '../../domain/format';
import type { DaySummary } from '../../domain/aggregate';
import type { EntryDraft, Tracker } from '../../domain/types';
import { EntryForm } from '../components/EntryForm';
import { Modal } from '../components/Modal';
import { IconChevronLeft, IconChevronRight } from '../components/icons';
import { buttonPrimary, card, iconButton, muted } from '../components/styles';
import { useToast } from '../components/toastContext';
import { TrackerTile } from '../components/TrackerTile';
import { useActiveTrackers, useEntriesBetween } from '../hooks/useData';
import { weekProgress } from '../../domain/weekly';
import { useOnboardingDone } from '../hooks/useSample';
import { WelcomeCard } from '../components/WelcomeCard';
import { BackupReminder } from '../components/BackupReminder';
import { DailyReminder } from '../components/DailyReminder';
import { useToday } from '../hooks/useToday';
import { routeHref } from '../router';

export function TodayScreen() {
  const todayDate = useToday();
  // Días hacia atrás desde hoy (0 = hoy). Así la vista sigue a "hoy" al pasar la medianoche.
  const [offset, setOffset] = useState(0);
  const day = addDays(todayDate, -offset);
  const isToday = offset === 0;
  const trackers = useActiveTrackers();
  // Se carga la semana del día mostrado para calcular también las metas semanales.
  const entries = useEntriesBetween(startOfWeek(day), day);
  const [detailed, setDetailed] = useState<Tracker | null>(null);
  const [celebrating, setCelebrating] = useState<{ id: string; n: number } | null>(null);
  const toast = useToast();
  const onboardingDone = useOnboardingDone();

  const values = useMemo(() => {
    const map = new Map<string, number>();
    if (!trackers || !entries) return map;
    for (const t of trackers) {
      const v = dailyTotals(t, entries).get(day);
      if (v !== undefined) map.set(t.id, v);
    }
    return map;
  }, [trackers, entries, day]);

  const lastTimes = new Map<string, string>();
  for (const e of entries ?? []) {
    if (e.date !== day) continue;
    const prev = lastTimes.get(e.trackerId);
    if (!prev || e.time > prev) lastTimes.set(e.trackerId, e.time);
  }

  if (!trackers || !entries || onboardingDone === undefined)
    return <p className={muted}>Cargando…</p>;
  if (trackers.length === 0 && !onboardingDone) return <WelcomeCard />;

  const undoable = (message: string, entryId: string) =>
    toast({
      message,
      actionLabel: 'Deshacer',
      onAction: () => void deleteEntry(entryId),
    });

  const handleQuickLog = async (t: Tracker) => {
    const dayValues = (entries ?? [])
      .filter((e) => e.trackerId === t.id && e.date === day)
      .map((e) => e.value);
    const entry = await quickLog(t, values.get(t.id) ?? null, new Date(), day);
    if (!entry) {
      toast({ message: `«${t.name}» ya está marcado ${isToday ? 'hoy' : 'ese día'}` });
      return;
    }
    if (reachesGoal(t, dayValues, entry.value)) {
      setCelebrating((c) => ({ id: t.id, n: (c?.n ?? 0) + 1 }));
      navigator.vibrate?.([15, 60, 15]);
      undoable(`🎉 ¡Meta de «${t.name}» cumplida!`, entry.id);
      return;
    }
    navigator.vibrate?.(10);
    const amount =
      t.type === 'boolean' || t.type === 'scale'
        ? formatValue(t, entry.value)
        : `+${formatValue(t, entry.value)}`;
    const when = isToday ? '' : ` (${formatDayLabel(day, todayDate).toLowerCase()})`;
    undoable(`${t.icon} ${t.name}: ${amount}${when}`, entry.id);
  };

  const handleDetailed = async (draft: EntryDraft) => {
    if (!detailed) return;
    const entry = await addEntry(detailed.id, draft);
    undoable(
      `${detailed.icon} ${detailed.name}: ${formatValue(detailed, entry.value)} registrado`,
      entry.id,
    );
    setDetailed(null);
  };

  return (
    <div>
      <nav aria-label="Cambiar de día" className="-mt-2 mb-3 flex items-center justify-between">
        <button
          type="button"
          className={iconButton}
          aria-label="Día anterior"
          onClick={() => setOffset((o) => o + 1)}
        >
          <IconChevronLeft />
        </button>
        <div className="text-center" aria-live="polite">
          <p className="font-semibold">{formatDayLabel(day, todayDate)}</p>
          {offset <= 1 && <p className={muted}>{formatLongDate(day)}</p>}
          {!isToday && (
            <button
              type="button"
              className="text-sm font-semibold text-emerald-700 underline underline-offset-2 dark:text-emerald-400"
              onClick={() => setOffset(0)}
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
          onClick={() => setOffset((o) => Math.max(0, o - 1))}
        >
          <IconChevronRight />
        </button>
      </nav>
      {isToday && <DailyReminder loggedToday={values.size > 0} />}
      {isToday && <BackupReminder />}
      {trackers.length > 0 && (
        <DaySummaryCard
          summary={summarizeDay(trackers, values)}
          total={trackers.length}
          dayLabel={isToday ? 'hoy' : 'ese día'}
        />
      )}

      {trackers.length === 0 ? (
        <div className={`${card} text-center`}>
          <p className="mb-1 text-lg font-semibold">Empieza a medir tu vida</p>
          <p className={`${muted} mb-4`}>
            Crea un rastreador para lo que quieras registrar: estudio, sueño, café, gastos…
          </p>
          <a href={routeHref({ name: 'manage' })} className={buttonPrimary}>
            Crear rastreador
          </a>
        </div>
      ) : (
        <>
          <ul
            className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${isToday ? '' : 'rounded-2xl ring-2 ring-amber-400 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-950'}`}
            aria-label={isToday ? 'Rastreadores de hoy' : `Rastreadores del ${formatLongDate(day)}`}
          >
            {trackers.map((t) => (
              <li key={t.id}>
                <TrackerTile
                  tracker={t}
                  value={values.get(t.id) ?? null}
                  week={weekProgress(t, dailyTotals(t, entries), day)}
                  celebrate={celebrating?.id === t.id ? celebrating.n : 0}
                  lastTime={lastTimes.get(t.id) ?? null}
                  onQuickLog={() => void handleQuickLog(t)}
                  onDetailedLog={() => setDetailed(t)}
                />
              </li>
            ))}
          </ul>
          <p className={`${muted} mt-4 text-center`}>
            Toca para registrar el valor por defecto · mantén presionado o usa «+» para ajustar.
          </p>
        </>
      )}

      <Modal
        open={detailed !== null}
        title={detailed ? `${detailed.icon} ${detailed.name}` : ''}
        onClose={() => setDetailed(null)}
      >
        {detailed && (
          <EntryForm
            key={detailed.id}
            tracker={detailed}
            initial={{
              value: detailed.defaultValue,
              date: day,
              time: toTime(new Date()),
              note: '',
            }}
            maxDate={todayDate}
            submitLabel="Registrar"
            onSubmit={handleDetailed}
            onCancel={() => setDetailed(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function DaySummaryCard({
  summary,
  total,
  dayLabel,
}: {
  summary: DaySummary;
  total: number;
  dayLabel: string;
}) {
  const ratio = summary.withGoal > 0 ? summary.met / summary.withGoal : 0;
  const r = 26;
  const circumference = 2 * Math.PI * r;
  return (
    <section aria-label="Resumen del día" className={`${card} mb-4 flex items-center gap-4`}>
      {summary.withGoal > 0 && (
        <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0 -rotate-90" aria-hidden="true">
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            strokeWidth="8"
            className="stroke-slate-200 dark:stroke-slate-800"
          />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className="stroke-emerald-500 transition-[stroke-dashoffset] duration-500"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - ratio)}
          />
        </svg>
      )}
      <div>
        {summary.withGoal > 0 ? (
          <p className="text-lg font-semibold">
            {summary.met} de {summary.withGoal} metas cumplidas
          </p>
        ) : (
          <p className="text-lg font-semibold">Sin metas diarias</p>
        )}
        <p className={muted}>
          {summary.logged} de {total} rastreadores con registros {dayLabel}
          {summary.withGoal > 0 && summary.met === summary.withGoal ? ' · ¡Día completo! 🎉' : ''}
        </p>
      </div>
    </section>
  );
}
