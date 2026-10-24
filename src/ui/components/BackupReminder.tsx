import { useLiveQuery } from 'dexie-react-hooks';
import { exportBackup } from '../../data/backupIO';
import { db } from '../../data/db';
import { BACKUP_SNOOZED_UNTIL, LAST_EXPORT_AT, setSetting } from '../../data/settings';
import { today } from '../../domain/dates';
import { shouldRemindBackup, snoozeUntil } from '../../domain/backupReminder';
import { downloadText } from '../download';
import { buttonGhost, buttonSecondary } from './styles';

const num = (v: unknown) => (typeof v === 'number' ? v : null);

/** Tarjeta que sugiere descargar un respaldo si hace mucho que no se exporta. */
export function BackupReminder() {
  const show = useLiveQuery(async () => {
    const first = await db.entries
      .orderBy('date')
      .filter((e) => !e.isSample)
      .first();
    const [last, snoozed] = await Promise.all([
      db.settings.get(LAST_EXPORT_AT),
      db.settings.get(BACKUP_SNOOZED_UNTIL),
    ]);
    return shouldRemindBackup({
      firstRealEntryAt: first ? first.createdAt : null,
      lastExportAt: num(last?.value),
      snoozedUntil: num(snoozed?.value),
      now: Date.now(),
    });
  }, []);

  if (!show) return null;

  return (
    <section
      aria-label="Recordatorio de respaldo"
      className="mb-4 rounded-2xl border border-sky-300 bg-sky-50 p-4 text-sky-950 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100"
    >
      <p className="font-semibold">💾 ¿Hacemos un respaldo?</p>
      <p className="mt-1 text-sm">
        Tus datos solo viven en este dispositivo. Descarga un respaldo de vez en cuando por si
        cambias de celular o borras el navegador.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={buttonSecondary}
          onClick={() =>
            void (async () => {
              downloadText(
                `pulso-respaldo-${today()}.json`,
                await exportBackup(),
                'application/json',
              );
              await setSetting(LAST_EXPORT_AT, Date.now());
            })()
          }
        >
          Descargar respaldo
        </button>
        <button
          type="button"
          className={buttonGhost}
          onClick={() => void setSetting(BACKUP_SNOOZED_UNTIL, snoozeUntil(Date.now()))}
        >
          Ahora no
        </button>
      </div>
    </section>
  );
}
