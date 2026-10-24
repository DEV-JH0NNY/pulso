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

### [2026-10-24 12:49] Rastreadores personalizables (Fase 1 · tarea 2)

- **Qué hice:** Modelo de dominio (`Tracker`, `Entry`), utilidades de fechas locales como cadenas AAAA-MM-DD, formato es-CO (números, COP, fechas, horas), validación de borradores por tipo, agregación diaria (contador/cantidad suman, sí/no = algún sí, escala = promedio) y progreso frente a la meta. Base de datos Dexie (`trackers`, `entries`, `settings`) con repositorios validados. Armazón de la app: navegación por hash, encabezado, barra inferior, avisos con «Deshacer», `<dialog>` modal accesible, tema claro/oscuro sin destello. Pantalla de gestión: crear, editar, subir/bajar, archivar (con deshacer), restaurar y eliminar (con confirmación y borrado de registros).
- **Por qué:** Fechas como texto local para que agrupar por día no dependa de la zona horaria. Reordenar con botones subir/bajar en vez de arrastrar: funciona con teclado y lectores de pantalla y no necesita librerías; arrastrar queda como idea para la Fase 2. Ruteo por hash propio (≈50 líneas) en lugar de react-router: GitHub Pages no reescribe rutas y solo hay 7 pantallas. Los campos numéricos aceptan coma o punto decimal (en Colombia se escribe «7,5»). En sí/no la meta es «hacerlo»; en escala, un promedio mínimo.
- **Archivos principales:** `src/domain/{types,dates,format,trackers,aggregate,colors,ids}.ts`, `src/data/{db,trackers,entries}.ts`, `src/ui/components/{Layout,Modal,TrackerForm,ToastProvider}.tsx`, `src/ui/screens/ManageTrackersScreen.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (48 pasando) · build ✅
- **Commit:** 13df876
- **Siguiente:** Registro rápido desde la pantalla de hoy.

### [2026-10-24 12:41] Base del proyecto (Fase 1 · tarea 1)

- **Qué hice:** Estructura con Vite 8 + React 19 + TypeScript 6 estricto (`noUncheckedIndexedAccess` incluido), Tailwind 4 con modo oscuro por clase, PWA con `vite-plugin-pwa` (manifest, íconos generados, service worker con precache), Vitest + Testing Library + jsdom, ESLint (typescript-eslint estricto) + Prettier, workflows de CI (lint, formato, typecheck, pruebas, build en cada push) y de despliegue a GitHub Pages (en push a `main`), `Dockerfile` multi-etapa y `docker-compose.yml` con servicios `dev`, `prod` y `check`. Documentación inicial: `README.md`, `ROADMAP.md`, `COMO_EJECUTAR.md`.
- **Por qué:** TypeScript se fija en 6.0 porque `typescript-eslint` aún no soporta la 7. jsdom se fija en 29 porque la 30 exige Node ≥ 22.22.2 y el entorno tiene 22.22.0. La ruta base es `/pulso/` (configurable con `BASE_PATH`) para GitHub Pages. El despliegue solo corre en `main`: el dueño debe fusionar la rama y activar **Settings → Pages → Source: GitHub Actions**.
- **Archivos principales:** `package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `Dockerfile`, `docker-compose.yml`, `src/main.tsx`, `src/app/App.tsx`.
- **Dependencias nuevas:** react, react-dom (encargo); dexie y dexie-react-hooks (IndexedDB reactivo, encargo); vite, @vitejs/plugin-react, typescript, tailwindcss, @tailwindcss/vite, vite-plugin-pwa + workbox-window (dependencia par) — todas del stack pedido; vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom (pruebas); fake-indexeddb (probar Dexie sin navegador); eslint, @eslint/js, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, prettier (calidad).
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (1 pasando) · build ✅
- **Commit:** 1dac165
- **Siguiente:** Rastreadores personalizables (modelo de dominio, Dexie y pantalla de gestión).
