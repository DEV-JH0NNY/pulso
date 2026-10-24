import { useMemo, useState } from 'react';
import { addEntry, deleteEntry } from '../../data/entries';
import { quickLog } from '../../data/quickLog';
import { dailyTotals, summarizeDay } from '../../domain/aggregate';
import { toTime } from '../../domain/dates';
import { formatLongDate, formatValue } from '../../domain/format';
import type { DaySummary } from '../../domain/aggregate';
import type { EntryDraft, Tracker } from '../../domain/types';
import { EntryForm } from '../components/EntryForm';
import { Modal } from '../components/Modal';
import { buttonPrimary, card, muted } from '../components/styles';
import { useToast } from '../components/toastContext';
import { TrackerTile } from '../components/TrackerTile';
import { useActiveTrackers, useEntriesForDate } from '../hooks/useData';
import { useOnboardingDone } from '../hooks/useSample';
import { WelcomeCard } from '../components/WelcomeCard';
import { BackupReminder } from '../components/BackupReminder';
import { useToday } from '../hooks/useToday';
import { routeHref } from '../router';

export function TodayScreen() {
  const todayDate = useToday();
  const trackers = useActiveTrackers();
  const entries = useEntriesForDate(todayDate);
  const [detailed, setDetailed] = useState<Tracker | null>(null);
  const toast = useToast();
  const onboardingDone = useOnboardingDone();

  const values = useMemo(() => {
    const map = new Map<string, number>();
    if (!trackers || !entries) return map;
    for (const t of trackers) {
      const v = dailyTotals(t, entries).get(todayDate);
      if (v !== undefined) map.set(t.id, v);
    }
    return map;
  }, [trackers, entries, todayDate]);

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
    const entry = await quickLog(t, values.get(t.id) ?? null);
    if (!entry) {
      toast({ message: `«${t.name}» ya está marcado hoy` });
      return;
    }
    navigator.vibrate?.(10);
    const amount =
      t.type === 'boolean' || t.type === 'scale'
        ? formatValue(t, entry.value)
        : `+${formatValue(t, entry.value)}`;
    undoable(`${t.icon} ${t.name}: ${amount}`, entry.id);
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
      <p className={`${muted} mb-4`}>{formatLongDate(todayDate)}</p>
      <BackupReminder />
      {trackers.length > 0 && (
        <DaySummaryCard summary={summarizeDay(trackers, values)} total={trackers.length} />
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
          <ul className="grid grid-cols-2 gap-3" aria-label="Rastreadores de hoy">
            {trackers.map((t) => (
              <li key={t.id}>
                <TrackerTile
                  tracker={t}
                  value={values.get(t.id) ?? null}
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
              date: todayDate,
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

function DaySummaryCard({ summary, total }: { summary: DaySummary; total: number }) {
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
          {summary.logged} de {total} rastreadores con registros hoy
          {summary.withGoal > 0 && summary.met === summary.withGoal ? ' · ¡Día completo! 🎉' : ''}
        </p>
      </div>
    </section>
  );
}
