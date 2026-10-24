import { parseISODate, addDays } from './dates';
import type { Tracker } from './types';

export const LOCALE = 'es-CO';

const numberFormatters = new Map<number, Intl.NumberFormat>();

/** Formatea un número con separadores de Colombia (1.234,5). */
export function formatNumber(value: number, maxFractionDigits = 2): string {
  let f = numberFormatters.get(maxFractionDigits);
  if (!f) {
    f = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: maxFractionDigits });
    numberFormatters.set(maxFractionDigits, f);
  }
  return f.format(value);
}

const copFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatCOP(value: number): string {
  return copFormatter.format(value);
}

export function isCurrencyUnit(unit: string): boolean {
  return unit.trim().toUpperCase() === 'COP';
}

/**
 * Singular aproximado de una unidad escrita en plural ("tazas" → "taza",
 * "veces" → "vez", "meses" → "mes"). Abreviaturas como "h" o "km" no cambian.
 */
export function singularUnit(unit: string): string {
  if (unit.length <= 3 || !/s$/i.test(unit)) return unit;
  if (/ces$/i.test(unit)) return unit.slice(0, -3) + 'z';
  if (/(s|r|l|n|d)es$/i.test(unit)) return unit.slice(0, -2);
  return unit.slice(0, -1);
}

/** Valor con su unidad según el tipo de rastreador. */
export function formatValue(tracker: Pick<Tracker, 'type' | 'unit'>, value: number): string {
  switch (tracker.type) {
    case 'boolean':
      return value >= 1 ? 'Sí' : 'No';
    case 'scale':
      return `${formatNumber(value, 1)}/5`;
    case 'counter':
    case 'quantity': {
      if (isCurrencyUnit(tracker.unit)) return formatCOP(value);
      const n = formatNumber(value);
      if (!tracker.unit) return n;
      return `${n} ${value === 1 ? singularUnit(tracker.unit) : tracker.unit}`;
    }
  }
}

const longDate = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const longDateYear = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const shortDate = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });
const monthYear = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' });
const shortMonth = new Intl.DateTimeFormat(LOCALE, { month: 'short' });

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Hoy", "Ayer" o "lunes, 3 de marzo" (con año si no es el actual). */
export function formatDayLabel(date: string, todayDate: string): string {
  if (date === todayDate) return 'Hoy';
  if (date === addDays(todayDate, -1)) return 'Ayer';
  const sameYear = date.slice(0, 4) === todayDate.slice(0, 4);
  return capitalize((sameYear ? longDate : longDateYear).format(parseISODate(date)));
}

export function formatLongDate(date: string): string {
  return capitalize(longDateYear.format(parseISODate(date)));
}

/** "3 mar" */
export function formatShortDate(date: string): string {
  return shortDate.format(parseISODate(date)).replace('.', '');
}

/** "Marzo de 2026" */
export function formatMonthYear(date: string): string {
  return capitalize(monthYear.format(parseISODate(date)));
}

/** "mar" */
export function formatShortMonth(date: string): string {
  return shortMonth.format(parseISODate(date)).replace('.', '');
}

/** Hora HH:mm en formato de 12 horas de Colombia ("7:05 p. m."). */
export function formatTime(time: string): string {
  const [h = 0, m = 0] = time.split(':').map(Number);
  const d = new Date(2000, 0, 1, h, m);
  return new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit' }).format(d);
}

/**
 * Convierte texto escrito por el usuario a número. Acepta coma o punto como
 * separador decimal ("1,5" y "1.5" valen 1,5). Devuelve NaN si no es un número.
 */
export function parseDecimal(text: string): number {
  const t = text.trim().replace(/\s/g, '').replace(',', '.');
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return Number.NaN;
  return Number(t);
}

const compactFormatter = new Intl.NumberFormat(LOCALE, {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Número compacto para ejes de gráficos ("25 mil", "1,2 M"). */
export function formatCompact(value: number): string {
  return compactFormatter.format(value);
}

/** "1 registro", "3 registros" (con separador de miles). */
export function plural(n: number, singular: string, pluralForm = `${singular}s`): string {
  return `${formatNumber(n)} ${n === 1 ? singular : pluralForm}`;
}
