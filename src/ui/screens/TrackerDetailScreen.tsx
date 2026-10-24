import { useMemo, useState } from 'react';
import { updateTracker } from '../../data/trackers';
import { isLimitGoal } from '../../domain/aggregate';
import { formatDayLabel, formatNumber } from '../../domain/format';
import { computeStreaks } from '../../domain/streaks';
import { weeklyStreak } from '../../domain/weekly';
import { draftFromTracker } from '../../domain/trackers';
import type { Entry } from '../../domain/types';
import { EntryEditDialog } from '../components/EntryEditDialog';
import { EntryRow } from '../components/EntryRow';
import { IconEdit } from '../components/icons';
import { Modal } from '../components/Modal';
import { TrackerForm } from '../components/TrackerForm';
import { useToast } from '../components/toastContext';
import { HeatmapChart } from '../components/HeatmapChart';
import { SampleTag } from '../components/SampleTag';
import { StatCard } from '../components/StatCard';
import { buttonSecondary, card, cardBase, muted, sectionTitle } from '../components/styles';
import { TrackerBadge } from '../components/TrackerBadge';
import { TrackerChart } from '../components/TrackerChart';
import { WeekdayChart } from '../components/WeekdayChart';
import { useTracker } from '../hooks/useData';
import { useToday } from '../hooks/useToday';
import { useTrackerTotals } from '../hooks/useTrackerTotals';
import { describeTracker } from '../trackerText';

const days = (n: number) => `${formatNumber(n)} ${n === 1 ? 'día' : 'días'}`;

export function TrackerDetailScreen({ id }: { id: string }) {
  const tracker = useTracker(id);
  const data = useTrackerTotals(id, tracker);
  const todayDate = useToday();
  const [editingTracker, setEditingTracker] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [showAll, setShowAll] = useState(false);
  const toast = useToast();
  const recent = useMemo(
    () =>
      data
        ? [...data.entries].sort(
            (a, b) => (b.date + b.time).localeCompare(a.date + a.time) || b.createdAt - a.createdAt,
          )
        : [],
    [data],
  );
  const streaks = useMemo(
    () => (tracker && data ? computeStreaks(tracker, data.totals, todayDate) : null),
    [tracker, data, todayDate],
  );

  if (tracker === null) return <p className={`${card} ${muted}`}>Este rastreador no existe.</p>;
  if (!tracker || !data || !streaks) return <p className={muted}>Cargando…</p>;

  const doneLabel =
    tracker.dailyGoal === null
      ? 'Días con registros'
      : isLimitGoal(tracker)
        ? 'Días dentro del límite'
        : 'Días con meta cumplida';

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <TrackerBadge tracker={tracker} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">
            {tracker.name}
            {tracker.isSample && <SampleTag />}
          </p>
          <p className={muted}>{describeTracker(tracker)}</p>
        </div>
        <button
          type="button"
          className={buttonSecondary}
          onClick={() => setEditingTracker(true)}
          aria-label={`Editar ${tracker.name}`}
        >
          <IconEdit className="h-4 w-4" /> Editar
        </button>
      </div>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Racha actual"
          value={days(streaks.current)}
          hint={streaks.current > 0 ? '🔥 ¡Sigue así!' : undefined}
        />
        <StatCard label="Mejor racha" value={days(streaks.longest)} />
        {tracker.weeklyTarget ? (
          <StatCard
            label={`Racha semanal (${tracker.weeklyTarget} días/semana)`}
            value={`${weeklyStreak(tracker, data.totals, todayDate)} sem.`}
          />
        ) : null}
        <StatCard label={doneLabel} value={days(streaks.doneDays)} />
        <StatCard label="Registros" value={formatNumber(data.entries.length)} />
      </dl>
      <p className={`${muted} mt-2`}>
        {tracker.dailyGoal !== null && isLimitGoal(tracker)
          ? 'Un día cuenta para la racha cuando registras y no pasas del límite (registra 0 los días sin consumo).'
          : tracker.dailyGoal !== null
            ? 'Un día cuenta para la racha cuando cumples la meta.'
            : tracker.type === 'boolean'
              ? 'Un día cuenta para la racha cuando respondes «Sí».'
              : 'Un día cuenta para la racha cuando tiene al menos un registro.'}
      </p>

      <h2 className={sectionTitle}>Gráfico</h2>
      <div className={card}>
        <TrackerChart tracker={tracker} totals={data.totals} todayDate={todayDate} />
      </div>

      <h2 className={sectionTitle}>Por día de la semana</h2>
      <div className={card}>
        <WeekdayChart tracker={tracker} totals={data.totals} />
      </div>

      <h2 className={sectionTitle}>Último año</h2>
      <div className={card}>
        <HeatmapChart tracker={tracker} totals={data.totals} todayDate={todayDate} />
      </div>

      <h2 className={sectionTitle}>Registros recientes</h2>
      {recent.length === 0 ? (
        <p className={`${card} ${muted}`}>Aún no hay registros de este rastreador.</p>
      ) : (
        <>
          <ul
            className={`${cardBase} divide-y divide-slate-100 overflow-hidden dark:divide-slate-800`}
          >
            {(showAll ? recent : recent.slice(0, 10)).map((e) => (
              <li key={e.id}>
                <p className="px-3 pt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {formatDayLabel(e.date, todayDate)}
                </p>
                <EntryRow entry={e} tracker={tracker} onEdit={() => setEditingEntry(e)} />
              </li>
            ))}
          </ul>
          {!showAll && recent.length > 10 && (
            <div className="mt-3 text-center">
              <button type="button" className={buttonSecondary} onClick={() => setShowAll(true)}>
                Ver los {formatNumber(recent.length)} registros
              </button>
            </div>
          )}
        </>
      )}

      <EntryEditDialog
        entry={editingEntry}
        tracker={tracker}
        onClose={() => setEditingEntry(null)}
      />

      <Modal
        open={editingTracker}
        title="Editar rastreador"
        onClose={() => setEditingTracker(false)}
      >
        {editingTracker && (
          <TrackerForm
            initial={draftFromTracker(tracker)}
            submitLabel="Guardar"
            onSubmit={async (draft) => {
              await updateTracker(tracker.id, draft);
              setEditingTracker(false);
              toast({ message: 'Cambios guardados' });
            }}
            onCancel={() => setEditingTracker(false)}
          />
        )}
      </Modal>
    </div>
  );
}
