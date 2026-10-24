/**
 * Utilidades de fechas locales. Las fechas se manejan como cadenas AAAA-MM-DD
 * para evitar problemas de zona horaria al agrupar por día.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

const pad = (n: number) => String(n).padStart(2, '0');

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function isValidISODate(value: string): boolean {
  const m = ISO_DATE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d;
}

export function isValidTime(value: string): boolean {
  return TIME.test(value);
}

/** Convierte AAAA-MM-DD a un Date local a medianoche. */
export function parseISODate(value: string): Date {
  const m = ISO_DATE.exec(value);
  if (!m) throw new Error(`Fecha inválida: ${value}`);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function addDays(date: string, days: number): string {
  const d = parseISODate(date);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Días transcurridos de `from` a `to` (puede ser negativo). */
export function daysBetween(from: string, to: string): number {
  const a = parseISODate(from);
  const b = parseISODate(to);
  // Math.round absorbe los cambios de horario de verano.
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Lista de fechas consecutivas desde `from` hasta `to`, ambas incluidas. */
export function dateRange(from: string, to: string): string[] {
  const out: string[] = [];
  const n = daysBetween(from, to);
  for (let i = 0; i <= n; i++) out.push(addDays(from, i));
  return out;
}

/** Lunes de la semana de la fecha dada (en Colombia la semana empieza el lunes). */
export function startOfWeek(date: string): string {
  const day = parseISODate(date).getDay(); // 0 = domingo
  const offset = (day + 6) % 7;
  return addDays(date, -offset);
}

/** Primer día del mes como AAAA-MM-01. */
export function startOfMonth(date: string): string {
  return `${date.slice(0, 7)}-01`;
}

export function addMonths(date: string, months: number): string {
  const d = parseISODate(startOfMonth(date));
  d.setMonth(d.getMonth() + months);
  return toISODate(d);
}

/** Día de la semana con lunes = 0 y domingo = 6. */
export function weekdayIndex(date: string): number {
  return (parseISODate(date).getDay() + 6) % 7;
}

export function today(now: Date = new Date()): string {
  return toISODate(now);
}
