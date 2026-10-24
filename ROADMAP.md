# Roadmap de Pulso

Leyenda: ✅ hecho · 🔄 en curso · ⬜ pendiente

## Fase 1 — Lo inicial (obligatorio, en orden de prioridad)

1. ✅ **Base del proyecto:** estructura, TypeScript estricto, lint, formato, pruebas, CI, Docker y despliegue en GitHub Pages.
2. ✅ **Rastreadores personalizables:** crear, editar, archivar y reordenar (nombre, ícono, color, tipo, meta diaria opcional).
3. ✅ **Registro rápido:** un toque registra el valor por defecto; toque largo o botón secundario para ajustar valor, fecha, hora y nota; deshacer.
4. ✅ **Vista de hoy:** progreso de cada rastreador frente a su meta.
5. ✅ **Historial:** registros por día, editable y con opción de borrar.
6. ✅ **Rachas y mapa de calor anual** por rastreador.
7. ✅ **Gráficos** por rastreador con vistas de día, semana y mes.
8. ✅ **Hallazgos:** correlaciones de Pearson entre totales diarios (mínimo 14 días en común).
9. ✅ **Exportar e importar CSV** en formato largo con validación de errores.
10. ✅ **Datos de ejemplo** marcados como tales, con botón para borrarlos.
11. ✅ **Diseño:** celular primero, modo claro y oscuro, es-CO (fechas, números y COP).

## Fase 2 — Backlog priorizado

Ordenado por valor para el dueño (datos seguros primero, luego registrar más rápido, luego análisis).

1. ✅ **Respaldo y restauración completos en JSON:** rastreadores con su configuración (íconos, colores, metas, orden, archivados) y todos los registros; restauración validada que reemplaza o combina.
2. ✅ **Almacenamiento persistente y recordatorio de respaldo:** pedir `navigator.storage.persist()` para que el navegador no borre los datos, y avisar si pasaron más de 30 días sin exportar.
3. ✅ **Registrar en días anteriores desde Hoy:** flechas para moverse entre días en la pantalla principal (olvidé registrar ayer).
4. ✅ **Plantillas de rastreadores comunes:** crear con un toque Sueño, Agua, Café, Estudio, Ejercicio, Ánimo, Gastos…
5. ✅ **Resumen semanal y mensual:** esta semana frente a la anterior por rastreador (promedio, metas cumplidas, cambio %).
6. ✅ **Hallazgos con desfase de un día:** ¿lo de hoy se relaciona con lo de mañana? (por ejemplo, sueño de anoche → ánimo de hoy).
7. ✅ **Aviso de nueva versión de la PWA:** mostrar «Hay una versión nueva · Actualizar» en lugar de esperar a cerrar todas las pestañas.
8. ✅ **Estadísticas por día de la semana:** promedio de cada rastreador de lunes a domingo.
9. ✅ **Exportación CSV ancha (un día por fila):** lista para pandas o una hoja de cálculo.
10. ⬜ **Recordatorio diario dentro de la app:** aviso a una hora elegida si aún no has registrado nada (con permiso de notificaciones cuando el navegador lo permita).

## Completadas

- [2026-10-24] Base del proyecto (Fase 1 · tarea 1).
- [2026-10-24] Rastreadores personalizables (Fase 1 · tarea 2).
- [2026-10-24] Registro rápido (Fase 1 · tarea 3).
- [2026-10-24] Vista de hoy (Fase 1 · tarea 4).
- [2026-10-24] Historial (Fase 1 · tarea 5).
- [2026-10-24] Rachas y mapa de calor (Fase 1 · tarea 6).
- [2026-10-24] Gráficos (Fase 1 · tarea 7).
- [2026-10-24] Hallazgos (Fase 1 · tarea 8).
- [2026-10-24] Exportar e importar CSV (Fase 1 · tarea 9).
- [2026-10-24] Datos de ejemplo (Fase 1 · tarea 10).
- [2026-10-24] Diseño: tema, contraste, es-CO, carga diferida (Fase 1 · tarea 11). **Fase 1 completa.**
- [2026-10-24] Respaldo y restauración en JSON (Fase 2 · 1).
- [2026-10-24] Almacenamiento persistente y recordatorio de respaldo (Fase 2 · 2).
- [2026-10-24] Registrar en días anteriores (Fase 2 · 3).
- [2026-10-24] Plantillas de rastreadores (Fase 2 · 4).
- [2026-10-24] Resumen semanal y mensual (Fase 2 · 5).
- [2026-10-24] Hallazgos con desfase de un día (Fase 2 · 6).
- [2026-10-24] Aviso de nueva versión de la PWA (Fase 2 · 7).
- [2026-10-24] Estadísticas por día de la semana (Fase 2 · 8).
- [2026-10-24] Exportación CSV ancha (Fase 2 · 9).
