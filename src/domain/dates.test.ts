import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  dateRange,
  daysBetween,
  isValidISODate,
  isValidTime,
  startOfMonth,
  startOfWeek,
  toISODate,
  toTime,
  weekdayIndex,
} from './dates';

describe('fechas', () => {
  it('convierte Date a AAAA-MM-DD y HH:mm locales', () => {
    const d = new Date(2026, 0, 5, 7, 3);
    expect(toISODate(d)).toBe('2026-01-05');
    expect(toTime(d)).toBe('07:03');
  });

  it('valida fechas reales', () => {
    expect(isValidISODate('2026-02-28')).toBe(true);
    expect(isValidISODate('2024-02-29')).toBe(true);
    expect(isValidISODate('2026-02-29')).toBe(false);
    expect(isValidISODate('2026-13-01')).toBe(false);
    expect(isValidISODate('26-01-01')).toBe(false);
    expect(isValidISODate('2026/01/01')).toBe(false);
  });

  it('valida horas', () => {
    expect(isValidTime('00:00')).toBe(true);
    expect(isValidTime('23:59')).toBe(true);
    expect(isValidTime('24:00')).toBe(false);
    expect(isValidTime('7:00')).toBe(false);
  });

  it('suma días cruzando meses y años', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
  });

  it('calcula diferencias y rangos', () => {
    expect(daysBetween('2026-01-01', '2026-01-31')).toBe(30);
    expect(daysBetween('2026-01-31', '2026-01-01')).toBe(-30);
    expect(dateRange('2026-03-30', '2026-04-02')).toEqual([
      '2026-03-30',
      '2026-03-31',
      '2026-04-01',
      '2026-04-02',
    ]);
  });

  it('la semana empieza el lunes', () => {
    expect(startOfWeek('2026-10-24')).toBe('2026-10-19'); // sábado → lunes
    expect(startOfWeek('2026-10-19')).toBe('2026-10-19');
    expect(startOfWeek('2026-10-25')).toBe('2026-10-19'); // domingo
    expect(weekdayIndex('2026-10-19')).toBe(0);
    expect(weekdayIndex('2026-10-25')).toBe(6);
  });

  it('maneja meses', () => {
    expect(startOfMonth('2026-10-24')).toBe('2026-10-01');
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-01');
    expect(addMonths('2026-01-15', -1)).toBe('2025-12-01');
  });
});
