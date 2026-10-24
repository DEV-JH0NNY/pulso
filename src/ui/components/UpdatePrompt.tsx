import { useRegisterSW } from 'virtual:pwa-register/react';

/** Avisa cuando hay una versión nueva de la app lista para usar. */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;
  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-[calc(0.5rem+env(safe-area-inset-top))] z-50 mx-auto flex w-[min(100%-1.5rem,28rem)] items-center justify-between gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900"
    >
      <span>Hay una versión nueva de Pulso.</span>
      <span className="flex gap-1">
        <button
          type="button"
          className="min-h-11 rounded-lg px-3 hover:bg-white/10 dark:hover:bg-slate-900/10"
          onClick={() => setNeedRefresh(false)}
        >
          Después
        </button>
        <button
          type="button"
          className="min-h-11 rounded-lg px-3 font-semibold text-emerald-300 hover:bg-white/10 dark:text-emerald-700 dark:hover:bg-slate-900/10"
          onClick={() => void updateServiceWorker(true)}
        >
          Actualizar
        </button>
      </span>
    </div>
  );
}
