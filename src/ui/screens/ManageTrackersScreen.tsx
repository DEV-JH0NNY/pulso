import { useState } from 'react';
import {
  createTracker,
  deleteTracker,
  reorderTrackers,
  setTrackerArchived,
  updateTracker,
} from '../../data/trackers';
import { draftFromTracker, duplicateDraft, emptyDraft, moveId } from '../../domain/trackers';
import type { Tracker, TrackerDraft } from '../../domain/types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  IconArchive,
  IconCopy,
  IconDown,
  IconEdit,
  IconGrip,
  IconPlus,
  IconTrash,
  IconUp,
} from '../components/icons';
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
import { useDragReorder } from '../hooks/useDragReorder';
import { describeTracker } from '../trackerText';

type Editing =
  { mode: 'create'; template: TrackerDraft | null } | { mode: 'edit'; tracker: Tracker } | null;

export function ManageTrackersScreen() {
  const trackers = useAllTrackers();
  const [editing, setEditing] = useState<Editing>(null);
  const [toDelete, setToDelete] = useState<Tracker | null>(null);
  const toast = useToast();
  const activeIds = (trackers ?? []).filter((t) => !t.archived).map((t) => t.id);
  const archivedIds = (trackers ?? []).filter((t) => t.archived).map((t) => t.id);
  const drag = useDragReorder(activeIds, (ids) => void reorderTrackers([...ids, ...archivedIds]));

  if (!trackers) return <p className={muted}>Cargando…</p>;

  const byId = new Map(trackers.map((t) => [t.id, t]));
  const active = drag.order.map((id) => byId.get(id)).filter((t): t is Tracker => t !== undefined);
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
            <li
              key={t.id}
              ref={drag.itemRef(t.id)}
              className={`${cardBase} flex flex-wrap items-center gap-2 p-3 sm:flex-nowrap ${
                drag.draggingId === t.id ? 'relative z-10 shadow-lg ring-2 ring-emerald-500' : ''
              }`}
            >
              <span
                {...drag.handleProps(t.id)}
                aria-hidden="true"
                title="Arrastra para reordenar"
                className="-ml-1 flex h-11 w-6 shrink-0 cursor-grab items-center justify-center text-slate-400 active:cursor-grabbing"
              >
                <IconGrip className="h-5 w-5" />
              </span>
              <TrackerBadge tracker={t} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {t.name}
                  {t.isSample && <SampleTag />}
                </p>
                <p className={`truncate ${muted}`}>{describeTracker(t)}</p>
              </div>
              <div className="-mb-1 flex w-full shrink-0 justify-end border-t border-slate-100 pt-1 sm:mb-0 sm:w-auto sm:border-0 sm:pt-0 dark:border-slate-800">
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
                  aria-label={`Duplicar ${t.name}`}
                  onClick={() => setEditing({ mode: 'create', template: duplicateDraft(t) })}
                >
                  <IconCopy />
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
                ? draftFromTracker(editing.tracker)
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
