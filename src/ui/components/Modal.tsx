import { useEffect, useId, useRef, type ReactNode } from 'react';
import { IconClose } from './icons';
import { iconButton } from './styles';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Diálogo modal basado en <dialog>: el navegador se encarga de atrapar el foco,
 * cerrar con Escape y devolver el foco al cerrar.
 */
export function Modal({ open, title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Clic en el fondo (fuera del contenido) cierra el diálogo.
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(100%-1.5rem,28rem)] max-h-[90dvh] overflow-hidden rounded-2xl bg-white p-0 text-slate-900 shadow-xl dark:bg-slate-900 dark:text-slate-100"
    >
      <div className="flex max-h-[90dvh] flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-2 dark:border-slate-800">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button type="button" className={iconButton} onClick={onClose} aria-label="Cerrar">
            <IconClose />
          </button>
        </header>
        <div className="overflow-y-auto p-4">{children}</div>
      </div>
    </dialog>
  );
}
