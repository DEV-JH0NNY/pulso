import { useLiveQuery } from 'dexie-react-hooks';
import { useId, useMemo, useState, type FormEvent } from 'react';
import { db } from '../../data/db';
import { createDerived, deleteDerived } from '../../data/derived';
import { dailyTotals } from '../../domain/aggregate';
import {
  DERIVED_OPS,
  derivedTotals,
  describeFormula,
  validateDerivedDraft,
  type DerivedDraft,
  type DerivedMetric,
} from '../../domain/derived';
import { formatNumber, formatShortDate } from '../../domain/format';
import { buildSeries, summarizeSeries } from '../../domain/series';
import { median } from '../../domain/stats';
import type { Entry, Tracker } from '../../domain/types';
import { BarChart } from './BarChart';
import { ConfirmDialog } from './ConfirmDialog';
import { IconPlus, IconTrash } from './icons';
import { Modal } from './Modal';
import {
  buttonPrimary,
  buttonSecondary,
  card,
  fieldError,
  iconButton,
  input,
  label,
  muted,
} from './styles';

interface DerivedMetricsProps {
  trackers: Tracker[];
  entries: Entry[];
  todayDate: string;
}

const fmt = (m: DerivedMetric, v: number) => `${formatNumber(v, 2)}${m.unit ? ` ${m.unit}` : ''}`;

function MetricCard({
  metric,
  trackers,
  entries,
  todayDate,
  onDelete,
}: DerivedMetricsProps & { metric: DerivedMetric; onDelete: () => void }) {
  const a = trackers.find((t) => t.id === metric.aId);
  const b = trackers.find((t) => t.id === metric.bId);
  const points = useMemo(() => {
    if (!a || !b) return [];
    const totals = derivedTotals(metric.op, dailyTotals(a, entries), dailyTotals(b, entries));
    // Vista diaria de 30 días: cada punto es el valor del día (sin agregar).
    return buildSeries({ type: 'quantity', dailyGoal: null }, totals, todayDate, 'day');
  }, [a, b, metric.op, entries, todayDate]);
  const summary = summarizeSeries(points);
  const med = median(points.flatMap((p) => (p.value === null ? [] : [p.value])));

  return (
    <li className={card}>
      <div className="mb-2 flex items-start gap-2">
        <span className="text-2xl" aria-hidden="true">
          {metric.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{metric.name}</p>
          <p className={muted}>{describeFormula(metric, a, b)}, por día</p>
        </div>
        <button
          type="button"
          className={iconButton}
          aria-label={`Eliminar ${metric.name}`}
          onClick={onDelete}
        >
          <IconTrash />
        </button>
      </div>
      {summary.periodsWithData === 0 ? (
        <p className={muted}>Sin días con datos de ambos rastreadores en los últimos 30 días.</p>
      ) : (
        <>
          <BarChart
            bars={points.map((p, i) => ({
              key: p.start,
              label: formatShortDate(p.start),
              axisLabel: (points.length - 1 - i) % 7 === 0 ? String(Number(p.start.slice(8))) : '',
              value: p.value,
              valueText: p.value === null ? 'sin datos' : fmt(metric, p.value),
            }))}
            color={a?.color ?? 'slate'}
            title={`${metric.name}, últimos 30 días`}
          />
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            Promedio: <strong>{fmt(metric, summary.average ?? 0)}</strong> · mediana:{' '}
            <strong>{fmt(metric, med ?? 0)}</strong> ({summary.periodsWithData} días con datos de
            ambos).
          </p>
        </>
      )}
    </li>
  );
}

function DerivedForm({ trackers, onDone }: { trackers: Tracker[]; onDone: () => void }) {
  const id = useId();
  const [draft, setDraft] = useState<DerivedDraft>({
    name: '',
    icon: '🧮',
    op: 'ratio',
    aId: trackers[0]?.id ?? '',
    bId: trackers[1]?.id ?? '',
    unit: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof DerivedDraft>(k: K, v: DerivedDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validateDerivedDraft(draft, new Set(trackers.map((t) => t.id)));
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    await createDerived(draft);
    onDone();
  };

  const select = (field: 'aId' | 'bId', text: string) => (
    <div>
      <label htmlFor={`${id}-${field}`} className={label}>
        {text}
      </label>
      <select
        id={`${id}-${field}`}
        className={input}
        value={draft[field]}
        onChange={(e) => set(field, e.target.value)}
      >
        {trackers.map((t) => (
          <option key={t.id} value={t.id}>
            {t.icon} {t.name}
          </option>
        ))}
      </select>
      {errors[field] && <p className={fieldError}>{errors[field]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <label htmlFor={`${id}-name`} className={label}>
          Nombre
        </label>
        <input
          id={`${id}-name`}
          className={input}
          value={draft.name}
          placeholder="Ej.: Gasto por hora de estudio"
          onChange={(e) => set('name', e.target.value)}
          aria-invalid={errors.name ? true : undefined}
        />
        {errors.name && <p className={fieldError}>{errors.name}</p>}
      </div>
      {select('aId', 'Rastreador A')}
      <div>
        <label htmlFor={`${id}-op`} className={label}>
          Operación
        </label>
        <select
          id={`${id}-op`}
          className={input}
          value={draft.op}
          onChange={(e) => set('op', e.target.value as DerivedDraft['op'])}
        >
          {DERIVED_OPS.map((o) => (
            <option key={o.op} value={o.op}>
              {o.label} ({o.symbol})
            </option>
          ))}
        </select>
      </div>
      {select('bId', 'Rastreador B')}
      <div>
        <label htmlFor={`${id}-unit`} className={label}>
          Unidad del resultado <span className="font-normal">(opcional)</span>
        </label>
        <input
          id={`${id}-unit`}
          className={input}
          value={draft.unit}
          maxLength={12}
          placeholder="Ej.: COP/h"
          onChange={(e) => set('unit', e.target.value)}
        />
      </div>
      <p className={muted}>
        Se calcula con los totales diarios, solo en los días en que ambos tienen registros
        {draft.op === 'ratio' ? ' (los días con B = 0 se omiten)' : ''}.
      </p>
      <div className="flex justify-end gap-2">
        <button type="button" className={buttonSecondary} onClick={onDone}>
          Cancelar
        </button>
        <button type="submit" className={buttonPrimary}>
          Crear
        </button>
      </div>
    </form>
  );
}

/** Sección de métricas derivadas (fórmulas entre dos rastreadores). */
export function DerivedMetrics({ trackers, entries, todayDate }: DerivedMetricsProps) {
  const metrics = useLiveQuery(() => db.derived.orderBy('id').toArray(), []);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<DerivedMetric | null>(null);
  if (!metrics) return null;
  const sorted = [...metrics].sort((x, y) => x.createdAt - y.createdAt);

  return (
    <section aria-labelledby="derivadas" className="mt-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 id="derivadas" className="text-lg font-semibold">
          Métricas derivadas
        </h2>
        {trackers.length >= 2 && (
          <button type="button" className={buttonSecondary} onClick={() => setCreating(true)}>
            <IconPlus className="h-4 w-4" /> Nueva
          </button>
        )}
      </div>
      {sorted.length === 0 ? (
        <p className={`${card} ${muted}`}>
          Combina dos rastreadores con una fórmula diaria, por ejemplo «Gastos ÷ Estudio» para ver
          cuánto gastas por hora de estudio.
        </p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((m) => (
            <MetricCard
              key={m.id}
              metric={m}
              trackers={trackers}
              entries={entries}
              todayDate={todayDate}
              onDelete={() => setToDelete(m)}
            />
          ))}
        </ul>
      )}
      <Modal open={creating} title="Nueva métrica derivada" onClose={() => setCreating(false)}>
        {creating && <DerivedForm trackers={trackers} onDone={() => setCreating(false)} />}
      </Modal>
      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar métrica"
        message={`Se eliminará «${toDelete?.name ?? ''}». Los registros de los rastreadores no se tocan.`}
        confirmLabel="Eliminar"
        danger
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) void deleteDerived(toDelete.id);
          setToDelete(null);
        }}
      />
    </section>
  );
}
