import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { loadSampleData } from '../../data/sample';
import { resetDb } from '../../data/testUtils';
import { renderWithProviders } from '../../test/render';
import { YearReviewScreen } from './YearReviewScreen';

beforeEach(resetDb);

describe('YearReviewScreen', () => {
  it('sin datos lo dice', async () => {
    renderWithProviders(<YearReviewScreen />);
    expect(await screen.findByText(/todavía no hay registros/i)).toBeInTheDocument();
  });

  it('resume el año con los datos de ejemplo', async () => {
    await loadSampleData();
    renderWithProviders(<YearReviewScreen />);
    expect(await screen.findByText(/registraste/)).toBeInTheDocument();
    expect(screen.getByText('Café')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /registros por mes/i })).toBeInTheDocument();
  });
});
