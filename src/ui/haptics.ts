const KEY = 'pulso-vibration';

/** Preferencia del dispositivo (no se respalda: es del aparato, como el tema). */
export function isVibrationEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setVibrationEnabled(enabled: boolean): void {
  try {
    if (enabled) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, 'off');
  } catch {
    // Almacenamiento bloqueado: se mantiene el valor por defecto.
  }
}

/** Vibra si el dispositivo lo permite y el usuario no lo desactivó. */
export function vibrate(pattern: number | number[]): void {
  if (isVibrationEnabled()) navigator.vibrate?.(pattern);
}
