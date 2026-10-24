import { screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../data/db';
import { addEntry } from '../../data/entries';
import { resetDb } from '../../data/testUtils';
import { createTracker } from '../../data/trackers';
import { addDays, today } from '../../domain/dates';
import { emptyDraft } from '../../domain/trackers';
import { renderWithProviders } from '../../test/render';
import { HistoryScreen } from './HistoryScreen';

beforeEach(resetDb);

async function seed() {
  const cafe = await createTracker({ ...emptyDraft(), name: 'Café', unit: 'tazas' });
  const agua = await createTracker({ ...emptyDraft(), name: 'Agua' });
  const t = today();
  await addEntry(cafe.id, { value: 2, date: t, time: '08:00', note: 'con leche' });
  await addEntry(agua.id, { value: 1, date: addDays(t, -1), time: '10:00', note: '' });
  await addEntry(cafe.id, { value: 1, date: addDays(t, -45), time: '09:00', note: '' });
  return { cafe, agua };
}

describe('HistoryScreen', () => {
  it('agrupa por día y carga días más antiguos', async () => {
    await seed();
    const { user } = renderWithProviders(<HistoryScreen />);
    expect(await screen.findByRole('heading', { name: 'Hoy' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ayer' })).toBeInTheDocument();
    expect(screen.getByText('con leche')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: /ver 30 días más/i }));
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(3));
    expect(screen.queryByRole('button', { name: /ver 30 días más/i })).not.toBeInTheDocument();
  });

  it('filtra por rastreador', async () => {
    const { agua } = await seed();
    const { user } = renderWithProviders(<HistoryScreen />);
    await screen.findByText('con leche');
    await user.selectOptions(screen.getByLabelText('Filtrar por rastreador'), agua.id);
    expect(screen.queryByText('con leche')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('edita un registro', async () => {
    await seed();
    const { user } = renderWithProviders(<HistoryScreen />);
    await user.click(await screen.findByRole('button', { name: /café: 2 tazas/i }));
    const dialog = screen.getByRole('dialog', { name: 'Editar registro' });
    const value = within(dialog).getByLabelText('Valor (tazas)');
    await user.clear(value);
    await user.type(value, '3');
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('3 tazas')).toBeInTheDocument();
  });

  it('borra un registro y permite deshacer', async () => {
    await seed();
    const { user } = renderWithProviders(<HistoryScreen />);
    await user.click(await screen.findByRole('button', { name: /café: 2 tazas/i }));
    await user.click(screen.getByRole('button', { name: 'Borrar' }));
    await waitFor(async () => expect(await db.entries.count()).toBe(2));
    await user.click(screen.getByRole('button', { name: 'Deshacer' }));
    await waitFor(async () => expect(await db.entries.count()).toBe(3));
    expect(await screen.findByText('con leche')).toBeInTheDocument();
  });
});

describe('HistoryScreen · búsqueda', () => {
  it('busca en todo el historial por nota, sin importar tildes', async () => {
    await seed();
    const t = (await db.trackers.toArray())[0];
    if (!t) throw new Error('sin rastreador');
    await addEntry(t.id, {
      value: 1,
      date: addDays(today(), -200),
      time: '08:00',
      note: 'Cumpleaños de Ana',
    });
    const { user } = renderWithProviders(<HistoryScreen />);
    await screen.findByText('con leche');
    await user.type(screen.getByLabelText('Buscar'), 'cumpleanos');
    expect(await screen.findByText('Cumpleaños de Ana')).toBeInTheDocument();
    expect(screen.queryByText('con leche')).not.toBeInTheDocument();
    await user.clear(screen.getByLabelText('Buscar'));
    await user.type(screen.getByLabelText('Buscar'), 'zzz');
    expect(await screen.findByText('Ningún registro coincide con «zzz».')).toBeInTheDocument();
  });
});
