import { defineConfig, devices } from '@playwright/test';

// Prueba de punta a punta sobre el build de producción servido con `vite preview`.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173/',
    ...devices['Pixel 7'],
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
  },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    env: { BASE_PATH: '/' },
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
