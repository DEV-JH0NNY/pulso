# Bitácora de Pulso

## Resumen

> Actualiza esta sección cada 5 entradas y al final de la noche. Es lo primero que el dueño va a leer.

- **Estado actual:** Fase 1 en curso, 6 de 11 tareas completas.
- **Lo más destacado hasta ahora:** Rastreadores personalizables, registro con un toque (toque largo para ajustar y «Deshacer»), vista de hoy con progreso frente a metas, historial editable, rachas y calendario anual estilo GitHub.
- **Decisiones importantes tomadas:** Fechas como texto local AAAA-MM-DD; ruteo por hash propio; gráficos en SVG propio sin librerías; TypeScript 6 (typescript-eslint aún no soporta la 7).
- **Problemas conocidos o pendientes:** El despliegue a GitHub Pages solo corre en `main`; hay que fusionar la rama y activar Pages con «GitHub Actions».
- **Siguiente paso:** Gráficos por rastreador.

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

### [2026-10-24 13:01] Rachas y mapa de calor anual (Fase 1 · tarea 6)

- **Qué hice:** Pantalla «Estadísticas» con la lista de rastreadores y su racha actual, y pantalla de detalle por rastreador con racha actual, mejor racha, días cumplidos, total de registros y un calendario de 53 semanas (lunes a domingo) estilo GitHub, con meses, días de la semana, leyenda y el detalle de cada día al pasar el dedo o el ratón.
- **Por qué:** Un día «cumplido» es el que alcanza la meta; sin meta, el que tiene registros (en sí/no, un «Sí»). La racha actual no se rompe por hoy porque el día aún no termina. La intensidad del calendario usa el progreso frente a la meta o, sin meta, el valor relativo al máximo del año. El calendario es un SVG propio (sin librerías) que se desplaza horizontalmente y arranca mostrando lo más reciente, porque 53 columnas no caben legibles en un celular.
- **Archivos principales:** `src/domain/{streaks,heatmap}.ts`, `src/ui/components/HeatmapChart.tsx`, `src/ui/screens/{StatsScreen,TrackerDetailScreen}.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (82 pasando) · build ✅
- **Commit:** ba492ea
- **Siguiente:** Gráficos por rastreador (día, semana y mes).

### [2026-10-24 13:01] Historial (Fase 1 · tarea 5)

- **Qué hice:** Pantalla de historial con los registros agrupados por día («Hoy», «Ayer», «Martes, 3 de marzo»), filtro por rastreador, carga de 30 días más bajo demanda, edición de valor/fecha/hora/nota y borrado con «Deshacer».
- **Por qué:** Paginar por días (no por cantidad de registros) mantiene los días completos y la consulta usa el índice `date` de IndexedDB. El borrado no pide confirmación porque se puede deshacer, lo que lo hace más rápido sin riesgo.
- **Archivos principales:** `src/domain/history.ts`, `src/ui/screens/HistoryScreen.tsx`, `src/ui/components/EntryRow.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (66 pasando) · build ✅
- **Commit:** 0a0d5be
- **Siguiente:** Rachas y mapa de calor anual.

### [2026-10-24 12:55] Vista de hoy con progreso (Fase 1 · tarea 4)

- **Qué hice:** Cada tarjeta muestra el progreso frente a la meta («2 / 8 h», «Hecho», «3,5/5 (meta 4/5)») con barra del color del rastreador y marca de meta cumplida. Arriba, un resumen con anillo: «1 de 2 metas cumplidas · 3 de 4 rastreadores con registros hoy» y celebración cuando se completa el día.
- **Por qué:** El resumen se calcula en el dominio (`summarizeDay`) para probarlo sin interfaz. En escala el progreso parte de 1 (el mínimo posible) para que la barra no engañe.
- **Archivos principales:** `src/domain/aggregate.ts`, `src/ui/trackerText.ts`, `src/ui/components/TrackerTile.tsx`, `src/ui/screens/TodayScreen.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (60 pasando) · build ✅
- **Commit:** 3c690e3
- **Siguiente:** Historial editable.

### [2026-10-24 12:55] Registro rápido (Fase 1 · tarea 3)

- **Qué hice:** Pantalla de hoy con una tarjeta por rastreador activo. Un toque registra el valor por defecto con la fecha y hora actuales; mantener presionado (500 ms) o el botón «+» abre un diálogo para ajustar valor, fecha, hora y nota. Cada registro muestra un aviso con «Deshacer». Animación sutil al registrar (desactivada con `prefers-reduced-motion`) y vibración corta cuando el dispositivo lo permite.
- **Por qué:** El toque normal se maneja con `click` y el largo con un temporizador de `pointer events`, así el registro rápido también funciona con teclado (Enter/Espacio) y el botón «+» es la alternativa accesible al toque largo. Un sí/no que ya está en «Sí» hoy no se vuelve a registrar (evita duplicados sin sentido). No se permiten fechas futuras. La fecha de «hoy» se recalcula cada minuto y al volver a la app, por si pasa la medianoche.
- **Archivos principales:** `src/ui/screens/TodayScreen.tsx`, `src/ui/components/{TrackerTile,EntryForm}.tsx`, `src/ui/hooks/{useLongPress,useToday}.ts`, `src/data/quickLog.ts`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (56 pasando) · build ✅
- **Commit:** 9181cff
- **Siguiente:** Progreso frente a la meta en la vista de hoy.

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
