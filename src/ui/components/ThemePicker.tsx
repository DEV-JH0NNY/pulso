import { useState } from 'react';
import { readThemePreference, saveThemePreference, type ThemePreference } from '../theme';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
];

export function ThemePicker() {
  const [pref, setPref] = useState<ThemePreference>(readThemePreference);
  return (
    <fieldset>
      <legend className="sr-only">Tema</legend>
      <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {OPTIONS.map((o) => (
          <label
            key={o.value}
            className="flex min-h-10 flex-1 cursor-pointer items-center justify-center rounded-lg text-sm font-semibold text-slate-600 has-[:checked]:bg-white has-[:checked]:text-slate-900 has-[:checked]:shadow-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-sky-500 dark:text-slate-300 dark:has-[:checked]:bg-slate-950 dark:has-[:checked]:text-white"
          >
            <input
              type="radio"
              name="theme"
              value={o.value}
              checked={pref === o.value}
              onChange={() => {
                setPref(o.value);
                saveThemePreference(o.value);
              }}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
