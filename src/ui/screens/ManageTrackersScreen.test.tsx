import { screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../data/db';
import { resetDb } from '../../data/testUtils';
import { createTracker } from '../../data/trackers';
import { emptyDraft } from '../../domain/trackers';
import { renderWithProviders } from '../../test/render';
import { ManageTrackersScreen } from './ManageTrackersScreen';

beforeEach(resetDb);

describe('ManageTrackersScreen', () => {
  it('crea un rastreador de cantidad con meta', async () => {
    const { user } = renderWithProviders(<ManageTrackersScreen />);
    await user.click(await screen.findByRole('button', { name: /nuevo/i }));
    const dialog = screen.getByRole('dialog', { name: 'Nuevo rastreador' });
    await user.type(within(dialog).getByLabelText('Nombre'), 'Sueño');
    await user.click(within(dialog).getByLabelText(/cantidad con unidad/i));
    const unit = within(dialog).getByLabelText(/unidad/i, { selector: 'input[list]' });
    await user.clear(unit);
    await user.type(unit, 'h');
    await user.click(within(dialog).getByLabelText('Tener meta diaria'));
    await user.type(within(dialog).getByLabelText('Meta diaria'), '7,5');
    await user.click(within(dialog).getByRole('button', { name: 'Crear' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('Sueño')).toBeInTheDocument();
    const [saved] = await db.trackers.toArray();
    expect(saved).toMatchObject({ name: 'Sueño', type: 'quantity', unit: 'h', dailyGoal: 7.5 });
  });

  it('muestra errores de validación', async () => {
    const { user } = renderWithProviders(<ManageTrackersScreen />);
    await user.click(await screen.findByRole('button', { name: /nuevo/i }));
    await user.click(screen.getByRole('button', { name: 'Crear' }));
    expect(screen.getByText('Escribe un nombre.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('aria-invalid', 'true');
    expect(await db.trackers.count()).toBe(0);
  });

  it('edita, reordena, archiva y restaura', async () => {
    await createTracker({ ...emptyDraft(), name: 'Café' });
    await createTracker({ ...emptyDraft(), name: 'Agua' });
    const { user } = renderWithProviders(<ManageTrackersScreen />);

    await user.click(await screen.findByRole('button', { name: 'Subir Agua' }));
    await waitFor(async () => {
      const names = (await db.trackers.orderBy('order').toArray()).map((t) => t.name);
      expect(names).toEqual(['Agua', 'Café']);
    });

    await user.click(screen.getByRole('button', { name: 'Editar Café' }));
    const name = screen.getByLabelText('Nombre');
    await user.clear(name);
    await user.type(name, 'Tinto');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Tinto')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Archivar Tinto' }));
    expect(await screen.findByText(/archivados \(1\)/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Restaurar Tinto' }));
    await waitFor(() => expect(screen.queryByText(/archivados/i)).not.toBeInTheDocument());
  });

  it('elimina un archivado tras confirmar', async () => {
    const t = await createTracker({ ...emptyDraft(), name: 'Viejo' });
    await db.trackers.update(t.id, { archived: true });
    const { user } = renderWithProviders(<ManageTrackersScreen />);
    await user.click(await screen.findByRole('button', { name: 'Eliminar Viejo' }));
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    await waitFor(async () => expect(await db.trackers.count()).toBe(0));
  });
});

describe('ManageTrackersScreen · plantillas', () => {
  it('crea un rastreador desde una plantilla y oculta las que ya existen', async () => {
    await createTracker({ ...emptyDraft(), name: 'Café' });
    const { user } = renderWithProviders(<ManageTrackersScreen />);
    await user.click(await screen.findByRole('button', { name: /nuevo/i }));
    const dialog = screen.getByRole('dialog', { name: 'Nuevo rastreador' });
    expect(within(dialog).queryByRole('button', { name: /café/i })).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: /agua/i }));
    expect(within(dialog).getByLabelText('Nombre')).toHaveValue('Agua');
    await user.click(within(dialog).getByRole('button', { name: 'Crear' }));
    await waitFor(async () => {
      const agua = (await db.trackers.toArray()).find((t) => t.name === 'Agua');
      expect(agua).toMatchObject({ unit: 'vasos', dailyGoal: 8, icon: '💧' });
    });
  });
});
