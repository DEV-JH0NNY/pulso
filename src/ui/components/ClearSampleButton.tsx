import { useState } from 'react';
import { clearSampleData } from '../../data/sample';
import { ConfirmDialog } from './ConfirmDialog';
import { useToast } from './toastContext';

/** Botón que borra todos los datos de ejemplo tras confirmar. */
export function ClearSampleButton({
  className,
  label = 'Borrar datos de ejemplo',
}: {
  className: string;
  label?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const toast = useToast();
  return (
    <>
      <button
        type="button"
        className={className}
        aria-label="Borrar datos de ejemplo"
        onClick={() => setConfirming(true)}
      >
        {label}
      </button>
      <ConfirmDialog
        open={confirming}
        title="Borrar datos de ejemplo"
        message="Se borrarán todos los rastreadores y registros de ejemplo (y lo que hayas registrado en ellos). Tus propios rastreadores no se tocan."
        confirmLabel="Borrar"
        danger
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          void clearSampleData().then(() => toast({ message: 'Datos de ejemplo borrados' }));
        }}
      />
    </>
  );
}
