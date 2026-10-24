# Bitácora de Pulso

## Resumen

> Actualiza esta sección cada 5 entradas y al final de la noche. Es lo primero que el dueño va a leer.

- **Estado actual:** Fase 1 completa (11/11). Fase 2 en marcha: 21 mejoras hechas en tres rondas de backlog. ~205 pruebas, CI en verde en todos los commits.
- **Lo más destacado hasta ahora:** Registro con un toque (también en días anteriores, con celebración al cumplir), metas diarias «al menos» / «como máximo» y metas semanales, historial con búsqueda, rachas, calendario anual tocable, gráficos, resumen semana/mes justo, hallazgos con Pearson + valor p (mismo día y día siguiente), CSV largo/ancho, respaldo JSON con recordatorio, plantillas, reordenar arrastrando, PWA con aviso de actualización y accesos directos, y pruebas de accesibilidad con axe.
- **Decisiones importantes tomadas:** Fechas como texto local AAAA-MM-DD; ruteo por hash propio; gráficos, CSV y estadística sin librerías (todo probado); campos nuevos opcionales (`goalDirection`, `weeklyTarget`) para no migrar la base; TypeScript 6 (typescript-eslint aún no soporta la 7). Única dependencia añadida fuera del stack: `axe-core` (solo desarrollo).
- **Problemas conocidos o pendientes:** El despliegue a GitHub Pages solo corre en `main`: hay que fusionar la rama `claude/wonderful-rubin-wns5l9` y activar **Settings → Pages → Source: GitHub Actions**. Las notificaciones del recordatorio solo llegan con la app abierta (límite de las PWA sin servidor).
- **Siguiente paso:** Rastreadores derivados (fórmulas).

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

### [2026-10-24 14:34] Pantalla de error amigable (Fase 2 · 23)

- **Qué hice:** Un «error boundary» envuelve cada pantalla: si algo falla al dibujarla, en lugar de una página en blanco aparece «Algo salió mal en esta pantalla», el mensaje técnico, y botones «Reintentar», «Descargar respaldo» y «Recargar la app». La navegación inferior sigue funcionando y cambiar de pantalla reinicia el error.
- **Por qué:** Una PWA sin conexión no tiene a quién reportar; lo importante es que el usuario no sienta que perdió sus datos y pueda respaldarlos. Sin telemetría: el detalle solo va a la consola del dispositivo.
- **Archivos principales:** `src/ui/components/ErrorBoundary.tsx`, `src/app/App.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (217 pasando) · build ✅
- **Commit:** fae82c2
- **Siguiente:** Prueba de rendimiento con 3 años de datos.

### [2026-10-24 14:30] Métricas derivadas (Fase 2 · 22)

- **Qué hice:** Sección «Métricas derivadas» en Estadísticas: se crea una fórmula diaria entre dos rastreadores (A ÷ B, A − B, A + B, A × B) con nombre y unidad, por ejemplo «Gasto por hora de estudio = Gastos ÷ Estudio (COP/h)». Cada métrica muestra un gráfico de 30 días, el promedio y la mediana. Se incluyen en el respaldo JSON y se borran en cascada si se elimina uno de sus rastreadores (o los datos de ejemplo).
- **Por qué:** Lo sugería el encargo y encaja con un usuario de datos. Es una entidad aparte (no un «tipo» de rastreador) para no tocar el registro rápido ni las rachas. Solo usa días con datos en ambos y omite B = 0 en divisiones (sin inventar valores). Agregué la mediana porque en cocientes un día con B pequeño dispara el promedio (se vio con los datos de ejemplo). Base de datos versión 2: solo agrega la tabla `derived`; Dexie actualiza solo y los datos existentes no cambian. El campo `derived` del respaldo es opcional para seguir aceptando respaldos anteriores.
- **Archivos principales:** `src/domain/derived.ts`, `src/data/{db,derived,trackers,sample,backupIO}.ts`, `src/domain/{backup,stats}.ts`, `src/ui/components/DerivedMetrics.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (215 pasando) · build ✅
- **Commit:** 49fac50
- **Siguiente:** Backlog vacío: nueva revisión crítica.

### [2026-10-24 14:24] Celebración al cumplir la meta (Fase 2 · 21)

- **Qué hice:** Cuando un toque hace que se cumpla la meta del día, la tarjeta emite un anillo de su color que se expande y desvanece (700 ms), el celular vibra con un patrón doble y el aviso dice «🎉 ¡Meta de «Agua» cumplida!» (con «Deshacer»).
- **Por qué:** Refuerza el hábito sin ser invasivo. Solo se celebra el momento de pasar de «no cumplida» a «cumplida» (`reachesGoal` en el dominio) y nunca en metas de límite (que se «cumplen» sin hacer nada). Con «reducir movimiento» el anillo no se muestra. Corregí un aviso del linter de React (no usar `Date.now` en el render) usando un contador.
- **Archivos principales:** `src/domain/aggregate.ts`, `src/ui/components/TrackerTile.tsx`, `src/ui/screens/TodayScreen.tsx`, `src/index.css`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (205 pasando) · build ✅
- **Commit:** c0e4591
- **Siguiente:** Rastreadores derivados.

### [2026-10-24 14:22] Accesos directos de la app instalada (Fase 2 · 20)

- **Qué hice:** El manifest declara atajos (`shortcuts`): en Android, mantener presionado el ícono de Pulso muestra «Historial», «Estadísticas» y «Hallazgos». También se añadieron `id` (identidad estable de la PWA) y `categories`. Verifiqué el manifest generado en `dist/`.
- **Por qué:** Es gratis en peso y acerca las pantallas más consultadas. «Hoy» no necesita atajo porque es la pantalla de inicio. Las rutas por hash funcionan sin servidor.
- **Archivos principales:** `vite.config.ts`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (203 pasando) · build ✅
- **Commit:** 5604062
- **Siguiente:** Celebración sutil al cumplir la meta del día.

### [2026-10-24 14:21] Buscar en el historial (Fase 2 · 19)

- **Qué hice:** Campo «Buscar» en Historial que filtra por texto de la nota o nombre del rastreador, sin distinguir mayúsculas ni tildes («cumpleanos» encuentra «Cumpleaños de Ana»). Mientras se busca se recorre todo el historial, no solo los últimos 30 días; se combina con el filtro por rastreador.
- **Por qué:** Las notas solo sirven si se pueden encontrar después («¿cuándo fue la salida con amigos?»). La normalización vive en el dominio con pruebas.
- **Archivos principales:** `src/domain/history.ts`, `src/ui/screens/HistoryScreen.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (203 pasando) · build ✅
- **Commit:** 9cea04a
- **Siguiente:** Accesos directos de la app instalada.

### [2026-10-24 14:19] Metas semanales (Fase 2 · 18)

- **Qué hice:** Cualquier rastreador puede tener «meta semanal» de 1 a 7 días. En «Hoy» cada tarjeta muestra «Semana: 2/3 días» (en verde con ✓ al cumplirla) y el detalle añade «Racha semanal» (semanas seguidas cumpliendo). La plantilla y el ejemplo de Ejercicio pasan a «3 días por semana».
- **Por qué:** Hábitos como el ejercicio no son diarios; con meta diaria la racha se rompía siempre. Un día cuenta si cumple la meta diaria (o, sin ella, si tiene registros / un «Sí»), igual que en las rachas. La semana en curso suma a la racha si ya se cumplió pero no la rompe si aún faltan días. Campo opcional `weeklyTarget`, sin migración. «Hoy» ahora carga la semana del día mostrado.
- **Archivos principales:** `src/domain/weekly.ts`, `src/domain/{types,trackers,backup}.ts`, `src/ui/components/{TrackerForm,TrackerTile}.tsx`, `src/ui/screens/{TodayScreen,TrackerDetailScreen}.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (201 pasando) · build ✅
- **Commit:** 756b887
- **Siguiente:** Buscar en el historial.

### [2026-10-24 14:16] Documentación al día con capturas (Fase 2 · 17)

- **Qué hice:** Capturas reales generadas con Playwright (Hoy y detalle en claro, Hallazgos e Historial en oscuro) en `docs/capturas/`. README reescrito con todas las funciones actuales agrupadas. `COMO_EJECUTAR.md`: estructura de carpetas detallada con la regla dominio/datos/UI, cómo pasar datos a otro celular y nuevos problemas comunes (acentos en Excel, notificaciones, cambio de celular).
- **Por qué:** Es lo primero que el dueño va a ver en GitHub; la documentación había quedado atrás de la Fase 2.
- **Archivos principales:** `README.md`, `COMO_EJECUTAR.md`, `docs/capturas/*.png`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** formato ✅ (sin cambios de código)
- **Commit:** 9648013
- **Siguiente:** Metas semanales.

### [2026-10-24 14:14] Reordenar arrastrando (Fase 2 · 16)

- **Qué hice:** Cada rastreador activo tiene una manija (⋮⋮) para arrastrarlo; la lista se reordena en vivo y se guarda al soltar. Los botones subir/bajar siguen ahí como alternativa accesible con teclado y lector de pantalla (la manija se oculta a tecnologías de asistencia para no duplicar). Además subí a 3 s la espera de `findBy*` en las pruebas tras ver un fallo intermitente por tiempos bajo carga (9 corridas seguidas en verde después).
- **Por qué:** Arrastrar es lo que se espera en un celular. Implementado con pointer events y `setPointerCapture` (ratón, dedo y lápiz) en ~50 líneas, sin librerías de drag and drop; `touch-action: none` solo en la manija para no bloquear el desplazamiento de la página. La lógica de posiciones está en el dominio con pruebas.
- **Archivos principales:** `src/domain/reorder.ts`, `src/ui/hooks/useDragReorder.ts`, `src/ui/screens/ManageTrackersScreen.tsx`, `src/test/setup.ts`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (195 pasando) · build ✅
- **Commit:** 935bee5
- **Siguiente:** Backlog vacío otra vez: nueva revisión crítica.

### [2026-10-24 14:07] Detalle del rastreador más útil (Fase 2 · 15)

- **Qué hice:** El detalle de cada rastreador tiene un botón «Editar» (mismo formulario que en Rastreadores) y una sección «Registros recientes» con los últimos 10 (y botón para ver todos), cada uno editable o borrable con deshacer.
- **Por qué:** Al revisar las estadísticas de un rastreador es natural querer corregir un registro raro o ajustar la meta sin cambiar de pantalla. Para no duplicar código extraje `EntryEditDialog` (ahora lo usan Historial y el detalle) y `draftFromTracker` al dominio.
- **Archivos principales:** `src/ui/screens/TrackerDetailScreen.tsx`, `src/ui/components/EntryEditDialog.tsx`, `src/ui/screens/HistoryScreen.tsx`, `src/domain/trackers.ts`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (192 pasando) · build ✅
- **Commit:** 68e967d
- **Siguiente:** Reordenar arrastrando.

### [2026-10-24 14:04] Calendario anual interactivo (Fase 2 · 14)

- **Qué hice:** Tocar un día del calendario anual lo resalta y muestra debajo «Sábado, 17 de octubre de 2026: 5 vasos». Con teclado, al enfocar el calendario las flechas recorren los días (izquierda/derecha = semana, arriba/abajo = día), sin salir del año ni ir al futuro; el texto se anuncia a lectores de pantalla.
- **Por qué:** Los `<title>` del SVG solo funcionan al pasar el ratón; en el celular no había forma de ver el valor de un día. Empieza seleccionado hoy.
- **Archivos principales:** `src/ui/components/HeatmapChart.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (191 pasando) · build ✅
- **Commit:** 4125724
- **Siguiente:** Detalle del rastreador: editarlo y ver sus registros recientes.

### [2026-10-24 14:01] Plurales correctos en unidades (Fase 2 · 13)

- **Qué hice:** Cuando el valor es 1, la unidad se muestra en singular: «1 taza», «1 vaso», «1 vez», «1 mes». Abreviaturas cortas («h», «km», «min») no cambian.
- **Por qué:** Detalle de pulido que se nota en cada toque. Regla simple para el español (-ces → -z; -ses/-res/-les/-nes/-des → quitar «es»; resto → quitar «s») en lugar de pedir al usuario el singular y el plural.
- **Archivos principales:** `src/domain/format.ts`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (190 pasando) · build ✅
- **Commit:** 9c245fa
- **Siguiente:** Tocar un día del calendario anual para ver su valor.

### [2026-10-24 13:58] Pruebas automáticas de accesibilidad (Fase 2 · 12)

- **Qué hice:** Prueba que carga los datos de ejemplo y corre axe-core sobre Hoy, Historial, Estadísticas, detalle de rastreador, Hallazgos, Ajustes, Rastreadores y el diálogo de nuevo rastreador. Encontró un problema real: el aviso «Estás viendo datos de ejemplo» estaba fuera de cualquier región (landmark); ahora es un `<aside>` con nombre.
- **Por qué:** La accesibilidad es requisito del proyecto; así cualquier regresión rompe la CI. El contraste se desactiva en axe porque jsdom no calcula estilos; se revisó a mano con la fórmula WCAG (ver la entrada de la tarea 11).
- **Archivos principales:** `src/test/{axe.ts,a11y.test.tsx}`, `src/ui/components/SampleBanner.tsx`.
- **Dependencias nuevas:** `axe-core` (desarrollo): el motor de reglas de accesibilidad de referencia, sin dependencias, mantenido por Deque. Se usa directo en lugar de `vitest-axe`/`jest-axe` para no sumar un envoltorio.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (188 pasando) · build ✅
- **Commit:** 2e81d5a
- **Siguiente:** Plurales correctos en unidades.

### [2026-10-24 13:56] Metas de límite «como máximo» (Fase 2 · 11)

- **Qué hice:** Al poner meta a un contador o cantidad se elige «Al menos» o «Como máximo». Con límite: la tarjeta muestra «5 / máx. 3 tazas» y la barra se pone roja al pasarse; el resumen del día, las rachas, el calendario (dentro del tope = intensidad máxima, pasarse = mínima) y el resumen semanal lo respetan con textos propios («Días dentro del límite»). Las plantillas Café (≤ 3 tazas) y Pantalla (≤ 3 h) y el Café de ejemplo ahora usan límite.
- **Por qué:** Para café, cigarrillos, pantalla o gastos lo útil es un tope, no un mínimo. Campo opcional `goalDirection` (ausente = «al menos») para que los datos ya guardados y los respaldos anteriores sigan funcionando sin migración de la base. Un día sin registros no cuenta como «dentro del límite» porque no se sabe si fue cero o si no se registró; la app sugiere registrar 0 esos días.
- **Archivos principales:** `src/domain/{types,aggregate,heatmap,trackers,backup}.ts`, `src/ui/components/{TrackerForm,TrackerTile,PeriodSummary}.tsx`, `src/ui/trackerText.ts`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (180 pasando) · build ✅
- **Commit:** 78347bd
- **Siguiente:** Pruebas automáticas de accesibilidad con axe.

### [2026-10-24 13:50] Recordatorio diario (Fase 2 · 10)

- **Qué hice:** En Ajustes, «Recordarme registrar cada día» con hora elegible (20:00 por defecto). Después de esa hora, si hoy no hay registros, «Hoy» muestra un aviso. Al activarlo se pide permiso de notificaciones; si se concede, llega una notificación a esa hora mientras la app esté abierta.
- **Por qué:** Sin servidor de push (prohibido por las reglas: nada de servicios externos) los navegadores no permiten programar notificaciones con la app cerrada. En lugar de prometer algo que no funciona, la interfaz explica el límite con claridad. La regla vive en el dominio (`shouldShowDailyReminder`).
- **Archivos principales:** `src/domain/reminder.ts`, `src/ui/components/{DailyReminder,ReminderSettings}.tsx`, `src/ui/hooks/useSetting.ts`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (173 pasando) · build ✅
- **Commit:** bd5a02d
- **Siguiente:** Backlog vacío: revisión crítica de la app y nuevas ideas.

### [2026-10-24 13:48] Exportación CSV ancha (Fase 2 · 9)

- **Qué hice:** Botón «CSV por día (ancho)» en Ajustes: una fila por fecha (continua, sin saltos entre la primera y la última) y una columna por rastreador con su valor diario (`Sueño (h)`, `Ánimo (1-5)`…); las celdas vacías son días sin registro.
- **Por qué:** El formato largo es ideal para guardar; el ancho es el que se usa directo para series de tiempo, `df.corr()` en pandas o una tabla dinámica. Las fechas son continuas para que los días faltantes queden explícitos como vacíos (no como cero). Los valores diarios usan la misma agregación que el resto de la app.
- **Archivos principales:** `src/domain/csvData.ts`, `src/data/csvIO.ts`, `src/ui/screens/SettingsScreen.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (168 pasando) · build ✅
- **Commit:** 856b96e
- **Siguiente:** Recordatorio diario.

### [2026-10-24 13:46] Estadísticas por día de la semana (Fase 2 · 8)

- **Qué hice:** En el detalle de cada rastreador, un gráfico de lunes a domingo con el promedio de los días con registros (en sí/no, el porcentaje de días con «Sí») y una frase con el mayor y el menor día («Tu mayor día es el sábado ($ 42.893) y el menor, el miércoles»). La tabla accesible incluye cuántos días respaldan cada promedio.
- **Por qué:** Es un patrón fácil de entender y accionable (gastos del fin de semana, poco estudio los viernes). Se promedia solo sobre días con datos para no confundir «no registré» con «cero»; lo dice el subtítulo. Reutiliza `BarChart`.
- **Archivos principales:** `src/domain/weekday.ts`, `src/ui/components/WeekdayChart.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (166 pasando) · build ✅
- **Commit:** fc44c87
- **Siguiente:** Exportación CSV ancha.

### [2026-10-24 13:44] Aviso de nueva versión de la PWA (Fase 2 · 7)

- **Qué hice:** El service worker pasa de actualización automática silenciosa a modo «prompt»: cuando hay una versión nueva aparece arriba «Hay una versión nueva de Pulso · Después / Actualizar». Verifiqué con Playwright sobre el build de producción que el service worker controla la página y que la app (incluidas las pantallas con carga diferida) abre sin conexión.
- **Por qué:** Con `autoUpdate` la versión nueva solo se ve tras cerrar todas las pestañas, lo que confunde después de un despliegue. Actualizar recarga la página; como todo está en IndexedDB no se pierde nada. Usa `virtual:pwa-register/react` (de vite-plugin-pwa, con workbox-window que ya estaba).
- **Archivos principales:** `src/ui/components/UpdatePrompt.tsx`, `src/main.tsx`, `vite.config.ts`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (162 pasando) · build ✅ · offline verificado ✅
- **Commit:** 0de8010
- **Siguiente:** Estadísticas por día de la semana.

### [2026-10-24 13:42] Hallazgos con desfase de un día (Fase 2 · 6)

- **Qué hice:** Nueva sección «Al día siguiente» en Hallazgos: correlación entre el total de un rastreador en un día y el de otro al día siguiente, para cada par ordenado («Los días en que registras más «Café», al día siguiente tiendes a registrar menos «Sueño».»). Solo se muestran las moderadas o fuertes, con el mismo mínimo de 14 pares de días, r, valor p y diagrama.
- **Por qué:** Muchas relaciones reales tienen retraso (café de hoy → sueño de esta noche, que se registra mañana). Se advierte que una relación del mismo día con datos que cambian poco de un día a otro también aparece con desfase sin que exista un efecto entre días. Se refactorizó el cálculo de pares en `correlatePair` para compartirlo.
- **Archivos principales:** `src/domain/insights.ts`, `src/ui/screens/InsightsScreen.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (162 pasando) · build ✅
- **Commit:** 0b5e2dd
- **Siguiente:** Aviso de nueva versión de la PWA.

### [2026-10-24 13:38] Resumen semanal y mensual (Fase 2 · 5)

- **Qué hice:** Arriba de «Estadísticas», un resumen «Esta semana / Este mes» por rastreador: total (o días con «Sí», o promedio en escalas), promedio por día en contadores y cantidades, días con meta cumplida y el cambio frente al periodo anterior (↑ 11 %, ↓ 0,3 puntos…).
- **Por qué:** La comparación es justa: un miércoles se comparan lunes–miércoles con lunes–miércoles de la semana pasada (y en meses, los mismos días, recortando si el mes anterior es más corto). El cambio se muestra en color neutro porque «más» no siempre es mejor (café, gastos). En escalas el cambio va en puntos, no en %, porque un porcentaje sobre una escala 1–5 engaña.
- **Archivos principales:** `src/domain/summary.ts`, `src/ui/components/PeriodSummary.tsx`, `src/ui/screens/StatsScreen.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (160 pasando) · build ✅
- **Commit:** d1b5212
- **Siguiente:** Hallazgos con desfase de un día.

### [2026-10-24 13:35] Plantillas de rastreadores (Fase 2 · 4)

- **Qué hice:** Al crear un rastreador aparecen 12 plantillas (Sueño, Agua, Café, Estudio, Ejercicio, Ánimo, Gastos en COP, Lectura, Meditación, Pasos, Pantalla, Energía) con ícono, color, unidad y meta sensatos. Elegir una llena el formulario para revisarlo antes de crear; se ocultan las que ya existen por nombre.
- **Por qué:** Llenar el formulario en lugar de crear directo deja ajustar la meta sin pasos extra. También corregí una prueba con condición de carrera (encontraba el chip «Sueño» del diálogo justo antes de que se cerrara).
- **Archivos principales:** `src/domain/templates.ts`, `src/ui/components/TemplatePicker.tsx`, `src/ui/screens/ManageTrackersScreen.tsx`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (155 pasando) · build ✅
- **Commit:** 0e2dc5e
- **Siguiente:** Resumen semanal y mensual.

### [2026-10-24 13:30] Registrar en días anteriores (Fase 2 · 3)

- **Qué hice:** Flechas «Día anterior / Día siguiente» en la pantalla principal. En un día pasado, los toques registran en esa fecha (con la hora actual), el resumen y el progreso son de ese día, las tarjetas quedan enmarcadas en ámbar para que no haya confusión, y aparece «Volver a hoy». El aviso de deshacer dice el día («(ayer)»).
- **Por qué:** Olvidar registrar es lo más común; antes había que abrir el diálogo detallado y cambiar la fecha. Se guarda el desplazamiento en días (no la fecha) para que la vista siga a «hoy» si pasa la medianoche. No se permite avanzar más allá de hoy.
- **Archivos principales:** `src/ui/screens/TodayScreen.tsx`, `src/data/quickLog.ts`.
- **Dependencias nuevas:** ninguna.
- **Verificación:** lint ✅ · typecheck ✅ · pruebas ✅ (153 pasando) · build ✅
- **Commit:** 9f9d6fd
- **Siguiente:** Plantillas de rastreadores comunes.

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
