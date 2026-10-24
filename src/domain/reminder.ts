/** ¿Mostrar el recordatorio diario? Solo después de la hora elegida y si hoy no hay registros. */
export function shouldShowDailyReminder(
  reminderTime: string | null,
  nowTime: string,
  loggedToday: boolean,
): boolean {
  return reminderTime !== null && !loggedToday && nowTime >= reminderTime;
}

/** Milisegundos desde `now` hasta la próxima ocurrencia de `time` (HH:mm) hoy; null si ya pasó. */
export function msUntilToday(time: string, now: Date): number | null {
  const [h = 0, m = 0] = time.split(':').map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  const diff = target.getTime() - now.getTime();
  return diff > 0 ? diff : null;
}
