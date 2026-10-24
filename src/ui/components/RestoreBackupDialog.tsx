import { useState } from 'react';
import { restoreBackup, type RestoreMode } from '../../data/backupIO';
import { parseBackup, type BackupResult } from '../../domain/backup';
import { plural } from '../../domain/format';
import { Modal } from './Modal';
import { buttonDanger, buttonPrimary, buttonSecondary, label, muted } from './styles';
import { useToast } from './toastContext';

const MAX_BACKUP_BYTES = 50 * 1024 * 1024;

const formatExportedAt = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? 'fecha desconocida'
    : new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeStyle: 'short' }).format(d);
};

export function RestoreBackupDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [result, setResult] = useState<BackupResult | null>(null);
  const [mode, setMode] = useState<RestoreMode>('merge');
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const close = () => {
    setResult(null);
    setMode('merge');
    onClose();
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_BACKUP_BYTES) {
      setResult({ ok: false, error: 'El archivo supera 50 MB; no parece un respaldo de Pulso.' });
      return;
    }
    try {
      setResult(parseBackup(await file.text()));
    } catch {
      setResult({ ok: false, error: 'No se pudo leer el archivo.' });
    }
  };

  const confirm = async () => {
    if (!result?.ok) return;
    setBusy(true);
    try {
      await restoreBackup(result.backup, mode);
      toast({ message: 'Respaldo restaurado' });
      close();
    } catch (e) {
      // La restauración es una transacción: si falla, la base queda como estaba.
      toast({
        message: `No se pudo restaurar (tus datos no cambiaron): ${e instanceof Error ? e.message : String(e)}`,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title="Restaurar respaldo" onClose={close}>
      <div className="space-y-4">
        <div>
          <label htmlFor="backup-file" className={label}>
            Archivo de respaldo (.json)
          </label>
          <input
            id="backup-file"
            type="file"
            accept=".json,application/json"
            onChange={(e) => void onFile(e.target.files?.[0])}
            className="block w-full text-sm file:mr-3 file:min-h-11 file:rounded-xl file:border-0 file:bg-slate-200 file:px-4 file:font-semibold dark:file:bg-slate-800 dark:file:text-slate-100"
          />
        </div>

        {result && !result.ok && (
          <p
            role="alert"
            className="rounded-xl bg-rose-50 p-3 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
          >
            {result.error}
          </p>
        )}

        {result?.ok && (
          <>
            <p aria-live="polite">
              Respaldo del {formatExportedAt(result.backup.exportedAt)} con{' '}
              <strong>{plural(result.backup.trackers.length, 'rastreador', 'rastreadores')}</strong>{' '}
              y <strong>{plural(result.backup.entries.length, 'registro')}</strong>.
            </p>
            <fieldset className="space-y-2">
              <legend className={label}>¿Cómo restaurar?</legend>
              <label className="flex gap-3 rounded-xl border border-slate-200 p-3 has-[:checked]:border-emerald-600 dark:border-slate-700">
                <input
                  type="radio"
                  name="restore-mode"
                  checked={mode === 'merge'}
                  onChange={() => setMode('merge')}
                  className="mt-1 h-4 w-4 accent-emerald-700"
                />
                <span>
                  <span className="block font-medium">Combinar</span>
                  <span className={muted}>
                    Agrega lo del respaldo y conserva tus datos actuales.
                  </span>
                </span>
              </label>
              <label className="flex gap-3 rounded-xl border border-slate-200 p-3 has-[:checked]:border-rose-600 dark:border-slate-700">
                <input
                  type="radio"
                  name="restore-mode"
                  checked={mode === 'replace'}
                  onChange={() => setMode('replace')}
                  className="mt-1 h-4 w-4 accent-rose-600"
                />
                <span>
                  <span className="block font-medium">Reemplazar todo</span>
                  <span className={muted}>
                    Borra tus datos actuales y deja solo los del respaldo.
                  </span>
                </span>
              </label>
            </fieldset>
          </>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={buttonSecondary} onClick={close}>
            Cancelar
          </button>
          {result?.ok && (
            <button
              type="button"
              className={mode === 'replace' ? buttonDanger : buttonPrimary}
              disabled={busy}
              onClick={() => void confirm()}
            >
              {mode === 'replace' ? 'Reemplazar y restaurar' : 'Combinar y restaurar'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
