import { Modal } from './Modal';
import { buttonDanger, buttonPrimary, buttonSecondary } from './styles';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-slate-700 dark:text-slate-300">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className={buttonSecondary} onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className={danger ? buttonDanger : buttonPrimary} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
