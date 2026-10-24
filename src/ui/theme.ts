export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'pulso-theme';

export function readThemePreference(): ThemePreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

function prefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function applyTheme(pref: ThemePreference): void {
  const dark = pref === 'dark' || (pref === 'system' && prefersDark());
  document.documentElement.classList.toggle('dark', dark);
  // La barra del sistema (Android) sigue el tema elegido, no solo el del sistema.
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
    m.content = dark ? '#020617' : '#f8fafc';
  });
}

export function saveThemePreference(pref: ThemePreference): void {
  try {
    if (pref === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, pref);
  } catch {
    // Almacenamiento bloqueado: el tema solo dura esta sesión.
  }
  applyTheme(pref);
}

/** Aplica el tema guardado y sigue los cambios del sistema mientras la preferencia sea "system". */
export function initTheme(): void {
  applyTheme(readThemePreference());
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    applyTheme(readThemePreference());
  });
}
