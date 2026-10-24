import { useState } from 'react';
import { isVibrationEnabled, setVibrationEnabled } from '../haptics';

export function VibrationToggle() {
  const [enabled, setEnabled] = useState(isVibrationEnabled);
  if (typeof navigator.vibrate !== 'function') return null;
  return (
    <label className="mt-3 flex min-h-11 items-center gap-3">
      <input
        type="checkbox"
        className="h-5 w-5 accent-emerald-700"
        checked={enabled}
        onChange={(e) => {
          setEnabled(e.target.checked);
          setVibrationEnabled(e.target.checked);
        }}
      />
      <span className="font-medium">Vibrar al registrar</span>
    </label>
  );
}
