import { TRACKER_TEMPLATES } from '../../domain/templates';
import type { TrackerDraft } from '../../domain/types';

interface TemplatePickerProps {
  existingNames: string[];
  selected: string | null;
  onPick: (template: TrackerDraft) => void;
}

/** Chips con rastreadores comunes; elegir uno llena el formulario. */
export function TemplatePicker({ existingNames, selected, onPick }: TemplatePickerProps) {
  const existing = new Set(existingNames.map((n) => n.toLocaleLowerCase('es-CO')));
  const available = TRACKER_TEMPLATES.filter(
    (t) => !existing.has(t.name.toLocaleLowerCase('es-CO')),
  );
  if (available.length === 0) return null;
  return (
    <section
      aria-labelledby="plantillas"
      className="mb-5 border-b border-slate-200 pb-4 dark:border-slate-800"
    >
      <h3 id="plantillas" className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        Empieza con una plantilla
      </h3>
      <ul className="flex flex-wrap gap-2">
        {available.map((t) => (
          <li key={t.name}>
            <button
              type="button"
              aria-pressed={selected === t.name}
              onClick={() => onPick(t)}
              className="min-h-11 rounded-full border border-slate-300 px-3 text-sm font-medium hover:bg-slate-100 aria-pressed:border-emerald-600 aria-pressed:bg-emerald-50 dark:border-slate-700 dark:hover:bg-slate-800 dark:aria-pressed:bg-emerald-950/50"
            >
              <span aria-hidden="true">{t.icon}</span> {t.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
