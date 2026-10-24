# ENCARGO.md — Qué construir

## La idea

**Pulso** es una app móvil de uso personal para registrar la vida como si fuera un dataset: horas de estudio, sueño, gastos, café, ejercicio, ánimo o lo que el usuario quiera medir. Registrar algo debe tomar un toque, y la app debe convertir esos registros en hallazgos útiles sobre los propios hábitos.

El usuario es estudiante y trabaja en ingeniería de datos, así que valora los datos bien estructurados, la exportación limpia y los análisis honestos (nada de conclusiones inventadas).

## Stack base

- React + Vite + TypeScript
- Tailwind CSS
- IndexedDB a través de Dexie para guardar los datos en el dispositivo
- PWA instalable y con funcionamiento sin conexión (manifest + service worker, por ejemplo con `vite-plugin-pwa`)
- Vitest + Testing Library para pruebas
- Despliegue en GitHub Pages con GitHub Actions

Puedes agregar librerías si lo justificas en la bitácora y en `COMO_EJECUTAR.md`.

## Fase 1 — Lo inicial (obligatorio, en este orden de prioridad)

1. **Base del proyecto:** estructura, TypeScript estricto, lint, formato, pruebas, CI, Docker y despliegue en GitHub Pages funcionando.
2. **Rastreadores personalizables:** crear, editar, archivar y reordenar. Cada uno con nombre, ícono, color, tipo (contador, cantidad con unidad, sí/no, escala 1–5) y meta diaria opcional.
3. **Registro rápido:** un toque desde la pantalla principal registra el valor por defecto; un toque largo o un botón secundario permite ajustar valor, fecha, hora y nota. Debe poder deshacerse.
4. **Vista de hoy:** progreso de cada rastreador frente a su meta.
5. **Historial:** lista de registros por día, editable y con opción de borrar.
6. **Rachas y mapa de calor anual** por rastreador, estilo calendario de contribuciones de GitHub.
7. **Gráficos** por rastreador con vistas de día, semana y mes.
8. **Hallazgos:** correlaciones entre rastreadores usando los totales diarios (Pearson), solo cuando haya al menos 14 días con datos en común. Explícalas en lenguaje simple e indica siempre que correlación no implica causalidad.
9. **Exportar e importar CSV** en formato largo (`fecha, hora, rastreador, valor, unidad, nota`), con validación clara de errores al importar.
10. **Datos de ejemplo:** al abrir por primera vez, ofrecer cargar datos de ejemplo claramente marcados como tales, con un botón para borrarlos todos.
11. **Diseño:** pensado primero para celular, modo claro y oscuro, interfaz en español de Colombia (fechas, números y moneda en COP).

## Fase 2 — Mejora autónoma (cuando termines la Fase 1)

Desde aquí decides tú. Sorprende al dueño con funcionalidades que de verdad hagan la app más útil o más agradable de usar. Algunas direcciones posibles, solo como inspiración:

- Resúmenes semanales y mensuales automáticos.
- Recordatorios y notificaciones.
- Plantillas de rastreadores comunes.
- Rastreadores derivados o con fórmulas (por ejemplo, gasto promedio por día).
- Respaldo y restauración completos en JSON.
- Mejoras de accesibilidad, rendimiento, animaciones sutiles y pulido visual.
- Más pruebas y refactorizaciones donde el código lo necesite.

Prioriza calidad sobre cantidad: es mejor cinco funcionalidades impecables que veinte a medias. Registra cada idea en el backlog de `ROADMAP.md` antes de implementarla.
