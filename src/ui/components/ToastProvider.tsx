import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ToastContext, type ToastOptions } from './toastContext';

interface ActiveToast extends ToastOptions {
  id: number;
}

/** Muestra un aviso a la vez en la parte inferior, con acción opcional (por ejemplo, "Deshacer"). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const nextId = useRef(0);

  const show = useCallback((options: ToastOptions) => {
    nextId.current += 1;
    setToast({ ...options, id: nextId.current });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), toast.duration ?? 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-3"
      >
        {toast && (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-3 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white shadow-lg motion-safe:animate-[toast-in_150ms_ease-out] dark:bg-slate-100 dark:text-slate-900"
          >
            <span>{toast.message}</span>
            <span className="flex shrink-0">
              {toast.secondaryLabel && toast.onSecondary && (
                <button
                  type="button"
                  className="min-h-11 rounded-lg px-3 font-semibold hover:bg-white/10 dark:hover:bg-slate-900/10"
                  onClick={() => {
                    toast.onSecondary?.();
                    setToast(null);
                  }}
                >
                  {toast.secondaryLabel}
                </button>
              )}
              {toast.actionLabel && toast.onAction && (
                <button
                  type="button"
                  className="min-h-11 rounded-lg px-3 font-semibold text-emerald-300 hover:bg-white/10 dark:text-emerald-700 dark:hover:bg-slate-900/10"
                  onClick={() => {
                    toast.onAction?.();
                    setToast(null);
                  }}
                >
                  {toast.actionLabel}
                </button>
              )}
            </span>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
