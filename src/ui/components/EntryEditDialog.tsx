import { deleteEntry, restoreEntry, updateEntry } from '../../data/entries';
import type { Entry, EntryDraft, Tracker } from '../../domain/types';
import { useToday } from '../hooks/useToday';
import { EntryForm } from './EntryForm';
import { Modal } from './Modal';
import { useToast } from './toastContext';

interface EntryEditDialogProps {
  entry: Entry | null;
  tracker: Tracker | undefined;
  onClose: () => void;
}

/** Diálogo para editar o borrar (con deshacer) un registro existente. */
export function EntryEditDialog({ entry, tracker, onClose }: EntryEditDialogProps) {
  const todayDate = useToday();
  const toast = useToast();

  const save = async (draft: EntryDraft) => {
    if (!entry) return;
    await updateEntry(entry.id, draft);
    onClose();
    toast({ message: 'Registro actualizado' });
  };

  const remove = async () => {
    if (!entry) return;
    const removed = await deleteEntry(entry.id);
    onClose();
    if (removed)
      toast({
        message: 'Registro borrado',
        actionLabel: 'Deshacer',
        onAction: () => void restoreEntry(removed),
      });
  };

  return (
    <Modal open={entry !== null} title="Editar registro" onClose={onClose}>
      {entry && tracker && (
        <EntryForm
          key={entry.id}
          tracker={tracker}
          initial={entry}
          maxDate={todayDate}
          submitLabel="Guardar"
          onSubmit={save}
          onCancel={onClose}
          onDelete={() => void remove()}
        />
      )}
    </Modal>
  );
}
