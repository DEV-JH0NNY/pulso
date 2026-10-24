import { useId, useState, type FormEvent } from 'react';
import { updateEntry } from '../../data/entries';
import type { Entry } from '../../domain/types';
import { Modal } from './Modal';
import { buttonPrimary, buttonSecondary, input, label } from './styles';
import { useToast } from './toastContext';

/** Diálogo pequeño para agregar una nota a un registro recién hecho. */
export function NoteDialog({ entry, onClose }: { entry: Entry | null; onClose: () => void }) {
  return (
    <Modal open={entry !== null} title="Agregar nota" onClose={onClose}>
      {entry && <NoteForm key={entry.id} entry={entry} onClose={onClose} />}
    </Modal>
  );
}

function NoteForm({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  const [note, setNote] = useState(entry.note);
  const id = useId();
  const toast = useToast();
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await updateEntry(entry.id, { value: entry.value, date: entry.date, time: entry.time, note });
    toast({ message: 'Nota guardada' });
    onClose();
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor={id} className={label}>
          Nota
        </label>
        <textarea
          id={id}
          className={`${input} min-h-24`}
          value={note}
          maxLength={500}
          autoFocus
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className={buttonSecondary} onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className={buttonPrimary}>
          Guardar
        </button>
      </div>
    </form>
  );
}
