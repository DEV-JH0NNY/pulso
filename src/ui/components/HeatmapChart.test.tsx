import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Tracker } from '../../domain/types';
import { HeatmapChart } from './HeatmapChart';

const tracker: Tracker = {
  id: 't',
  name: 'Agua',
  icon: '💧',
  color: 'sky',
  type: 'counter',
  unit: 'vasos',
  defaultValue: 1,
  dailyGoal: null,
  archived: false,
  order: 0,
  createdAt: 0,
  isSample: false,
};

describe('HeatmapChart', () => {
  it('muestra el día elegido con clic o flechas', () => {
    const totals = new Map([
      ['2026-10-24', 3],
      ['2026-10-17', 5],
    ]);
    render(<HeatmapChart tracker={tracker} totals={totals} todayDate="2026-10-24" />);
    expect(screen.getByText(/sábado, 24 de octubre de 2026:/i).parentElement).toHaveTextContent(
      '3 vasos',
    );
    const grid = screen.getByRole('group', { name: /calendario del último año/i });
    fireEvent.keyDown(grid, { key: 'ArrowLeft' });
    expect(screen.getByText(/17 de octubre/i).parentElement).toHaveTextContent('5 vasos');
    fireEvent.keyDown(grid, { key: 'ArrowUp' });
    expect(screen.getByText(/16 de octubre/i).parentElement).toHaveTextContent('sin registros');
    // No se puede ir al futuro.
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(screen.getByText(/23 de octubre/i)).toBeInTheDocument();
  });
});
