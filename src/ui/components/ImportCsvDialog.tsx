import { useState } from 'react';
import { applyImport } from '../../data/csvIO';
import { db } from '../../data/db';
import { CSV_COLUMNS, planImport, type ImportPlan } from '../../domain/csvData';
import { plural } from '../../domain/format';
import { TRACKER_TYPE_LABELS } from '../../domain/types';
import { Modal } from './Modal';
import { buttonPrimary, buttonSecondary, label, muted } from './styles';
import { useToast } from './toastContext';

const MAX_ERRORS_SHOWN = 20;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

export function ImportCsvDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const close = () => {
    setPlan(null);
    setFileName('');
    onClose();
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    if (file.size > MAX_FILE_BYTES) {
      setPlan({
        rows: [],
        errors: [],
        newTrackers: [],
        duplicates: 0,
        fatal: 'El archivo supera 20 MB.',
      });
      return;
    }
    const [text, trackers, entries] = await Promise.all([
      file.text(),
      db.trackers.toArray(),
      db.entries.toArray(),
    ]);
    setPlan(planImport(text, trackers, entries));
  };

  const confirm = async () => {
    if (!plan) return;
    setBusy(true);
    try {
      const result = await applyImport(plan);
      toast({
        message: `Importado: ${plural(result.entries, 'registro')}${result.trackers ? ` y ${plural(result.trackers, 'rastreador nuevo', 'rastreadores nuevos')}` : ''}`,
      });
      close();
    } catch (e) {
      toast({ message: `No se pudo importar: ${e instanceof Error ? e.message : String(e)}` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title="Importar CSV" onClose={close}>
      <div className="space-y-4">
        <div>
          <label htmlFor="csv-file" className={label}>
            Archivo CSV
          </label>
          <input
            id="csv-file"
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => void onFile(e.target.files?.[0])}
            className="block w-full text-sm file:mr-3 file:min-h-11 file:rounded-xl file:border-0 file:bg-slate-200 file:px-4 file:font-semibold dark:file:bg-slate-800 dark:file:text-slate-100"
          />
          <p className={`${muted} mt-2`}>
            Formato largo con encabezado <code>{CSV_COLUMNS.join(',')}</code>. Fechas AAAA-MM-DD,
            horas HH:mm, separado por comas o punto y coma.
          </p>
        </div>

        {plan && (
          <section aria-live="polite" aria-label={`Resultado de la validación de ${fileName}`}>
            {plan.fatal ? (
              <p
                role="alert"
                className="rounded-xl bg-rose-50 p-3 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
              >
                {plan.fatal}
              </p>
            ) : (
              <>
                <ul className="space-y-1 text-sm">
                  <li>
                    ✅ <strong>{plan.rows.length}</strong> registros listos para importar
                  </li>
                  {plan.duplicates > 0 && (
                    <li>
                      ↩️ <strong>{plan.duplicates}</strong> duplicados de registros que ya tienes
                      (se omiten)
                    </li>
                  )}
                  {plan.errors.length > 0 && (
                    <li>
                      ⚠️ <strong>{plan.errors.length}</strong> filas con errores (no se importan)
                    </li>
                  )}
                </ul>
                {plan.newTrackers.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Se crearán estos rastreadores:</p>
                    <ul className="mt-1 list-inside list-disc text-sm text-slate-700 dark:text-slate-300">
                      {plan.newTrackers.map((t) => (
                        <li key={t.name}>
                          {t.name} — {TRACKER_TYPE_LABELS[t.type]}
                          {t.unit ? ` (${t.unit})` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {plan.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Errores encontrados:</p>
                    <ul className="mt-1 max-h-48 space-y-1 overflow-y-auto rounded-xl bg-rose-50 p-3 text-sm text-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
                      {plan.errors.slice(0, MAX_ERRORS_SHOWN).map((e) => (
                        <li key={e.line}>
                          <strong>Línea {e.line}:</strong> {e.message}
                        </li>
                      ))}
                      {plan.errors.length > MAX_ERRORS_SHOWN && (
                        <li>…y {plan.errors.length - MAX_ERRORS_SHOWN} errores más.</li>
                      )}
                    </ul>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={buttonSecondary} onClick={close}>
            Cancelar
          </button>
          {plan && !plan.fatal && (
            <button
              type="button"
              className={buttonPrimary}
              disabled={busy || plan.rows.length === 0}
              onClick={() => void confirm()}
            >
              {plan.errors.length > 0
                ? `Importar solo las filas válidas (${plan.rows.length})`
                : `Importar ${plural(plan.rows.length, 'registro')}`}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
