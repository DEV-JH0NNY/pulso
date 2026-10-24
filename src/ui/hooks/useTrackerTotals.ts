import { useMemo } from 'react';
import { dailyTotals } from '../../domain/aggregate';
import type { Tracker } from '../../domain/types';
import { useEntriesForTracker } from './useData';

/**
 * Totales diarios de un rastreador (fecha → valor). `undefined` mientras carga.
 * Recibe el id por separado para que la consulta arranque sin esperar al rastreador.
 */
export function useTrackerTotals(id: string, tracker: Tracker | null | undefined) {
  const entries = useEntriesForTracker(id);
  return useMemo(
    () => (tracker && entries ? { entries, totals: dailyTotals(tracker, entries) } : undefined),
    [tracker, entries],
  );
}
