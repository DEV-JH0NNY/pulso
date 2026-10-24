import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../data/db';
import { REMINDER_TIME, setSetting } from '../../data/settings';
import { resetDb } from '../../data/testUtils';
import { DailyReminder } from './DailyReminder';
import { ReminderSettings } from './ReminderSettings';

beforeEach(resetDb);

describe('recordatorio diario', () => {
  it('avisa después de la hora si hoy no hay registros', async () => {
    await setSetting(REMINDER_TIME, '00:00');
    render(<DailyReminder loggedToday={false} />);
    expect(await screen.findByText(/aún no registras nada hoy/i)).toBeInTheDocument();
  });

  it('no avisa si ya hay registros', async () => {
    await setSetting(REMINDER_TIME, '00:00');
    render(<DailyReminder loggedToday />);
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText(/aún no registras nada hoy/i)).not.toBeInTheDocument();
  });

  it('se activa y desactiva desde Ajustes', async () => {
    const user = userEvent.setup();
    render(<ReminderSettings />);
    await user.click(await screen.findByLabelText('Recordarme registrar cada día'));
    expect(await screen.findByLabelText('Hora del recordatorio')).toHaveValue('20:00');
    expect((await db.settings.get(REMINDER_TIME))?.value).toBe('20:00');
    await user.click(screen.getByLabelText('Recordarme registrar cada día'));
    expect(await db.settings.get(REMINDER_TIME)).toMatchObject({ value: null });
  });
});
