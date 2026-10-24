import { useEffect, useState } from 'react';
import { today } from '../../domain/dates';

/** Fecha local de hoy; se actualiza al pasar la medianoche o al volver a la app. */
export function useToday(): string {
  const [value, setValue] = useState(() => today());
  useEffect(() => {
    const check = () => setValue(today());
    const timer = window.setInterval(check, 60_000);
    document.addEventListener('visibilitychange', check);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);
  return value;
}
