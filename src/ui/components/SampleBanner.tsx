import { useHasSampleData } from '../hooks/useSample';
import { ClearSampleButton } from './ClearSampleButton';

/** Aviso visible en todas las pantallas mientras haya datos de ejemplo. */
export function SampleBanner() {
  const hasSample = useHasSampleData();
  if (!hasSample) return null;
  return (
    <aside
      aria-label="Datos de ejemplo"
      className="flex items-center justify-between gap-2 border-b border-amber-300 bg-amber-50 px-4 py-1 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100"
    >
      <span>🧪 Estás viendo datos de ejemplo.</span>
      <ClearSampleButton
        label="Borrar"
        className="min-h-11 rounded-lg px-3 font-semibold underline underline-offset-2 hover:bg-amber-100 dark:hover:bg-amber-900/50"
      />
    </aside>
  );
}
