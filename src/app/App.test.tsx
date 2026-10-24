import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from '../data/testUtils';
import { App } from './App';

beforeEach(resetDb);

describe('App', () => {
  it('muestra la navegación principal', async () => {
    render(<App />);
    expect(await screen.findByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
  });
});
