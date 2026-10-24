import type { Tracker } from './types';

export type DerivedOp = 'ratio' | 'sum' | 'difference' | 'product';

export const DERIVED_OPS: { op: DerivedOp; label: string; symbol: string }[] = [
  { op: 'ratio', label: 'A dividido entre B', symbol: '÷' },
  { op: 'difference', label: 'A menos B', symbol: '−' },
  { op: 'sum', label: 'A más B', symbol: '+' },
  { op: 'product', label: 'A por B', symbol: '×' },
];

/** Métrica calculada a partir de los totales diarios de dos rastreadores. */
export interface DerivedMetric {
  id: string;
  name: string;
  icon: string;
  op: DerivedOp;
  aId: string;
  bId: string;
  /** Unidad del resultado (texto libre, por ejemplo "COP/h"). */
  unit: string;
  createdAt: number;
}

export type DerivedDraft = Pick<DerivedMetric, 'name' | 'icon' | 'op' | 'aId' | 'bId' | 'unit'>;

export function validateDerivedDraft(
  d: DerivedDraft,
  trackerIds: Set<string>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!d.name.trim()) errors.name = 'Escribe un nombre.';
  else if (d.name.trim().length > 40) errors.name = 'Máximo 40 caracteres.';
  if (!trackerIds.has(d.aId)) errors.aId = 'Elige el rastreador A.';
  if (!trackerIds.has(d.bId)) errors.bId = 'Elige el rastreador B.';
  if (!errors.aId && !errors.bId && d.aId === d.bId) errors.bId = 'A y B deben ser distintos.';
  if (!DERIVED_OPS.some((o) => o.op === d.op)) errors.op = 'Elige una operación.';
  return errors;
}

/**
 * Valor diario de la métrica, solo en los días en que ambos rastreadores
 * tienen registros. En la división se omiten los días con B = 0.
 */
export function derivedTotals(
  op: DerivedOp,
  a: Map<string, number>,
  b: Map<string, number>,
): Map<string, number> {
  const out = new Map<string, number>();
  for (const [date, va] of a) {
    const vb = b.get(date);
    if (vb === undefined) continue;
    switch (op) {
      case 'ratio':
        if (vb !== 0) out.set(date, va / vb);
        break;
      case 'difference':
        out.set(date, va - vb);
        break;
      case 'sum':
        out.set(date, va + vb);
        break;
      case 'product':
        out.set(date, va * vb);
        break;
    }
  }
  return out;
}

/** "Gastos ÷ Estudio" */
export function describeFormula(
  m: Pick<DerivedMetric, 'op'>,
  a: Tracker | undefined,
  b: Tracker | undefined,
): string {
  const symbol = DERIVED_OPS.find((o) => o.op === m.op)?.symbol ?? '?';
  return `${a?.name ?? '(eliminado)'} ${symbol} ${b?.name ?? '(eliminado)'}`;
}
