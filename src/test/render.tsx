import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { ToastProvider } from '../ui/components/ToastProvider';

/** Renderiza con los proveedores de la app y devuelve un userEvent listo. */
export function renderWithProviders(ui: ReactElement) {
  const user = userEvent.setup();
  return { user, ...render(<ToastProvider>{ui}</ToastProvider>) };
}
