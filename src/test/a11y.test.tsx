import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it } from 'vitest';
import { App } from '../app/App';
import { db } from '../data/db';
import { loadSampleData } from '../data/sample';
import { resetDb } from '../data/testUtils';
import { axeViolations } from './axe';
import { render } from '@testing-library/react';

beforeAll(async () => {
  await resetDb();
  await loadSampleData();
});

async function visit(hash: string, heading: string | RegExp) {
  window.location.hash = hash;
  const view = render(<App />);
  await screen.findByRole('heading', { level: 1, name: heading });
  // Espera a que terminen de cargar los datos de la pantalla.
  await waitFor(() => expect(screen.queryByText('Cargando…')).not.toBeInTheDocument(), {
    timeout: 3000,
  });
  return view;
}

describe('accesibilidad (axe)', () => {
  const pages: [string, string | RegExp][] = [
    ['#/', 'Hoy'],
    ['#/historial', 'Historial'],
    ['#/estadisticas', 'Estadísticas'],
    ['#/hallazgos', 'Hallazgos'],
    ['#/ajustes', 'Ajustes'],
    ['#/rastreadores', 'Rastreadores'],
    ['#/anual', 'Tu año en Pulso'],
  ];

  for (const [hash, heading] of pages) {
    it(`sin violaciones en ${hash}`, async () => {
      const { container } = await visit(hash, heading);
      expect(await axeViolations(container)).toEqual([]);
    });
  }

  it('sin violaciones en el detalle de un rastreador', async () => {
    const [t] = await db.trackers.toArray();
    const { container } = await visit(`#/rastreador/${t?.id ?? ''}`, t?.name ?? '');
    await screen.findByText('Racha actual');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('sin violaciones en el formulario de nuevo rastreador', async () => {
    const user = userEvent.setup();
    const { baseElement } = await visit('#/rastreadores', 'Rastreadores');
    await user.click(await screen.findByRole('button', { name: /nuevo/i }));
    await screen.findByRole('dialog', { name: 'Nuevo rastreador' });
    expect(await axeViolations(baseElement)).toEqual([]);
  });
});
