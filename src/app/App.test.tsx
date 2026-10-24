import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { loadSampleData } from '../data/sample';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from '../data/testUtils';
import { App } from './App';

beforeEach(resetDb);

describe('App', () => {
  it('muestra la navegación principal', async () => {
    render(<App />);
    expect(await screen.findByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
  });

  it('muestra el aviso de datos de ejemplo y permite borrarlos', async () => {
    await loadSampleData();
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByText(/estás viendo datos de ejemplo/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Borrar datos de ejemplo' }));
    const dialog = screen.getByRole('dialog', { name: 'Borrar datos de ejemplo' });
    await user.click(within(dialog).getByRole('button', { name: 'Borrar' }));
    await waitFor(() =>
      expect(screen.queryByText(/estás viendo datos de ejemplo/i)).not.toBeInTheDocument(),
    );
  });
});
