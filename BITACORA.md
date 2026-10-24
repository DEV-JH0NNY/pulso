# Bitácora de Pulso

## Resumen

> Actualiza esta sección cada 5 entradas y al final de la noche. Es lo primero que el dueño va a leer.

- **Estado actual:** Fase 1 completa (11 de 11). Empieza la Fase 2.
- **Lo más destacado hasta ahora:** Registro con un toque (toque largo para ajustar, «Deshacer»), vista de hoy con metas, historial editable, rachas y calendario anual, gráficos día/semana/mes, hallazgos con Pearson + valor p explicados en lenguaje simple, CSV de ida y vuelta con validación por línea, y datos de ejemplo realistas que se borran con un botón.
- **Decisiones importantes tomadas:** Fechas como texto local AAAA-MM-DD; ruteo por hash propio; gráficos, CSV y estadística sin librerías (todo probado); TypeScript 6 (typescript-eslint aún no soporta la 7); sin dependencias nuevas más allá del stack pedido.
- **Problemas conocidos o pendientes:** El despliegue a GitHub Pages solo corre en `main`: hay que fusionar la rama `claude/wonderful-rubin-wns5l9` y activar **Settings → Pages → Source: GitHub Actions**.
- **Siguiente paso:** Respaldo y restauración en JSON (Fase 2).

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

### [2026-10-24 13:28] Almacenamiento persistente y recordatorio de respaldo (Fase 2 · 2)

- **Qué hice:** Al abrir, la app pide `navigator.storage.persist()` (sin diálogo en Chrome para apps instaladas o usadas a menudo) y Ajustes informa si los datos están protegidos contra borrado por falta de espacio. En «Hoy» aparece una tarjeta «¿Hacemos un respaldo?» cuando hay registros reales de hace más de 7 días y nunca se exportó o pasaron 30 días desde la última exportación; «Ahora no» la aplaza 7 días.
- **Por qué:** Los datos viven solo en el dispositivo; el mayor riesgo para el dueño es perderlos. La regla está en el dominio (`shouldRemindBackup`) con pruebas. Los datos de ejemplo no cuentan para el recordatorio.
- **Archivos principales:** `src/domain/backupReminder.ts`, `src/data/storage.ts`, `src/ui/components/BackupReminder.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (152 pasando) · build ✅
- **Commit:** 52cd955
- **Siguiente:** Registrar en días anteriores desde Hoy.

### [2026-10-24 13:26] Respaldo y restauración en JSON (Fase 2 · 1)

- **Qué hice:** En Ajustes, «Descargar respaldo» genera `pulso-respaldo-AAAA-MM-DD.json` con todos los rastreadores (ícono, color, meta, orden, archivados, marca de ejemplo) y registros. «Restaurar respaldo» valida el archivo completo, muestra un resumen (fecha, cantidades) y deja elegir entre combinar (agregar/actualizar por id) o reemplazar todo. Se guarda la fecha de la última exportación para el recordatorio de respaldo.
- **Por qué:** El CSV es para análisis pero pierde configuración; el JSON permite cambiar de celular sin perder nada. Formato versionado (`format: 1`) para poder migrar en el futuro. La validación rechaza el archivo entero ante el primer error (con mensaje concreto) para no dejar la base a medias; la restauración corre en una transacción.
- **Archivos principales:** `src/domain/backup.ts`, `src/data/backupIO.ts`, `src/ui/components/RestoreBackupDialog.tsx`, `src/ui/screens/SettingsScreen.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (147 pasando) · build ✅
- **Commit:** f1ede16
- **Siguiente:** Almacenamiento persistente y recordatorio de respaldo.

### [2026-10-24 13:24] Diseño, tema y rendimiento (Fase 1 · tarea 11) — Fase 1 completa

- **Qué hice:** Selector de tema Sistema/Claro/Oscuro en Ajustes (también cambia el color de la barra del sistema en Android), sección «Acerca de» con versión y nota de privacidad, títulos de pestaña por pantalla («Hoy · Pulso»), nombre del rastreador como título del detalle, y carga diferida de todas las pantallas salvo «Hoy». Revisé contrastes: el verde de los botones principales pasó de emerald-600 (3,8:1, no cumple AA) a emerald-700 (5,5:1).
- **Por qué:** El diseño móvil, el modo oscuro automático y el formato es-CO ya venían desde las tareas anteriores; esta tarea cerró lo pendiente. Las pantallas diferidas pesan entre 2 y 13 kB cada una; la carga inicial queda en ~113 kB comprimidos (la mayor parte es React y Dexie).
- **Archivos principales:** `src/app/App.tsx`, `src/ui/components/ThemePicker.tsx`, `src/ui/theme.ts`, `src/ui/screens/SettingsScreen.tsx`, `vite.config.ts`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (140 pasando) · build ✅ · CI en GitHub ✅
- **Commit:** 41ca162
- **Siguiente:** Fase 2: respaldo y restauración en JSON.

### [2026-10-24 13:19] Datos de ejemplo (Fase 1 · tarea 10)

- **Qué hice:** Pantalla de bienvenida en la primera apertura con «Explorar con datos de ejemplo» o «Empezar desde cero». Los datos de ejemplo son 120 días de 6 rastreadores (Estudio, Sueño, Café, Ejercicio, Ánimo y Gastos en COP), todos con `isSample`, etiqueta «Ejemplo» en cada rastreador y un aviso fijo en todas las pantallas con botón «Borrar» (con confirmación). También se pueden cargar o borrar desde Ajustes. Borrar elimina los rastreadores de ejemplo y lo que el usuario haya registrado en ellos, sin tocar sus propios rastreadores.
- **Por qué:** Generador con semilla (mulberry32) para que sean reproducibles y probables. Las relaciones son intencionales y plausibles (semanas de parciales: más estudio y café, menos sueño; dormir bien y hacer ejercicio suben el ánimo) para que «Hallazgos» tenga contenido. De paso aparece una correlación espuria (sueño ↔ gastos, ambas suben el fin de semana) que ilustra por qué correlación no implica causalidad. Hay ~8 % de días sin registro por rastreador para que se parezca a datos reales. No se crean registros de hoy con hora futura. Cargar dos veces no duplica (`bulkPut` con ids fijos).
- **Archivos principales:** `src/domain/sampleData.ts`, `src/data/{sample,settings}.ts`, `src/ui/components/{WelcomeCard,SampleBanner,ClearSampleButton}.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (139 pasando) · build ✅
- **Commit:** 70ee284
- **Siguiente:** Diseño: tema claro/oscuro manual, es-CO y pulido móvil.

### [2026-10-24 13:14] Exportar e importar CSV (Fase 1 · tarea 9)

- **Qué hice:** Nueva pantalla «Ajustes» (reemplaza la pestaña «Rastreadores», que ahora vive dentro de Ajustes). Exportación a CSV en formato largo `fecha,hora,rastreador,valor,unidad,nota` (RFC 4180, CRLF, UTF-8, ordenado por fecha y hora). Importación con vista previa: registros válidos, rastreadores que se crearán (con el tipo inferido), duplicados omitidos y errores por número de línea con mensajes concretos («Fecha «2026-02-30» no es válida (usa AAAA-MM-DD)», «La unidad «min» no coincide con la de «Sueño» (h)»…). Se puede importar solo las filas válidas; todo se aplica en una transacción.
- **Por qué:** Valores con punto decimal y sin separador de miles para que pandas, SQL o Excel los lean sin sorpresas. La columna `unidad` usa «sí/no» y «1-5» para sí/no y escala, así una ida y vuelta conserva el tipo (probado: exportar → borrar → importar → exportar da el mismo archivo). Al importar se aceptan coma o punto y coma como separador (Excel en español usa «;»), coma o punto decimal, columnas en cualquier orden y horas tipo «7:05». Los rastreadores se asocian por nombre sin distinguir mayúsculas. Sin BOM: con BOM, pandas lee la primera columna como «﻿fecha»; se prefirió la limpieza para herramientas de datos. No se alteran notas que empiecen por «=» (inyección de fórmulas en Excel) para no modificar los datos del usuario; son sus propios datos.
- **Archivos principales:** `src/domain/{csv,csvData}.ts`, `src/data/csvIO.ts`, `src/ui/components/ImportCsvDialog.tsx`, `src/ui/screens/SettingsScreen.tsx`.
- **Dependencias nuevas:** ninguna (parser CSV propio de ~70 líneas en lugar de PapaParse).
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (131 pasando) · build ✅
- **Commit:** 2ec8d4c
- **Siguiente:** Datos de ejemplo.

### [2026-10-24 13:08] Hallazgos con correlaciones (Fase 1 · tarea 8)

- **Qué hice:** Pantalla «Hallazgos» que compara cada par de rastreadores activos con el coeficiente de Pearson sobre sus totales diarios, usando solo los días en que ambos tienen registros y solo si hay al menos 14. Cada hallazgo trae una frase simple («Los días en que registras más «Café», tiendes a registrar menos «Sueño».»), la fuerza (débil < 0,3 ≤ moderada < 0,5 ≤ fuerte), r, un diagrama de dispersión, y el valor p bilateral (prueba t) explicado en palabras. Advertencia permanente de que correlación no implica causalidad, progreso de los pares a los que les faltan días, aviso de pares donde un rastreador no varía y una sección «¿Cómo se calculan?».
- **Por qué:** El dueño valora análisis honestos: por eso el valor p, el diagrama con los datos reales y la advertencia sobre comparaciones múltiples. Las relaciones débiles o nulas quedan plegadas en vez de ocultas. La beta incompleta (para la distribución t) se implementó a mano (Lanczos + fracción continua de Numerical Recipes) y se validó contra valores de scipy, para no sumar una librería estadística pesada.
- **Archivos principales:** `src/domain/{stats,insights}.ts`, `src/ui/screens/InsightsScreen.tsx`, `src/ui/components/ScatterPlot.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (107 pasando) · build ✅
- **Commit:** dc808bc
- **Siguiente:** Exportar e importar CSV.

### [2026-10-24 13:08] Gráficos por rastreador (Fase 1 · tarea 7)

- **Qué hice:** Gráfico de barras en el detalle de cada rastreador con vistas de día (30 días), semana (12 semanas, lunes a domingo) y mes (12 meses), línea de meta en la vista diaria y tarjetas de promedio, máximo, total y periodos con datos. Incluye una tabla oculta con los mismos datos para lectores de pantalla.
- **Por qué:** Agregación honesta según el tipo: contador y cantidad suman, sí/no cuenta días con «Sí», escala promedia solo los días con datos (no rellena con ceros). El promedio se calcula sobre periodos con datos y lo dice en la etiqueta. SVG propio en lugar de Recharts/Chart.js: se necesitaba un solo tipo de gráfico y así se ahorran ~100 kB.
- **Archivos principales:** `src/domain/series.ts`, `src/ui/components/{BarChart,TrackerChart}.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (90 pasando) · build ✅
- **Commit:** f31c1c0
- **Siguiente:** Hallazgos (correlaciones).

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
