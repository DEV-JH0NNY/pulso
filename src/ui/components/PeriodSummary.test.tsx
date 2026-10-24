import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { Entry, Tracker } from '../../domain/types';
import { PeriodSummary } from './PeriodSummary';

const tracker: Tracker = {
  id: 'a',
  name: 'Agua',
  icon: '💧',
  color: 'sky',
  type: 'counter',
  unit: 'vasos',
  defaultValue: 1,
  dailyGoal: 2,
  archived: false,
  order: 0,
  createdAt: 0,
  isSample: false,
};
const e = (date: string, value: number): Entry => ({
  id: date + value,
  trackerId: 'a',
  value,
  date,
  time: '08:00',
  note: '',
  createdAt: 0,
  isSample: false,
});

describe('PeriodSummary', () => {
  it('compara la semana con la anterior y cambia a mes', async () => {
    const entries = [e('2026-10-19', 2), e('2026-10-21', 4), e('2026-10-12', 3)];
    const user = userEvent.setup();
    render(<PeriodSummary trackers={[tracker]} entries={entries} todayDate="2026-10-21" />);
    expect(screen.getByText('6 vasos')).toBeInTheDocument();
    expect(screen.getByText('3 vasos/día · ↑ 100 %')).toBeInTheDocument();
    expect(screen.getByText('Meta cumplida 2 de 3 días')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mes' }));
    expect(screen.getByRole('heading', { name: 'Este mes' })).toBeInTheDocument();
    expect(screen.getByText('9 vasos')).toBeInTheDocument();
    expect(screen.getByText(/sin datos para comparar/)).toBeInTheDocument();
  });
});
