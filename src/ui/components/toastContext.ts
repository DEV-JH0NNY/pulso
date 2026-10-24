import { createContext, useContext } from 'react';

export interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Milisegundos antes de ocultarse. */
  duration?: number;
}

export const ToastContext = createContext<((toast: ToastOptions) => void) | null>(null);

export function useToast(): (toast: ToastOptions) => void {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return show;
}
