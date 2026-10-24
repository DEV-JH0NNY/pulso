# Pulso

**Pulso** es una app web progresiva (PWA) para registrar tu vida como si fuera un dataset: horas de estudio, sueño, gastos, café, ejercicio, ánimo o lo que quieras medir. Registrar algo toma un toque, y la app convierte esos registros en hallazgos honestos sobre tus hábitos.

- 📱 Pensada primero para celular, instalable en Android y con funcionamiento sin conexión.
- 🔒 Tus datos viven solo en tu dispositivo (IndexedDB). Sin cuentas, sin telemetría, sin servidores.
- 🇨🇴 Interfaz en español de Colombia: fechas, números y pesos colombianos (COP).

## Funciones

- **Rastreadores a tu medida:** contador, cantidad con unidad (horas, km, COP…), sí/no o escala 1–5, con ícono, color y meta diaria opcional. Se pueden editar, ordenar y archivar.
- **Registro en un toque:** toca un rastreador en «Hoy» para registrar su valor por defecto; mantén presionado (o usa «+») para ajustar valor, fecha, hora y nota. Todo se puede deshacer.
- **Hoy:** progreso de cada rastreador frente a su meta y resumen de metas cumplidas.
- **Historial:** registros agrupados por día, con filtro, edición y borrado.
- **Estadísticas:** racha actual y mejor racha, calendario anual estilo GitHub y gráficos por día, semana y mes.
- **Hallazgos:** correlaciones de Pearson entre rastreadores (mínimo 14 días en común), explicadas en lenguaje simple, con valor p, diagrama de dispersión y la advertencia de que correlación no implica causalidad.
- **CSV:** exportación e importación en formato largo (`fecha, hora, rastreador, valor, unidad, nota`) con validación por línea.
- **Datos de ejemplo** para explorar la app, marcados y borrables con un botón.
- **Modo claro y oscuro**, accesible con teclado y lector de pantalla, y respeta «reducir movimiento».

> Revisa [`ROADMAP.md`](ROADMAP.md) para ver el avance y [`BITACORA.md`](BITACORA.md) para el registro de decisiones.

## Cómo ejecutarlo

Toda la guía paso a paso (Docker, Node, pruebas, despliegue e instalación en Android) está en [`COMO_EJECUTAR.md`](COMO_EJECUTAR.md).
