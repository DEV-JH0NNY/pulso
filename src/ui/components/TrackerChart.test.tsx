import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { Tracker } from '../../domain/types';
import { TrackerChart } from './TrackerChart';

const tracker: Tracker = {
  id: 't',
  name: 'Estudio',
  icon: '📚',
  color: 'indigo',
  type: 'quantity',
  unit: 'h',
  defaultValue: 1,
  dailyGoal: 2,
  archived: false,
  order: 0,
  createdAt: 0,
  isSample: false,
};

const totals = new Map([
  ['2026-10-24', 3],
  ['2026-10-23', 1],
  ['2026-10-12', 2],
]);

describe('TrackerChart', () => {
  it('muestra la vista diaria con resumen y tabla accesible', () => {
    render(<TrackerChart tracker={tracker} totals={totals} todayDate="2026-10-24" />);
    expect(screen.getByText('Total del día')).toBeInTheDocument();
    const table = screen.getByRole('table', { name: /estudio/i });
    expect(within(table).getAllByRole('row')).toHaveLength(31); // encabezado + 30 días
    expect(within(table).getByText('3 h')).toBeInTheDocument();
    expect(screen.getByText('3 de 30')).toBeInTheDocument();
  });

  it('cambia a semanas y meses', async () => {
    const user = userEvent.setup();
    render(<TrackerChart tracker={tracker} totals={totals} todayDate="2026-10-24" />);
    await user.click(screen.getByRole('button', { name: 'Semana' }));
    expect(screen.getByRole('button', { name: 'Semana' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Total de la semana')).toBeInTheDocument();
    const table = screen.getByRole('table');
    expect(within(table).getByText('4 h')).toBeInTheDocument(); // semana del 19 de octubre
    await user.click(screen.getByRole('button', { name: 'Mes' }));
    expect(within(screen.getByRole('table')).getByText('6 h')).toBeInTheDocument();
  });
});
