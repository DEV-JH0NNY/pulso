import { expect, test } from '@playwright/test';

test('registrar, recargar y seguir viendo el dato (también sin conexión)', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Empezar desde cero' }).click();

  // Crear un rastreador desde una plantilla.
  await page.getByRole('button', { name: /nuevo/i }).click();
  await page.getByRole('button', { name: /agua/i }).click();
  await page.getByRole('button', { name: 'Crear' }).click();
  await expect(page.getByText('Agua', { exact: true })).toBeVisible();

  // Registrar dos vasos desde «Hoy».
  await page.goto('/#/');
  const tile = page.getByRole('button', { name: /^Agua:/ });
  await tile.click();
  await tile.click();
  await expect(page.getByText('2 / 8 vasos')).toBeVisible();

  // Los datos persisten tras recargar (IndexedDB).
  await page.reload();
  await expect(page.getByText('2 / 8 vasos')).toBeVisible();

  // Con el service worker activo, la app abre sin conexión.
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('2 / 8 vasos')).toBeVisible();
  await page.getByRole('link', { name: 'Historial' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Historial' })).toBeVisible();
  await context.setOffline(false);
});

test('los datos de ejemplo producen hallazgos', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explorar con datos de ejemplo' }).click();
  await page.getByRole('link', { name: 'Hallazgos' }).click();
  await expect(page.getByText(/correlación no implica causalidad/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /relaciones encontradas/i })).toBeVisible();
});
