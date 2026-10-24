import { useMemo } from 'react';
import { isLimitGoal } from '../../domain/aggregate';
import { formatNumber } from '../../domain/format';
import { computeStreaks } from '../../domain/streaks';
import { HeatmapChart } from '../components/HeatmapChart';
import { SampleTag } from '../components/SampleTag';
import { StatCard } from '../components/StatCard';
import { card, muted, sectionTitle } from '../components/styles';
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
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">
            {tracker.name}
            {tracker.isSample && <SampleTag />}
          </p>
          <p className={muted}>{describeTracker(tracker)}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <StatCard
          label="Racha actual"
          value={days(streaks.current)}
          hint={streaks.current > 0 ? '🔥 ¡Sigue así!' : undefined}
        />
        <StatCard label="Mejor racha" value={days(streaks.longest)} />
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
    </div>
  );
}
