import { afterEach, describe, expect, it, vi } from 'vitest';
import { isVibrationEnabled, setVibrationEnabled, vibrate } from './haptics';

afterEach(() => localStorage.clear());

describe('vibración', () => {
  it('vibra por defecto y respeta el ajuste', () => {
    const spy = vi.fn();
    Object.defineProperty(navigator, 'vibrate', { value: spy, configurable: true });
    expect(isVibrationEnabled()).toBe(true);
    vibrate(10);
    expect(spy).toHaveBeenCalledWith(10);
    setVibrationEnabled(false);
    vibrate(10);
    expect(spy).toHaveBeenCalledTimes(1);
    setVibrationEnabled(true);
    expect(isVibrationEnabled()).toBe(true);
  });
});
