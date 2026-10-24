import { describe, expect, it } from 'vitest';
import { shouldRemindBackup, snoozeUntil } from './backupReminder';

const DAY = 86_400_000;
const now = 100 * DAY;

describe('recordatorio de respaldo', () => {
  it('no recuerda sin registros reales ni durante la primera semana', () => {
    expect(
      shouldRemindBackup({ firstRealEntryAt: null, lastExportAt: null, snoozedUntil: null, now }),
    ).toBe(false);
    expect(
      shouldRemindBackup({
        firstRealEntryAt: now - 3 * DAY,
        lastExportAt: null,
        snoozedUntil: null,
        now,
      }),
    ).toBe(false);
  });

  it('recuerda si nunca se exportó o pasaron 30 días', () => {
    const first = now - 40 * DAY;
    expect(
      shouldRemindBackup({ firstRealEntryAt: first, lastExportAt: null, snoozedUntil: null, now }),
    ).toBe(true);
    expect(
      shouldRemindBackup({
        firstRealEntryAt: first,
        lastExportAt: now - 31 * DAY,
        snoozedUntil: null,
        now,
      }),
    ).toBe(true);
    expect(
      shouldRemindBackup({
        firstRealEntryAt: first,
        lastExportAt: now - 5 * DAY,
        snoozedUntil: null,
        now,
      }),
    ).toBe(false);
  });

  it('respeta el aplazamiento', () => {
    const first = now - 40 * DAY;
    expect(
      shouldRemindBackup({
        firstRealEntryAt: first,
        lastExportAt: null,
        snoozedUntil: snoozeUntil(now - DAY),
        now,
      }),
    ).toBe(false);
    expect(
      shouldRemindBackup({
        firstRealEntryAt: first,
        lastExportAt: null,
        snoozedUntil: snoozeUntil(now - 8 * DAY),
        now,
      }),
    ).toBe(true);
  });
});
