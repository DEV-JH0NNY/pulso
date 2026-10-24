import { db } from './db';

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db.settings.get(key);
  return row === undefined ? fallback : (row.value as T);
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await db.settings.put({ key, value });
}

export const ONBOARDING_DONE = 'onboardingDone';

/** Marca de tiempo (ms) de la última exportación CSV o JSON. */
export const LAST_EXPORT_AT = 'lastExportAt';
export const BACKUP_SNOOZED_UNTIL = 'backupSnoozedUntil';
/** Hora del recordatorio diario (HH:mm) o null si está apagado. */
export const REMINDER_TIME = 'reminderTime';
