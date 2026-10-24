import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../data/db';
import { BACKUP_SNOOZED_UNTIL } from '../../data/settings';
import { resetDb } from '../../data/testUtils';
import { createTracker } from '../../data/trackers';
import { emptyDraft } from '../../domain/trackers';
import { renderWithProviders } from '../../test/render';
import { BackupReminder } from './BackupReminder';

beforeEach(resetDb);

describe('BackupReminder', () => {
  it('aparece tras semanas sin respaldo y se puede aplazar', async () => {
    const t = await createTracker({ ...emptyDraft(), name: 'Café' });
    await db.entries.add({
      id: 'e1',
      trackerId: t.id,
      value: 1,
      date: '2026-01-01',
      time: '08:00',
      note: '',
      createdAt: Date.now() - 40 * 86_400_000,
      isSample: false,
    });
    const { user } = renderWithProviders(<BackupReminder />);
    expect(await screen.findByText(/hacemos un respaldo/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ahora no' }));
    await waitFor(() => expect(screen.queryByText(/hacemos un respaldo/i)).not.toBeInTheDocument());
    expect(await db.settings.get(BACKUP_SNOOZED_UNTIL)).toBeDefined();
  });

  it('no aparece con datos recientes', async () => {
    const t = await createTracker({ ...emptyDraft(), name: 'Café' });
    await db.entries.add({
      id: 'e1',
      trackerId: t.id,
      value: 1,
      date: '2026-01-01',
      time: '08:00',
      note: '',
      createdAt: Date.now(),
      isSample: false,
    });
    renderWithProviders(<BackupReminder />);
    await new Promise((r) => setTimeout(r, 100));
    expect(screen.queryByText(/hacemos un respaldo/i)).not.toBeInTheDocument();
  });
});
