import { screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../data/db';
import { addEntry } from '../../data/entries';
import { resetDb } from '../../data/testUtils';
import { createTracker } from '../../data/trackers';
import { today } from '../../domain/dates';
import { emptyDraft } from '../../domain/trackers';
import { renderWithProviders } from '../../test/render';
import { StatsScreen } from '../screens/StatsScreen';

beforeEach(resetDb);

describe('métricas derivadas en Estadísticas', () => {
  it('crea una métrica y muestra su promedio', async () => {
    const gastos = await createTracker({
      ...emptyDraft(),
      name: 'Gastos',
      type: 'quantity',
      unit: 'COP',
    });
    const estudio = await createTracker({
      ...emptyDraft(),
      name: 'Estudio',
      type: 'quantity',
      unit: 'h',
    });
    await addEntry(gastos.id, { value: 30000, date: today(), time: '12:00', note: '' });
    await addEntry(estudio.id, { value: 3, date: today(), time: '15:00', note: '' });

    const { user } = renderWithProviders(<StatsScreen />);
    await user.click(await screen.findByRole('button', { name: /nueva/i }));
    const dialog = screen.getByRole('dialog', { name: 'Nueva métrica derivada' });
    await user.type(within(dialog).getByLabelText('Nombre'), 'Gasto por hora');
    await user.selectOptions(within(dialog).getByLabelText('Rastreador A'), gastos.id);
    await user.selectOptions(within(dialog).getByLabelText('Rastreador B'), estudio.id);
    await user.type(within(dialog).getByLabelText(/unidad del resultado/i), 'COP/h');
    await user.click(within(dialog).getByRole('button', { name: 'Crear' }));

    expect(await screen.findByText('Gasto por hora')).toBeInTheDocument();
    expect(screen.getByText('Gastos ÷ Estudio, por día')).toBeInTheDocument();
    // Con un solo día, promedio y mediana coinciden.
    expect(screen.getAllByText('10.000 COP/h', { selector: 'strong' })).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Eliminar Gasto por hora' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }));
    await waitFor(async () => expect(await db.derived.count()).toBe(0));
  });
});
