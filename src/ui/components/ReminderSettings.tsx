import { useId, useState } from 'react';
import { REMINDER_TIME, setSetting } from '../../data/settings';
import { useSetting } from '../hooks/useSetting';
import { input, label, muted } from './styles';

export function ReminderSettings() {
  const time = useSetting<string | null>(REMINDER_TIME, null);
  const id = useId();
  const [permission, setPermission] = useState(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  );

  if (time === undefined) return null;

  const enable = async (value: string) => {
    await setSetting(REMINDER_TIME, value);
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      setPermission(await Notification.requestPermission());
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex min-h-11 items-center gap-3">
        <input
          type="checkbox"
          className="h-5 w-5 accent-emerald-700"
          checked={time !== null}
          onChange={(e) =>
            void (e.target.checked ? enable('20:00') : setSetting(REMINDER_TIME, null))
          }
        />
        <span className="font-medium">Recordarme registrar cada día</span>
      </label>
      {time !== null && (
        <div>
          <label htmlFor={id} className={label}>
            Hora del recordatorio
          </label>
          <input
            id={id}
            type="time"
            className={`${input} w-40`}
            value={time}
            onChange={(e) => e.target.value && void setSetting(REMINDER_TIME, e.target.value)}
          />
        </div>
      )}
      <p className={muted}>
        Sin un servidor, los navegadores no permiten notificaciones programadas con la app cerrada.
        El aviso aparece en «Hoy» después de esa hora si no has registrado nada
        {permission === 'granted' ? ', y llega una notificación si la app está abierta.' : '.'}
      </p>
    </div>
  );
}
