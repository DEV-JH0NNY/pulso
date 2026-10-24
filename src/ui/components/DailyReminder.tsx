import { useEffect, useState } from 'react';
import { REMINDER_TIME } from '../../data/settings';
import { toTime } from '../../domain/dates';
import { formatTime } from '../../domain/format';
import { msUntilToday, shouldShowDailyReminder } from '../../domain/reminder';
import { useSetting } from '../hooks/useSetting';

/**
 * Recordatorio dentro de la app: después de la hora elegida, si hoy no hay
 * registros, muestra un aviso. Si hay permiso, también envía una notificación
 * a esa hora mientras la app siga abierta (sin servidor no es posible más).
 */
export function DailyReminder({ loggedToday }: { loggedToday: boolean }) {
  const time = useSetting<string | null>(REMINDER_TIME, null);
  const [now, setNow] = useState(() => toTime(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(toTime(new Date())), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!time || loggedToday) return;
    const wait = msUntilToday(time, new Date());
    if (
      wait === null ||
      typeof Notification === 'undefined' ||
      Notification.permission !== 'granted'
    )
      return;
    const timer = window.setTimeout(() => {
      new Notification('Pulso', {
        body: 'Aún no registras nada hoy. ¿Un toque?',
        icon: 'pwa-192.png',
      });
    }, wait);
    return () => window.clearTimeout(timer);
  }, [time, loggedToday]);

  if (!time || !shouldShowDailyReminder(time, now, loggedToday)) return null;
  return (
    <p
      role="status"
      className="mb-4 rounded-2xl border border-violet-300 bg-violet-50 p-3 text-sm text-violet-950 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100"
    >
      ⏰ Ya son más de las {formatTime(time)} y aún no registras nada hoy.
    </p>
  );
}
