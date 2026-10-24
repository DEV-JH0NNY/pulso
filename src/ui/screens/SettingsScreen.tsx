import { useEffect, useState } from 'react';
import { exportBackup } from '../../data/backupIO';
import { isStoragePersisted } from '../../data/storage';
import { exportCsv } from '../../data/csvIO';
import { LAST_EXPORT_AT, setSetting } from '../../data/settings';
import { today } from '../../domain/dates';
import { plural } from '../../domain/format';
import { IconChevronRight } from '../components/icons';
import { ClearSampleButton } from '../components/ClearSampleButton';
import { ImportCsvDialog } from '../components/ImportCsvDialog';
import { RestoreBackupDialog } from '../components/RestoreBackupDialog';
import { ThemePicker } from '../components/ThemePicker';
import { useHasSampleData } from '../hooks/useSample';
import { loadSampleData } from '../../data/sample';
import { buttonSecondary, card, muted, sectionTitle } from '../components/styles';
import { useToast } from '../components/toastContext';
import { downloadText } from '../download';
import { routeHref } from '../router';

export function SettingsScreen() {
  const [importing, setImporting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const toast = useToast();
  const hasSample = useHasSampleData();
  const [persisted, setPersisted] = useState<boolean | null>(null);
  useEffect(() => {
    void isStoragePersisted().then(setPersisted);
  }, []);

  const doExport = async () => {
    const csv = await exportCsv();
    const rows = csv.split('\r\n').length - 2;
    if (rows <= 0) {
      toast({ message: 'Todavía no hay registros para exportar' });
      return;
    }
    downloadText(`pulso-${today()}.csv`, csv, 'text/csv');
    await setSetting(LAST_EXPORT_AT, Date.now());
    toast({ message: `Exportado: ${plural(rows, 'registro')}` });
  };

  const doBackup = async () => {
    downloadText(`pulso-respaldo-${today()}.json`, await exportBackup(), 'application/json');
    await setSetting(LAST_EXPORT_AT, Date.now());
    toast({ message: 'Respaldo descargado' });
  };

  return (
    <div>
      <a
        href={routeHref({ name: 'manage' })}
        className={`${card} flex items-center justify-between font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60`}
      >
        <span>
          Rastreadores
          <span className={`block font-normal ${muted}`}>Crear, editar, ordenar y archivar</span>
        </span>
        <IconChevronRight className="h-5 w-5 text-slate-400" />
      </a>

      <h2 className={sectionTitle}>Apariencia</h2>
      <div className={card}>
        <ThemePicker />
      </div>

      <h2 className={sectionTitle}>Tus datos</h2>
      <div className={`${card} space-y-3`}>
        <p className={muted}>
          Exporta en CSV de formato largo (<code>fecha, hora, rastreador, valor, unidad, nota</code>
          ), listo para Excel, pandas o SQL. Los datos nunca salen de tu dispositivo salvo que tú
          los exportes.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={buttonSecondary} onClick={() => void doExport()}>
            Exportar CSV
          </button>
          <button type="button" className={buttonSecondary} onClick={() => setImporting(true)}>
            Importar CSV
          </button>
        </div>
        <p className={`${muted} border-t border-slate-200 pt-3 dark:border-slate-800`}>
          El <strong>respaldo completo</strong> (JSON) guarda también la configuración de cada
          rastreador: ícono, color, meta, orden y archivados. Úsalo para pasar tus datos a otro
          celular.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={buttonSecondary} onClick={() => void doBackup()}>
            Descargar respaldo
          </button>
          <button type="button" className={buttonSecondary} onClick={() => setRestoring(true)}>
            Restaurar respaldo
          </button>
        </div>
      </div>

      <h2 className={sectionTitle}>Datos de ejemplo</h2>
      <div className={`${card} space-y-3`}>
        <p className={muted}>
          {hasSample
            ? 'Tienes datos de ejemplo cargados. Aparecen con la etiqueta «Ejemplo».'
            : 'Carga 120 días de datos ficticios para explorar la app. Se marcan como ejemplo y se borran con un botón.'}
        </p>
        {hasSample ? (
          <ClearSampleButton className={buttonSecondary} />
        ) : (
          <button
            type="button"
            className={buttonSecondary}
            onClick={() =>
              void loadSampleData().then(() => toast({ message: 'Datos de ejemplo cargados' }))
            }
          >
            Cargar datos de ejemplo
          </button>
        )}
      </div>

      <h2 className={sectionTitle}>Acerca de</h2>
      <div className={`${card} space-y-2 ${muted}`}>
        <p>
          <strong className="text-slate-900 dark:text-slate-100">Pulso</strong> versión{' '}
          {__APP_VERSION__}.
        </p>
        <p>
          Sin cuentas, sin anuncios y sin telemetría. Todo se guarda en este navegador (IndexedDB) y
          funciona sin conexión.{' '}
          {persisted === true
            ? 'El navegador marcó tus datos como persistentes: no los borrará aunque falte espacio. '
            : persisted === false
              ? 'El navegador podría borrar los datos si el dispositivo se queda sin espacio (instalar la app ayuda a evitarlo). '
              : ''}
          Si borras los datos del navegador o desinstalas la app, se pierden: exporta un respaldo de
          vez en cuando.
        </p>
      </div>

      <ImportCsvDialog open={importing} onClose={() => setImporting(false)} />
      <RestoreBackupDialog open={restoring} onClose={() => setRestoring(false)} />
    </div>
  );
}
