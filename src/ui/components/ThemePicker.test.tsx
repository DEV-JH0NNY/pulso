import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemePicker } from './ThemePicker';

afterEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

describe('ThemePicker', () => {
  it('aplica y recuerda el tema elegido', async () => {
    const user = userEvent.setup();
    render(<ThemePicker />);
    expect(screen.getByLabelText('Sistema')).toBeChecked();
    await user.click(screen.getByLabelText('Oscuro'));
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('pulso-theme')).toBe('dark');
    await user.click(screen.getByLabelText('Claro'));
    expect(document.documentElement).not.toHaveClass('dark');
    await user.click(screen.getByLabelText('Sistema'));
    expect(localStorage.getItem('pulso-theme')).toBeNull();
  });
});
