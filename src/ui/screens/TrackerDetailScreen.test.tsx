import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { addEntry } from '../../data/entries';
import { resetDb } from '../../data/testUtils';
import { createTracker } from '../../data/trackers';
import { addDays, today } from '../../domain/dates';
import { emptyDraft } from '../../domain/trackers';
import { renderWithProviders } from '../../test/render';
import { StatsScreen } from './StatsScreen';
import { TrackerDetailScreen } from './TrackerDetailScreen';

beforeEach(resetDb);

async function seed() {
  const t = await createTracker({ ...emptyDraft(), name: 'Leer', type: 'boolean' });
  const d = today();
  // Racha actual de 3 días (hoy, ayer, anteayer) y una racha antigua de 4.
  for (const offset of [0, 1, 2, 10, 11, 12, 13]) {
    await addEntry(t.id, { value: 1, date: addDays(d, -offset), time: '20:00', note: '' });
  }
  return t;
}

describe('TrackerDetailScreen', () => {
  it('muestra rachas y el calendario anual', async () => {
    const t = await seed();
    renderWithProviders(<TrackerDetailScreen id={t.id} />);
    const current = (await screen.findByText('Racha actual')).parentElement as HTMLElement;
    expect(within(current).getByText('3 días')).toBeInTheDocument();
    const best = screen.getByText('Mejor racha').parentElement as HTMLElement;
    expect(within(best).getByText('4 días')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /calendario de leer/i })).toBeInTheDocument();
    expect(screen.getByText(/respondes «Sí»/)).toBeInTheDocument();
  });

  it('avisa si el rastreador no existe', async () => {
    renderWithProviders(<TrackerDetailScreen id="nada" />);
    expect(await screen.findByText('Este rastreador no existe.')).toBeInTheDocument();
  });
});

describe('StatsScreen', () => {
  it('lista rastreadores con su racha y enlace al detalle', async () => {
    const t = await seed();
    renderWithProviders(<StatsScreen />);
    const link = await screen.findByRole('link', { name: /leer/i });
    expect(link).toHaveAttribute('href', `#/rastreador/${t.id}`);
    expect(await within(link).findByText('🔥 3 días')).toBeInTheDocument();
  });
});

describe('TrackerDetailScreen · día de la semana', () => {
  it('muestra el perfil semanal', async () => {
    const t = await seed();
    renderWithProviders(<TrackerDetailScreen id={t.id} />);
    expect(
      await screen.findByRole('table', { name: /leer por día de la semana/i }),
    ).toBeInTheDocument();
  });
});
