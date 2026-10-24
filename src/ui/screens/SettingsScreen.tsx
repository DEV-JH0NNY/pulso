import { useState } from 'react';
import { exportCsv } from '../../data/csvIO';
import { today } from '../../domain/dates';
import { plural } from '../../domain/format';
import { IconChevronRight } from '../components/icons';
import { ImportCsvDialog } from '../components/ImportCsvDialog';
import { buttonSecondary, card, muted, sectionTitle } from '../components/styles';
import { useToast } from '../components/toastContext';
import { downloadText } from '../download';
import { routeHref } from '../router';

export function SettingsScreen() {
  const [importing, setImporting] = useState(false);
  const toast = useToast();

  const doExport = async () => {
    const csv = await exportCsv();
    const rows = csv.split('\r\n').length - 2;
    if (rows <= 0) {
      toast({ message: 'Todavía no hay registros para exportar' });
      return;
    }
    downloadText(`pulso-${today()}.csv`, csv, 'text/csv');
    toast({ message: `Exportado: ${plural(rows, 'registro')}` });
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
      </div>

      <ImportCsvDialog open={importing} onClose={() => setImporting(false)} />
    </div>
  );
}
