/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
) as {
  version: string;
};

// En GitHub Pages la app vive en /<repo>/. Se puede sobrescribir con BASE_PATH.
const base = process.env.BASE_PATH ?? '/pulso/';

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Pulso',
        short_name: 'Pulso',
        description: 'Registra tu vida como un dataset y descubre hallazgos sobre tus hábitos.',
        lang: 'es-CO',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        id: base,
        categories: ['productivity', 'health', 'lifestyle'],
        // Mantener presionado el ícono de la app instalada muestra estos atajos.
        shortcuts: [
          {
            name: 'Historial',
            url: `${base}#/historial`,
            icons: [{ src: 'pwa-192.png', sizes: '192x192' }],
          },
          {
            name: 'Estadísticas',
            url: `${base}#/estadisticas`,
            icons: [{ src: 'pwa-192.png', sizes: '192x192' }],
          },
          {
            name: 'Hallazgos',
            url: `${base}#/hallazgos`,
            icons: [{ src: 'pwa-192.png', sizes: '192x192' }],
          },
        ],
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    restoreMocks: true,
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
});
