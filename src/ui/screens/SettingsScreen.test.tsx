import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../data/db';
import { addEntry } from '../../data/entries';
import { resetDb } from '../../data/testUtils';
import { createTracker } from '../../data/trackers';
import { emptyDraft } from '../../domain/trackers';
import { renderWithProviders } from '../../test/render';
import { SettingsScreen } from './SettingsScreen';

beforeEach(resetDb);

describe('SettingsScreen · CSV', () => {
  it('exporta los registros como archivo CSV', async () => {
    const t = await createTracker({ ...emptyDraft(), name: 'Café' });
    await addEntry(t.id, { value: 2, date: '2026-01-01', time: '08:00', note: '' });
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:x');
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const { user } = renderWithProviders(<SettingsScreen />);
    await user.click(screen.getByRole('button', { name: 'Exportar CSV' }));
    await waitFor(() => expect(click).toHaveBeenCalled());
    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
    expect(await blob.text()).toContain('2026-01-01,08:00,Café,2,,');
    expect(await screen.findByText('Exportado: 1 registro')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('avisa si no hay nada que exportar', async () => {
    const { user } = renderWithProviders(<SettingsScreen />);
    await user.click(screen.getByRole('button', { name: 'Exportar CSV' }));
    expect(await screen.findByText('Todavía no hay registros para exportar')).toBeInTheDocument();
  });

  it('valida e importa un CSV mostrando errores por línea', async () => {
    const { user } = renderWithProviders(<SettingsScreen />);
    await user.click(screen.getByRole('button', { name: 'Importar CSV' }));
    const csv =
      'fecha,hora,rastreador,valor,unidad,nota\n2026-01-01,08:00,Café,2,tazas,\n2026-13-01,08:00,Café,1,tazas,\n';
    const file = new File([csv], 'datos.csv', { type: 'text/csv' });
    await user.upload(screen.getByLabelText('Archivo CSV'), file);

    expect(await screen.findByText(/registros listos para importar/)).toBeInTheDocument();
    expect(screen.getByText(/Línea 3:/)).toBeInTheDocument();
    expect(screen.getByText(/Café — Contador \(tazas\)/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Importar solo las filas válidas (1)' }));
    await waitFor(async () => expect(await db.entries.count()).toBe(1));
    expect(
      await screen.findByText('Importado: 1 registro y 1 rastreador nuevo'),
    ).toBeInTheDocument();
  });

  it('muestra errores fatales del archivo', async () => {
    const { user } = renderWithProviders(<SettingsScreen />);
    await user.click(screen.getByRole('button', { name: 'Importar CSV' }));
    await user.upload(
      screen.getByLabelText('Archivo CSV'),
      new File(['a,b\n1,2\n'], 'malo.csv', { type: 'text/csv' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(/Faltan columnas/);
    expect(screen.queryByRole('button', { name: /^Importar \d/ })).not.toBeInTheDocument();
  });
});
