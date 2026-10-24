import { useState } from 'react';
import {
  createTracker,
  deleteTracker,
  reorderTrackers,
  setTrackerArchived,
  updateTracker,
} from '../../data/trackers';
import { emptyDraft, moveId } from '../../domain/trackers';
import type { Tracker, TrackerDraft } from '../../domain/types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { IconArchive, IconDown, IconEdit, IconPlus, IconTrash, IconUp } from '../components/icons';
import { Modal } from '../components/Modal';
import {
  buttonPrimary,
  buttonSecondary,
  card,
  cardBase,
  iconButton,
  muted,
  sectionTitle,
} from '../components/styles';
import { useToast } from '../components/toastContext';
import { TrackerBadge } from '../components/TrackerBadge';
import { TemplatePicker } from '../components/TemplatePicker';
import { TrackerForm } from '../components/TrackerForm';
import { SampleTag } from '../components/SampleTag';
import { useAllTrackers } from '../hooks/useData';
import { describeTracker } from '../trackerText';

type Editing =
  { mode: 'create'; template: TrackerDraft | null } | { mode: 'edit'; tracker: Tracker } | null;

const toDraft = (t: Tracker): TrackerDraft => ({
  name: t.name,
  icon: t.icon,
  color: t.color,
  type: t.type,
  unit: t.unit,
  defaultValue: t.defaultValue,
  dailyGoal: t.dailyGoal,
});

export function ManageTrackersScreen() {
  const trackers = useAllTrackers();
  const [editing, setEditing] = useState<Editing>(null);
  const [toDelete, setToDelete] = useState<Tracker | null>(null);
  const toast = useToast();

  if (!trackers) return <p className={muted}>Cargando…</p>;

  const active = trackers.filter((t) => !t.archived);
  const archived = trackers.filter((t) => t.archived);

  const move = async (id: string, direction: -1 | 1) => {
    const ids = moveId(
      active.map((t) => t.id),
      id,
      direction,
    );
    await reorderTrackers([...ids, ...archived.map((t) => t.id)]);
  };

  const archive = async (t: Tracker) => {
    await setTrackerArchived(t.id, true);
    toast({
      message: `«${t.name}» archivado`,
      actionLabel: 'Deshacer',
      onAction: () => void setTrackerArchived(t.id, false),
    });
  };

  const save = async (draft: TrackerDraft) => {
    if (editing?.mode === 'edit') {
      await updateTracker(editing.tracker.id, draft);
      toast({ message: 'Cambios guardados' });
    } else {
      await createTracker(draft);
      toast({ message: `«${draft.name.trim()}» creado` });
    }
    setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className={muted}>Crea, edita, ordena o archiva lo que quieres medir.</p>
        <button
          type="button"
          className={buttonPrimary}
          onClick={() => setEditing({ mode: 'create', template: null })}
        >
          <IconPlus className="h-5 w-5" /> Nuevo
        </button>
      </div>

      <h2 className={sectionTitle}>Activos ({active.length})</h2>
      {active.length === 0 ? (
        <p className={`${card} ${muted}`}>
          Aún no tienes rastreadores activos. Crea el primero con el botón «Nuevo».
        </p>
      ) : (
        <ul className="space-y-2">
          {active.map((t, i) => (
            <li key={t.id} className={`${cardBase} flex items-center gap-3 p-3`}>
              <TrackerBadge tracker={t} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {t.name}
                  {t.isSample && <SampleTag />}
                </p>
                <p className={`truncate ${muted}`}>{describeTracker(t)}</p>
              </div>
              <div className="flex shrink-0">
                <button
                  type="button"
                  className={iconButton}
                  aria-label={`Subir ${t.name}`}
                  disabled={i === 0}
                  onClick={() => void move(t.id, -1)}
                >
                  <IconUp />
                </button>
                <button
                  type="button"
                  className={iconButton}
                  aria-label={`Bajar ${t.name}`}
                  disabled={i === active.length - 1}
                  onClick={() => void move(t.id, 1)}
                >
                  <IconDown />
                </button>
                <button
                  type="button"
                  className={iconButton}
                  aria-label={`Editar ${t.name}`}
                  onClick={() => setEditing({ mode: 'edit', tracker: t })}
                >
                  <IconEdit />
                </button>
                <button
                  type="button"
                  className={iconButton}
                  aria-label={`Archivar ${t.name}`}
                  onClick={() => void archive(t)}
                >
                  <IconArchive />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {archived.length > 0 && (
        <>
          <h2 className={sectionTitle}>Archivados ({archived.length})</h2>
          <p className={`${muted} mb-2`}>
            Los archivados no aparecen en la pantalla de hoy, pero conservan sus registros.
          </p>
          <ul className="space-y-2">
            {archived.map((t) => (
              <li key={t.id} className={`${cardBase} flex items-center gap-3 p-3 opacity-80`}>
                <TrackerBadge tracker={t} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{t.name}</p>
                  <p className={`truncate ${muted}`}>{describeTracker(t)}</p>
                </div>
                <button
                  type="button"
                  className={buttonSecondary}
                  onClick={() => void setTrackerArchived(t.id, false)}
                  aria-label={`Restaurar ${t.name}`}
                >
                  Restaurar
                </button>
                <button
                  type="button"
                  className={iconButton}
                  aria-label={`Eliminar ${t.name}`}
                  onClick={() => setToDelete(t)}
                >
                  <IconTrash />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <Modal
        open={editing !== null}
        title={editing?.mode === 'edit' ? 'Editar rastreador' : 'Nuevo rastreador'}
        onClose={() => setEditing(null)}
      >
        {editing?.mode === 'create' && (
          <TemplatePicker
            existingNames={trackers.map((t) => t.name)}
            selected={editing.template?.name ?? null}
            onPick={(template) => setEditing({ mode: 'create', template })}
          />
        )}
        {editing && (
          <TrackerForm
            key={
              editing.mode === 'edit' ? editing.tracker.id : `new-${editing.template?.name ?? ''}`
            }
            initial={
              editing.mode === 'edit'
                ? toDraft(editing.tracker)
                : (editing.template ?? emptyDraft())
            }
            submitLabel={editing.mode === 'edit' ? 'Guardar' : 'Crear'}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar rastreador"
        message={`Se eliminará «${toDelete?.name ?? ''}» y todos sus registros. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) void deleteTracker(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}
