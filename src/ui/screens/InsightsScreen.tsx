import { useMemo } from 'react';
import { formatNumber } from '../../domain/format';
import {
  computeInsights,
  computeLaggedCorrelations,
  correlationsToCsv,
  describeConfidence,
  describeCorrelation,
  MIN_COMMON_DAYS,
  SIGNIFICANCE,
  type Correlation,
} from '../../domain/insights';
import { ScatterPlot } from '../components/ScatterPlot';
import { buttonSecondary, card, muted, sectionTitle } from '../components/styles';
import { downloadText } from '../download';
import { today } from '../../domain/dates';
import { TrackerBadge } from '../components/TrackerBadge';
import { useActiveTrackers, useEntriesBetween } from '../hooks/useData';

const STRENGTH_STYLE: Record<Correlation['strength'], string> = {
  fuerte: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200',
  moderada: 'bg-sky-100 text-sky-900 dark:bg-sky-900/50 dark:text-sky-200',
  débil: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  nula: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
};

function CorrelationCard({ c }: { c: Correlation }) {
  const direction = c.r > 0 ? 'positiva' : 'negativa';
  return (
    <li className={card}>
      <div className="mb-2 flex items-center gap-2">
        <TrackerBadge tracker={c.a} size="sm" />
        <span aria-hidden="true" className="text-slate-400">
          ↔
        </span>
        <TrackerBadge tracker={c.b} size="sm" />
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${STRENGTH_STYLE[c.strength]}`}
        >
          Relación {c.strength} {c.strength !== 'nula' ? direction : ''}
        </span>
      </div>
      <p className="font-medium">{describeCorrelation(c)}</p>
      <div className="mt-3 flex items-center gap-3">
        <ScatterPlot points={c.points} a={c.a} b={c.b} />
        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <p>
            Coeficiente de Pearson:{' '}
            <strong className="text-slate-900 dark:text-slate-100">
              r = {formatNumber(c.r, 2)}
            </strong>
          </p>
          <p>{describeConfidence(c)}</p>
        </div>
      </div>
    </li>
  );
}

export function InsightsScreen() {
  const trackers = useActiveTrackers();
  const entries = useEntriesBetween('0000-01-01', '9999-12-31');
  const insights = useMemo(
    () => (trackers && entries ? computeInsights(trackers, entries) : undefined),
    [trackers, entries],
  );
  const lagged = useMemo(
    () => (trackers && entries ? computeLaggedCorrelations(trackers, entries) : []),
    [trackers, entries],
  );

  const laggedRelevant = lagged.filter((c) => c.strength === 'moderada' || c.strength === 'fuerte');
  const exportCsv = () => {
    if (!insights) return;
    downloadText(
      `pulso-hallazgos-${today()}.csv`,
      correlationsToCsv([...insights.correlations, ...lagged]),
      'text/csv',
    );
  };

  if (!insights || !trackers) return <p className={muted}>Cargando…</p>;

  const relevant = insights.correlations.filter(
    (c) => c.strength === 'moderada' || c.strength === 'fuerte',
  );
  const weak = insights.correlations.filter((c) => c.strength === 'débil' || c.strength === 'nula');

  return (
    <div>
      <aside
        className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
        aria-label="Advertencia"
      >
        <p className="font-semibold">⚠️ Correlación no implica causalidad</p>
        <p className="mt-1 text-sm">
          Que dos cosas cambien juntas no significa que una cause la otra. Puede haber un tercer
          factor: por ejemplo, una semana de exámenes puede subir tu café y bajar tu sueño al mismo
          tiempo.
        </p>
      </aside>

      {trackers.length < 2 ? (
        <p className={`${card} ${muted}`}>
          Necesitas al menos dos rastreadores activos para buscar relaciones.
        </p>
      ) : insights.correlations.length === 0 ? (
        <div className={card}>
          <p className="font-semibold">Aún no hay suficientes datos</p>
          <p className={`${muted} mt-1`}>
            Para comparar dos rastreadores se necesitan al menos {MIN_COMMON_DAYS} días en los que
            ambos tengan registros. Sigue registrando y aquí aparecerán los hallazgos.
          </p>
        </div>
      ) : relevant.length === 0 ? (
        <p className={`${card} ${muted}`}>
          Con los datos actuales no aparecen relaciones moderadas ni fuertes entre tus rastreadores.
          ¡Eso también es un hallazgo!
        </p>
      ) : (
        <>
          <h2 className={sectionTitle}>Relaciones encontradas ({relevant.length})</h2>
          <ul className="space-y-3">
            {relevant.map((c) => (
              <CorrelationCard key={`${c.a.id}-${c.b.id}`} c={c} />
            ))}
          </ul>
        </>
      )}

      {laggedRelevant.length > 0 && (
        <>
          <h2 className={sectionTitle}>Al día siguiente ({laggedRelevant.length})</h2>
          <p className={`${muted} mb-2`}>
            Compara lo de un día con lo del día siguiente. Ojo: si dos cosas ya van juntas el mismo
            día y cambian poco de un día a otro, también aparecerán aquí sin que haya un efecto de
            un día al otro.
          </p>
          <ul className="space-y-3">
            {laggedRelevant.map((c) => (
              <CorrelationCard key={`lag-${c.a.id}-${c.b.id}`} c={c} />
            ))}
          </ul>
        </>
      )}

      {weak.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer py-2 font-medium">
            Relaciones débiles o nulas ({weak.length})
          </summary>
          <ul className="mt-2 space-y-3">
            {weak.map((c) => (
              <CorrelationCard key={`${c.a.id}-${c.b.id}`} c={c} />
            ))}
          </ul>
        </details>
      )}

      {insights.pending.length > 0 && trackers.length >= 2 && (
        <>
          <h2 className={sectionTitle}>Faltan datos</h2>
          <ul className={`${card} space-y-2`}>
            {insights.pending.slice(0, 6).map((p) => (
              <li key={`${p.a.id}-${p.b.id}`} className="text-sm">
                <div className="flex justify-between gap-2">
                  <span className="truncate">
                    {p.a.icon} {p.a.name} y {p.b.icon} {p.b.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-slate-600 dark:text-slate-400">
                    {p.n} de {MIN_COMMON_DAYS} días
                  </span>
                </div>
                <div
                  className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{ width: `${(p.n / MIN_COMMON_DAYS) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {insights.constant.length > 0 && (
        <p className={`${muted} mt-4`}>
          {insights.constant.length === 1
            ? 'Un par no se puede comparar'
            : `${insights.constant.length} pares no se pueden comparar`}{' '}
          porque uno de los rastreadores tiene siempre el mismo valor en los días en común (por
          ejemplo, siempre «Sí»).
        </p>
      )}

      {insights.correlations.length > 0 && (
        <div className="mt-6 text-center">
          <button type="button" className={buttonSecondary} onClick={exportCsv}>
            Exportar hallazgos (CSV)
          </button>
          <p className={`${muted} mt-1`}>
            Incluye todos los pares calculados, también los débiles y con desfase.
          </p>
        </div>
      )}

      <details className={`${card} mt-6`}>
        <summary className="cursor-pointer font-medium">¿Cómo se calculan los hallazgos?</summary>
        <div className={`${muted} mt-2 space-y-2`}>
          <p>
            Para cada par de rastreadores se toman los <strong>totales diarios</strong> (suma en
            contadores y cantidades, «Sí» = 1 y «No» = 0, promedio en escalas) de los días en que{' '}
            <strong>ambos</strong> tienen registros. Solo se calcula si hay al menos{' '}
            {MIN_COMMON_DAYS} días en común.
          </p>
          <p>
            El <strong>coeficiente de Pearson (r)</strong> va de −1 a 1: cerca de 1, suben juntos;
            cerca de −1, cuando uno sube el otro baja; cerca de 0, no hay relación lineal. Se
            considera débil por debajo de 0,3, moderada hasta 0,5 y fuerte desde 0,5.
          </p>
          <p>
            El <strong>valor p</strong> indica qué tan probable sería ver una relación así de fuerte
            por pura casualidad. Por debajo de {formatNumber(SIGNIFICANCE)} se dice que es poco
            probable que sea casualidad. Al comparar muchos pares, algunos parecen relacionados por
            azar; por eso también se muestra el <strong>valor p ajustado</strong> con el método de
            Benjamini–Hochberg, que controla la proporción de falsos positivos entre los hallazgos.
          </p>
          <p>Todo se calcula en tu dispositivo; tus datos no salen de él.</p>
        </div>
      </details>
    </div>
  );
}
