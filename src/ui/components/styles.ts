/** Clases reutilizables para mantener la apariencia consistente. */
/** Tarjeta sin relleno, para listas o para fijar un relleno propio. */
export const cardBase =
  'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900';
export const card = `${cardBase} p-4`;

const buttonBase =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

export const buttonPrimary = `${buttonBase} bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400`;
export const buttonSecondary = `${buttonBase} border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800`;
export const buttonDanger = `${buttonBase} bg-rose-600 text-white hover:bg-rose-700`;
export const buttonGhost = `${buttonBase} text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800`;
export const iconButton =
  'inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800';

export const input =
  'block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';
export const label = 'mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300';
export const fieldError = 'mt-1 text-sm text-rose-600 dark:text-rose-400';
export const muted = 'text-sm text-slate-600 dark:text-slate-400';
export const sectionTitle =
  'mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400';
