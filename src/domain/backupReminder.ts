const DAY = 86_400_000;
/** Días sin exportar a partir de los cuales se sugiere un respaldo. */
export const BACKUP_INTERVAL_DAYS = 30;
/** Días de uso antes del primer recordatorio. */
export const GRACE_DAYS = 7;
export const SNOOZE_DAYS = 7;

export interface ReminderInput {
  /** Momento del primer registro real (no de ejemplo), o null si no hay. */
  firstRealEntryAt: number | null;
  lastExportAt: number | null;
  snoozedUntil: number | null;
  now: number;
}

/** ¿Conviene recordar al usuario que descargue un respaldo? */
export function shouldRemindBackup({
  firstRealEntryAt,
  lastExportAt,
  snoozedUntil,
  now,
}: ReminderInput): boolean {
  if (firstRealEntryAt === null) return false;
  if (snoozedUntil !== null && now < snoozedUntil) return false;
  if (now - firstRealEntryAt < GRACE_DAYS * DAY) return false;
  return lastExportAt === null || now - lastExportAt >= BACKUP_INTERVAL_DAYS * DAY;
}

export function snoozeUntil(now: number): number {
  return now + SNOOZE_DAYS * DAY;
}
