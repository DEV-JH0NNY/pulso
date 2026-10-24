import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

let shouldThrow = true;
function Bomb() {
  if (shouldThrow) throw new Error('falla de prueba');
  return <p>Todo bien</p>;
}

describe('ErrorBoundary', () => {
  it('muestra un mensaje amable y permite reintentar', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal');
    expect(screen.getByText('falla de prueba')).toBeInTheDocument();
    shouldThrow = false;
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(screen.getByText('Todo bien')).toBeInTheDocument();
  });
});
