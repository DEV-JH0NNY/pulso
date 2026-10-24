import { describe, expect, it } from 'vitest';
import { msUntilToday, shouldShowDailyReminder } from './reminder';

describe('recordatorio diario', () => {
  it('aparece después de la hora si no hay registros', () => {
    expect(shouldShowDailyReminder('20:00', '20:30', false)).toBe(true);
    expect(shouldShowDailyReminder('20:00', '19:59', false)).toBe(false);
    expect(shouldShowDailyReminder('20:00', '21:00', true)).toBe(false);
    expect(shouldShowDailyReminder(null, '21:00', false)).toBe(false);
  });

  it('calcula el tiempo hasta la hora de hoy', () => {
    expect(msUntilToday('20:00', new Date(2026, 9, 24, 19, 30))).toBe(30 * 60_000);
    expect(msUntilToday('20:00', new Date(2026, 9, 24, 20, 30))).toBeNull();
  });
});
