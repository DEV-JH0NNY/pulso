# CLAUDE.md — Reglas de trabajo para Pulso

Este archivo define CÓMO trabajas en este repositorio. Léelo completo antes de empezar y vuelve a él cuando dudes. El QUÉ está en `ENCARGO.md`.

## Contexto

- Trabajas solo, sin supervisión, durante toda la noche. Nadie va a responder preguntas.
- Nunca te detengas a preguntar: toma la decisión más razonable, regístrala en `BITACORA.md` con su justificación y continúa.
- El dueño del proyecto revisará todo en la mañana leyendo `BITACORA.md`, el historial de git y la app desplegada.

## Ciclo de trabajo (repítelo sin parar)

1. Lee `ROADMAP.md` y toma la tarea pendiente de mayor prioridad.
2. Implementa la tarea completa, con sus pruebas.
3. Verifica: `lint`, `typecheck`, pruebas y `build` deben pasar. Si algo falla, arréglalo antes de seguir.
4. Haz un commit con un mensaje claro (Conventional Commits) y súbelo (push) a tu rama de trabajo.
5. Agrega la entrada correspondiente en `BITACORA.md` y marca la tarea como hecha en `ROADMAP.md`.
6. Vuelve al paso 1.

Si el backlog se queda vacío, no te detengas: revisa la app con ojo crítico, agrega al menos 5 ideas nuevas y priorizadas al backlog, y continúa. Mejorar calidad, accesibilidad, rendimiento o pruebas también cuenta como trabajo válido.

## Reglas inquebrantables

- **No rompas lo que funciona.** Nunca hagas commit con pruebas o build en rojo.
- **Un commit por cambio lógico.** Commits pequeños para que cualquier funcionalidad se pueda revertir sin afectar las demás.
- **Haz push después de cada commit.** Si la sesión se corta, el trabajo no se pierde.
- **Termina lo que empiezas.** Nada de funcionalidades a medias: si una idea es demasiado grande, divídela en tareas que se puedan completar.
- **Antes de empezar una sesión o retomar,** lee el resumen de `BITACORA.md` y el `ROADMAP.md` para saber dónde quedaste.

## Aislamiento y dependencias

- Todas las dependencias se instalan localmente en el proyecto (`npm install`, nunca `npm install -g`). Usa `npx` para herramientas de línea de comandos.
- Haz commit del archivo de bloqueo (`package-lock.json`) y fija la versión de Node en `.nvmrc` y en `"engines"` de `package.json`.
- Agrega solo dependencias que aporten de verdad; justifica cada una en `BITACORA.md`. Prefiere librerías mantenidas, populares y livianas.
- Incluye un `Dockerfile` y un `docker-compose.yml` (o un `.devcontainer/`) para que el dueño pueda ejecutar el proyecto en su computador sin instalar Node ni nada global.

## Buenas prácticas de desarrollo

- **TypeScript en modo estricto.** Sin `any` salvo justificación explícita en un comentario.
- **Arquitectura clara:** separa dominio (lógica pura, cálculos, estadísticas), datos (persistencia) y presentación (componentes). La lógica de negocio no vive en los componentes.
- **Pruebas:** pruebas unitarias para toda la lógica de dominio (estadísticas, rachas, correlaciones, importación/exportación CSV) y pruebas de componentes para los flujos principales.
- **Calidad automatizada:** ESLint + Prettier configurados, y scripts `lint`, `typecheck`, `test` y `build` en `package.json`.
- **Integración continua:** un workflow de GitHub Actions que corra lint, typecheck, pruebas y build en cada push.
- **Accesibilidad:** HTML semántico, etiquetas en controles, contraste suficiente, navegación con teclado, respeto a `prefers-reduced-motion`.
- **Rendimiento:** carga inicial liviana, división de código donde tenga sentido, sin dependencias pesadas innecesarias.
- **Seguridad y privacidad:** sin secretos en el código, sin telemetría, sin servicios externos de pago ni registros en terceros. Los datos del usuario nunca salen de su dispositivo.
- **Código legible:** nombres descriptivos, funciones pequeñas, comentarios solo donde aporten el porqué.
- **Idioma:** la interfaz va en español (Colombia). El código y los nombres técnicos pueden ir en inglés; los commits, la bitácora y la documentación van en español.

## Documentación obligatoria

Mantén estos archivos actualizados durante toda la noche, no solo al final:

- **`BITACORA.md`** — registro de todo lo que haces (sigue la plantilla que ya existe en el archivo).
- **`ROADMAP.md`** — fase inicial, backlog priorizado y tareas completadas.
- **`COMO_EJECUTAR.md`** — guía paso a paso para alguien que nunca ha visto el proyecto:
  1. Requisitos previos.
  2. Cómo ejecutarlo con Docker (opción recomendada, sin instalar nada global).
  3. Cómo ejecutarlo con Node directamente (opción alternativa).
  4. Cómo correr las pruebas, el lint y el build.
  5. Cómo se despliega en GitHub Pages y cómo instalar la app en un celular Android.
  6. Estructura de carpetas explicada.
  7. **Tecnologías usadas y por qué:** una tabla con cada tecnología, para qué se usa y por qué se eligió frente a las alternativas.
  8. Solución de problemas comunes.
- **`README.md`** — presentación breve del proyecto, capturas o descripción de funciones, y enlace a `COMO_EJECUTAR.md`.
