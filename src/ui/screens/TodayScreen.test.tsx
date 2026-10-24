import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../data/db';
import { ONBOARDING_DONE, setSetting } from '../../data/settings';
import { resetDb } from '../../data/testUtils';
import { createTracker } from '../../data/trackers';
import { addDays, today } from '../../domain/dates';
import { emptyDraft } from '../../domain/trackers';
import { renderWithProviders } from '../../test/render';
import { TodayScreen } from './TodayScreen';

beforeEach(resetDb);

const tile = (name: string) => screen.findByRole('button', { name: new RegExp(`^${name}:`) });

describe('TodayScreen', () => {
  it('la primera vez da la bienvenida y ofrece datos de ejemplo', async () => {
    const { user } = renderWithProviders(<TodayScreen />);
    expect(
      await screen.findByRole('heading', { name: 'Te damos la bienvenida a Pulso' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Explorar con datos de ejemplo' }));
    expect(
      await screen.findByRole('button', { name: /^Sueño:/ }, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Ejemplo').length).toBeGreaterThan(0);
  });

  it('después de la bienvenida invita a crear un rastreador', async () => {
    await setSetting(ONBOARDING_DONE, true);
    renderWithProviders(<TodayScreen />);
    expect(await screen.findByRole('link', { name: 'Crear rastreador' })).toBeInTheDocument();
  });

  it('un toque registra el valor por defecto y se puede deshacer', async () => {
    await createTracker({ ...emptyDraft(), name: 'Café', unit: 'tazas' });
    const { user } = renderWithProviders(<TodayScreen />);
    await user.click(await tile('Café'));
    await waitFor(async () => expect(await db.entries.count()).toBe(1));
    expect(await screen.findByText('1 tazas')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Deshacer' }));
    await waitFor(async () => expect(await db.entries.count()).toBe(0));
    expect(await screen.findByText('Sin registros')).toBeInTheDocument();
  });

  it('el botón + permite ajustar valor y nota', async () => {
    await createTracker({ ...emptyDraft(), name: 'Sueño', type: 'quantity', unit: 'h' });
    const { user } = renderWithProviders(<TodayScreen />);
    await user.click(await screen.findByRole('button', { name: 'Registrar Sueño con detalles' }));
    const dialog = screen.getByRole('dialog');
    const value = within(dialog).getByLabelText('Valor (h)');
    await user.clear(value);
    await user.type(value, '7,5');
    await user.type(within(dialog).getByLabelText(/nota/i), 'Dormí bien');
    await user.click(within(dialog).getByRole('button', { name: 'Registrar' }));
    await waitFor(async () => {
      const [e] = await db.entries.toArray();
      expect(e).toMatchObject({ value: 7.5, note: 'Dormí bien' });
    });
  });

  it('rechaza fechas futuras en el registro detallado', async () => {
    await createTracker({ ...emptyDraft(), name: 'Café' });
    const { user } = renderWithProviders(<TodayScreen />);
    await user.click(await screen.findByRole('button', { name: 'Registrar Café con detalles' }));
    const date = screen.getByLabelText('Fecha');
    fireEvent.change(date, { target: { value: '2999-01-01' } });
    await user.click(screen.getByRole('button', { name: 'Registrar' }));
    expect(screen.getByText('La fecha no puede ser futura.')).toBeInTheDocument();
    expect(await db.entries.count()).toBe(0);
  });

  it('un toque largo abre el registro detallado', async () => {
    await createTracker({ ...emptyDraft(), name: 'Ánimo', type: 'scale', defaultValue: 3 });
    renderWithProviders(<TodayScreen />);
    const button = await tile('Ánimo');
    fireEvent.pointerDown(button, { button: 0, clientX: 0, clientY: 0 });
    await act(() => new Promise((r) => setTimeout(r, 600)));
    fireEvent.pointerUp(button);
    fireEvent.click(button);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(await db.entries.count()).toBe(0);
  });

  it('un sí/no ya marcado no se duplica', async () => {
    await createTracker({ ...emptyDraft(), name: 'Ejercicio', type: 'boolean' });
    const { user } = renderWithProviders(<TodayScreen />);
    await user.click(await tile('Ejercicio'));
    await screen.findByText('Hecho');
    await user.click(await tile('Ejercicio'));
    expect(await screen.findByText('«Ejercicio» ya está marcado hoy')).toBeInTheDocument();
    expect(await db.entries.count()).toBe(1);
  });
});

describe('TodayScreen · progreso', () => {
  it('muestra el progreso frente a la meta y el resumen', async () => {
    await createTracker({ ...emptyDraft(), name: 'Agua', unit: 'vasos', dailyGoal: 2 });
    await createTracker({ ...emptyDraft(), name: 'Leer', type: 'boolean', dailyGoal: 1 });
    const { user } = renderWithProviders(<TodayScreen />);
    expect(await screen.findByText('0 de 2 metas cumplidas')).toBeInTheDocument();
    expect(screen.getByText('0 / 2 vasos')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();

    await user.click(await tile('Agua'));
    expect(await screen.findByText('1 / 2 vasos')).toBeInTheDocument();
    await user.click(await tile('Agua'));
    expect(await screen.findByText('1 de 2 metas cumplidas')).toBeInTheDocument();
    expect(await tile('Agua')).toHaveAccessibleName(/meta cumplida/);

    await user.click(await tile('Leer'));
    expect(await screen.findByText(/día completo/i)).toBeInTheDocument();
  });
});

describe('TodayScreen · otros días', () => {
  it('permite registrar en el día anterior y volver a hoy', async () => {
    await createTracker({ ...emptyDraft(), name: 'Café' });
    const { user } = renderWithProviders(<TodayScreen />);
    await user.click(await screen.findByRole('button', { name: 'Día anterior' }));
    expect(screen.getByText('Ayer')).toBeInTheDocument();
    await user.click(await tile('Café'));
    await waitFor(async () => {
      const [e] = await db.entries.toArray();
      expect(e?.date).toBe(addDays(today(), -1));
    });
    await user.click(screen.getByRole('button', { name: 'Volver a hoy' }));
    expect(screen.getByRole('button', { name: 'Día siguiente' })).toBeDisabled();
    expect(await screen.findByText('Sin registros')).toBeInTheDocument();
  });
});
