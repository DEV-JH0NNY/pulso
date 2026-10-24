import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../data/db';
import { resetDb } from '../../data/testUtils';
import { createTracker } from '../../data/trackers';
import { addDays } from '../../domain/dates';
import { newId } from '../../domain/ids';
import { emptyDraft } from '../../domain/trackers';
import type { Entry } from '../../domain/types';
import { renderWithProviders } from '../../test/render';
import { InsightsScreen } from './InsightsScreen';

beforeEach(resetDb);

async function seed(days: number) {
  const coffee = await createTracker({ ...emptyDraft(), name: 'Café' });
  const sleep = await createTracker({
    ...emptyDraft(),
    name: 'Sueño',
    type: 'quantity',
    unit: 'h',
  });
  const rows: Entry[] = [];
  for (let i = 0; i < days; i++) {
    const cups = 1 + (i % 4);
    const date = addDays('2026-01-01', i);
    const base = { time: '08:00', note: '', createdAt: 0, isSample: false, date };
    rows.push({ ...base, id: newId(), trackerId: coffee.id, value: cups });
    rows.push({ ...base, id: newId(), trackerId: sleep.id, value: 9 - cups + (i % 2) * 0.3 });
  }
  await db.entries.bulkAdd(rows);
}

describe('InsightsScreen', () => {
  it('siempre advierte que correlación no implica causalidad', async () => {
    renderWithProviders(<InsightsScreen />);
    expect(await screen.findByText(/correlación no implica causalidad/i)).toBeInTheDocument();
  });

  it('muestra cuántos días faltan cuando no hay 14 en común', async () => {
    await seed(5);
    renderWithProviders(<InsightsScreen />);
    expect(await screen.findByText('Aún no hay suficientes datos')).toBeInTheDocument();
    expect(screen.getByText('5 de 14 días')).toBeInTheDocument();
  });

  it('explica una relación fuerte en lenguaje simple', async () => {
    await seed(20);
    renderWithProviders(<InsightsScreen />);
    expect(
      await screen.findByText(
        'Los días en que registras más «Café», tiendes a registrar menos «Sueño».',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/relación fuerte negativa/i)).toBeInTheDocument();
    expect(screen.getByText(/con 20 días en común, es poco probable/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /diagrama de dispersión/i })).toBeInTheDocument();
  });
});

describe('InsightsScreen · desfase', () => {
  it('muestra relaciones con el día siguiente', async () => {
    const coffee = await createTracker({ ...emptyDraft(), name: 'Café' });
    const sleep = await createTracker({
      ...emptyDraft(),
      name: 'Sueño',
      type: 'quantity',
      unit: 'h',
    });
    const cups = Array.from({ length: 25 }, (_, i) => 1 + ((i * 7) % 5));
    const rows: Entry[] = cups.flatMap((c, i) => {
      const base = {
        time: '08:00',
        note: '',
        createdAt: 0,
        isSample: false,
        date: addDays('2026-01-01', i),
      };
      // El sueño de cada día depende del café del día anterior.
      const prev = cups[i - 1] ?? 3;
      return [
        { ...base, id: newId(), trackerId: coffee.id, value: c },
        { ...base, id: newId(), trackerId: sleep.id, value: 10 - prev },
      ];
    });
    await db.entries.bulkAdd(rows);
    renderWithProviders(<InsightsScreen />);
    expect(await screen.findByRole('heading', { name: /al día siguiente/i })).toBeInTheDocument();
  });
});

describe('InsightsScreen · exportar', () => {
  it('descarga los hallazgos como CSV', async () => {
    await seed(20);
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:x');
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const { user } = renderWithProviders(<InsightsScreen />);
    await user.click(await screen.findByRole('button', { name: 'Exportar hallazgos (CSV)' }));
    const text = await (createObjectURL.mock.calls[0]?.[0] as Blob).text();
    expect(text.split('\r\n')[0]).toBe(
      'rastreador_a,rastreador_b,desfase_dias,r,n,p,p_ajustado_bh,fuerza',
    );
    expect(text).toContain('Café,Sueño,0,');
    vi.unstubAllGlobals();
  });
});
