# Bitácora de Pulso

## Resumen

> Actualiza esta sección cada 5 entradas y al final de la noche. Es lo primero que el dueño va a leer.

- **Estado actual:** (por ejemplo: Fase 1 en curso, 4 de 11 tareas completas)
- **Lo más destacado hasta ahora:**
- **Decisiones importantes tomadas:**
- **Problemas conocidos o pendientes:**
- **Siguiente paso:**

---

## Entradas

<!--
Agrega una entrada por cada tarea completada, de la más reciente a la más antigua (la nueva va arriba).
Usa exactamente este formato:

### [AAAA-MM-DD HH:MM] Título corto de la tarea

- **Qué hice:**
- **Por qué:** (decisión tomada y alternativas descartadas, si aplica)
- **Archivos principales:**
- **Dependencias nuevas:** (nombre y justificación, o "ninguna")
- **Verificación:** lint ✅/❌ · typecheck ✅/❌ · pruebas ✅/❌ (n pasando) · build ✅/❌
- **Commit:** (hash corto)
- **Siguiente:**
-->

### [2026-10-24 12:41] Base del proyecto (Fase 1 · tarea 1)

- **Qué hice:** Estructura con Vite 8 + React 19 + TypeScript 6 estricto (`noUncheckedIndexedAccess` incluido), Tailwind 4 con modo oscuro por clase, PWA con `vite-plugin-pwa` (manifest, íconos generados, service worker con precache), Vitest + Testing Library + jsdom, ESLint (typescript-eslint estricto) + Prettier, workflows de CI (lint, formato, typecheck, pruebas, build en cada push) y de despliegue a GitHub Pages (en push a `main`), `Dockerfile` multi-etapa y `docker-compose.yml` con servicios `dev`, `prod` y `check`. Documentación inicial: `README.md`, `ROADMAP.md`, `COMO_EJECUTAR.md`.
- **Por qué:** TypeScript se fija en 6.0 porque `typescript-eslint` aún no soporta la 7. jsdom se fija en 29 porque la 30 exige Node ≥ 22.22.2 y el entorno tiene 22.22.0. La ruta base es `/pulso/` (configurable con `BASE_PATH`) para GitHub Pages. El despliegue solo corre en `main`: el dueño debe fusionar la rama y activar **Settings → Pages → Source: GitHub Actions**.
- **Archivos principales:** `package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `Dockerfile`, `docker-compose.yml`, `src/main.tsx`, `src/app/App.tsx`.
- **Dependencias nuevas:** react, react-dom (encargo); dexie y dexie-react-hooks (IndexedDB reactivo, encargo); vite, @vitejs/plugin-react, typescript, tailwindcss, @tailwindcss/vite, vite-plugin-pwa + workbox-window (dependencia par) — todas del stack pedido; vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom (pruebas); fake-indexeddb (probar Dexie sin navegador); eslint, @eslint/js, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, prettier (calidad).
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (1 pasando) · build ✅
- **Commit:** 1dac165
- **Siguiente:** Rastreadores personalizables (modelo de dominio, Dexie y pantalla de gestión).
