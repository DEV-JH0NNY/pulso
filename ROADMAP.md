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
10. ✅ **Recordatorio diario dentro de la app:** aviso a una hora elegida si aún no has registrado nada (con permiso de notificaciones cuando el navegador lo permita).

### Ronda 2 (tras revisar la app con ojo crítico)

11. ✅ **Metas de límite («como máximo»):** hoy toda meta es un mínimo; para café, pantalla o gastos lo útil es un tope (≤ 2 tazas). Afecta progreso, rachas, calendario y resúmenes.
12. ✅ **Pruebas automáticas de accesibilidad con axe** sobre las pantallas principales.
13. ✅ **Plurales correctos en unidades:** «1 taza» en lugar de «1 tazas».
14. ✅ **Tocar un día del calendario anual muestra su valor:** los `title` del SVG no funcionan con el dedo.
15. ✅ **Detalle del rastreador más útil:** botón para editarlo y lista de sus registros recientes con edición.
16. ✅ **Reordenar arrastrando** (además de los botones subir/bajar).

### Ronda 3

17. ✅ **Documentación al día con capturas:** README con capturas reales (claro y oscuro) y `COMO_EJECUTAR.md` con la estructura de carpetas actual.
18. ✅ **Metas semanales («3 veces por semana»):** para hábitos que no son diarios, como el ejercicio.
19. ✅ **Buscar en el historial por nota o rastreador.**
20. ✅ **Accesos directos de la app instalada** (mantener presionado el ícono → «Historial», «Hallazgos»).
21. ✅ **Celebración sutil al cumplir la meta del día** (respetando «reducir movimiento»).
22. ✅ **Rastreadores derivados:** fórmula diaria entre dos rastreadores (por ejemplo, gasto por hora de estudio).

### Ronda 4

23. ✅ **Pantalla de error amigable:** si algo falla al dibujar una pantalla, mostrar un mensaje con «Reintentar» y la opción de descargar un respaldo, en vez de una página en blanco.
24. ✅ **Prueba de rendimiento con 3 años de datos** (≈ 20 000 registros) para hallazgos, rachas y series; optimizar si hace falta.
25. ✅ **Hora del último registro en las tarjetas de Hoy** («último 8:15 a. m.»), útil para agua o café.
26. ✅ **Íconos y colores automáticos al importar CSV** según el nombre (café → ☕, sueño → 💤).
27. ✅ **Exportar los hallazgos como CSV** (a, b, desfase, r, n, p) para analizarlos fuera.

### Ronda 5

28. ✅ **Corrección por comparaciones múltiples (Benjamini–Hochberg):** con muchos pares, algunos salen «significativos» por azar; mostrar qué hallazgos resisten la corrección.
29. ✅ **Restaurar respaldos con más seguridad:** límite de tamaño y mensaje claro para archivos enormes o corruptos.
30. ✅ **Pantallas anchas:** tres columnas en «Hoy» desde tablet y contenido más ancho en escritorio.
31. ✅ **Comparar dos rastreadores en el tiempo:** en cada hallazgo, un gráfico con ambas series normalizadas para ver cómo se mueven juntas.

### Ronda 6

32. ✅ **Calidad de datos:** cobertura de cada rastreador (días con registro en los últimos 30 y 90 días) y el hueco más largo, para saber qué tan confiables son los análisis.
33. ✅ **Importar también CSV ancho** (un día por fila), detectándolo automáticamente.
34. ✅ **Atajos de teclado en escritorio:** 1–9 registra el rastreador n en «Hoy»; ← / → cambia de día.
35. ✅ **Ajuste para desactivar la vibración.**
36. ✅ **Resumen anual «Tu año en Pulso»:** totales, mejores rachas y meses destacados.

### Ronda 7

37. ✅ **Refactor de la pantalla Hoy:** separar la navegación por días y el resumen en componentes propios (el archivo creció con cada mejora).
38. ✅ **Documentación al día:** README y capturas con las funciones de las rondas 4–6.
39. ✅ **Días de la semana por rastreador:** mostrar en «Hoy» solo los días que aplican (por ejemplo, gimnasio lunes, miércoles y viernes).

### Ronda 8

40. ✅ **Historial de metas:** al cambiar la meta de un rastreador, los días anteriores se evalúan con la meta que tenían entonces (hoy se recalcula todo con la meta nueva).
41. ✅ **Duplicar un rastreador** (por ejemplo, para crear «Café descafeinado» a partir de «Café»).
42. ✅ **Nota rápida tras registrar:** el aviso permite agregar una nota al registro recién hecho sin abrir el formulario completo.
43. ⬜ **Prueba de punta a punta en CI** con el build real: abrir la app, registrar, recargar y comprobar que el dato persiste.
44. ⬜ **Exportar un gráfico como imagen** (PNG) para compartirlo.

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
- [2026-10-24] Recordatorio diario (Fase 2 · 10).
- [2026-10-24] Metas de límite (Fase 2 · 11).
- [2026-10-24] Pruebas automáticas de accesibilidad (Fase 2 · 12).
- [2026-10-24] Plurales correctos en unidades (Fase 2 · 13).
- [2026-10-24] Calendario anual interactivo (Fase 2 · 14).
- [2026-10-24] Detalle del rastreador más útil (Fase 2 · 15).
- [2026-10-24] Reordenar arrastrando (Fase 2 · 16).
- [2026-10-24] Documentación al día con capturas (Fase 2 · 17).
- [2026-10-24] Metas semanales (Fase 2 · 18).
- [2026-10-24] Buscar en el historial (Fase 2 · 19).
- [2026-10-24] Accesos directos de la app instalada (Fase 2 · 20).
- [2026-10-24] Celebración al cumplir la meta (Fase 2 · 21).
- [2026-10-24] Métricas derivadas (Fase 2 · 22).
- [2026-10-24] Pantalla de error amigable (Fase 2 · 23).
- [2026-10-24] Prueba de rendimiento (Fase 2 · 24).
- [2026-10-24] Hora del último registro (Fase 2 · 25).
- [2026-10-24] Íconos automáticos al importar (Fase 2 · 26).
- [2026-10-24] Exportar hallazgos como CSV (Fase 2 · 27).
- [2026-10-24] Corrección por comparaciones múltiples (Fase 2 · 28).
- [2026-10-24] Restaurar respaldos con más seguridad (Fase 2 · 29).
- [2026-10-24] Pantallas anchas (Fase 2 · 30).
- [2026-10-24] Comparar dos rastreadores en el tiempo (Fase 2 · 31).
- [2026-10-24] Calidad de datos (Fase 2 · 32).
- [2026-10-24] Importar CSV ancho (Fase 2 · 33).
- [2026-10-24] Atajos de teclado (Fase 2 · 34).
- [2026-10-24] Desactivar la vibración (Fase 2 · 35).
- [2026-10-24] Resumen anual (Fase 2 · 36).
- [2026-10-24] Refactor de la pantalla Hoy (Fase 2 · 37).
- [2026-10-24] Días de la semana por rastreador (Fase 2 · 39).
- [2026-10-24] Documentación al día, ronda 7 (Fase 2 · 38).
- [2026-10-24] Historial de metas (Fase 2 · 40).
- [2026-10-24] Duplicar un rastreador (Fase 2 · 41).
- [2026-10-24] Nota rápida tras registrar (Fase 2 · 42).
