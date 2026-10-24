export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <dt className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 text-2xl font-bold tabular-nums">{value}</dd>
      {hint && <dd className="text-xs text-slate-500 dark:text-slate-400">{hint}</dd>}
    </div>
  );
}
