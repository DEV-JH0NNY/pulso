# Cómo ejecutar Pulso

Guía paso a paso para alguien que nunca ha visto el proyecto.

## 1. Requisitos previos

- **Opción recomendada:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye `docker compose`). No necesitas instalar Node.
- **Opción alternativa:** Node.js **22.22** o superior (la versión exacta está en `.nvmrc`). Si usas [nvm](https://github.com/nvm-sh/nvm), ejecuta `nvm use` dentro de la carpeta.
- Git, para clonar el repositorio.

```bash
git clone https://github.com/dev-jh0nny/pulso.git
cd pulso
```

## 2. Ejecutar con Docker (recomendado)

```bash
# Servidor de desarrollo con recarga en caliente → http://localhost:5173
docker compose up dev

# Versión de producción (build + nginx) → http://localhost:8080
docker compose --profile prod up --build prod

# Lint, typecheck, pruebas y build dentro del contenedor
docker compose --profile check run --rm check
```

Para detener todo: `Ctrl + C` y luego `docker compose down`.

## 3. Ejecutar con Node directamente (alternativa)

```bash
npm ci            # instala las dependencias exactas del package-lock.json (solo en esta carpeta)
BASE_PATH=/ npm run dev   # → http://localhost:5173
```

> `BASE_PATH=/` hace que la app se sirva en la raíz. Sin esa variable se usa `/pulso/`, que es la ruta de GitHub Pages (entonces la URL local sería http://localhost:5173/pulso/).

Para ver el build de producción:

```bash
npm run build
npm run preview   # → http://localhost:4173/pulso/
```

## 4. Pruebas, lint y build

| Comando                | Qué hace                                         |
| ---------------------- | ------------------------------------------------ |
| `npm run lint`         | ESLint (sin advertencias permitidas)             |
| `npm run format:check` | Verifica el formato con Prettier                 |
| `npm run format`       | Aplica el formato con Prettier                   |
| `npm run typecheck`    | TypeScript en modo estricto, sin emitir archivos |
| `npm test`             | Pruebas con Vitest + Testing Library             |
| `npm run test:watch`   | Pruebas en modo observación                      |
| `npm run build`        | Build de producción en `dist/`                   |

La integración continua (`.github/workflows/ci.yml`) corre todos estos pasos en cada push.

## 5. Despliegue en GitHub Pages e instalación en Android

### Despliegue

1. En GitHub, ve a **Settings → Pages** y en **Source** elige **GitHub Actions** (solo se hace una vez).
2. Cada push a la rama `main` ejecuta `.github/workflows/deploy.yml`, que corre las pruebas, compila con `BASE_PATH=/<nombre-del-repo>/` y publica `dist/`.
3. La app queda en `https://dev-jh0nny.github.io/pulso/`.

### Instalar en un celular Android

1. Abre la URL de la app en **Chrome** para Android.
2. Toca el menú **⋮** y elige **Instalar app** (o **Agregar a la pantalla principal**).
3. Pulso aparece como una app más; funciona sin conexión después de la primera carga.

Tus datos se guardan solo en ese dispositivo y navegador. Usa la exportación (CSV) para respaldarlos.

## 6. Estructura de carpetas

```
pulso/
├── .github/workflows/   # CI (ci.yml) y despliegue a GitHub Pages (deploy.yml)
├── public/              # Íconos y archivos estáticos de la PWA
├── src/
│   ├── app/             # Componente raíz y navegación
│   ├── domain/          # Lógica pura: tipos, fechas, estadísticas, rachas, correlaciones, CSV
│   ├── data/            # Persistencia con Dexie (IndexedDB) y repositorios
│   ├── ui/              # Componentes de presentación y pantallas
│   └── test/            # Configuración de pruebas
├── Dockerfile           # Etapas: deps, dev, build y prod (nginx)
├── docker-compose.yml   # Servicios dev, prod y check
└── vite.config.ts       # Vite, Tailwind, PWA y Vitest
```

## 7. Tecnologías usadas y por qué

| Tecnología                            | Para qué se usa                                       | Por qué se eligió frente a alternativas                                                                        |
| ------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| React 19                              | Interfaz de usuario                                   | Requerido por el encargo; ecosistema enorme y Testing Library lo soporta de primera.                           |
| Vite 8                                | Servidor de desarrollo y build                        | Arranque instantáneo y builds pequeños; más simple que webpack.                                                |
| TypeScript 6 (estricto)               | Tipado de todo el código                              | Atrapa errores antes de ejecutar. Se fija la 6.0 porque `typescript-eslint` aún no soporta la 7.               |
| Tailwind CSS 4                        | Estilos                                               | Estilos utilitarios sin CSS muerto; modo oscuro con una variante. Más liviano que una librería de componentes. |
| Dexie 4 + dexie-react-hooks           | Base de datos local (IndexedDB) y consultas reactivas | API simple y tipada sobre IndexedDB; `useLiveQuery` actualiza la UI al cambiar los datos sin un estado global. |
| vite-plugin-pwa (Workbox)             | Manifest y service worker (instalable y offline)      | Genera el service worker automáticamente; escribirlo a mano es propenso a errores.                             |
| Vitest + Testing Library + jsdom      | Pruebas unitarias y de componentes                    | Comparte la configuración de Vite; API compatible con Jest pero más rápido.                                    |
| fake-indexeddb                        | IndexedDB en memoria para las pruebas                 | Permite probar la capa de datos real (Dexie) sin navegador.                                                    |
| ESLint + typescript-eslint + Prettier | Calidad y formato automáticos                         | Estándar de facto; reglas estrictas y formato consistente sin discusiones.                                     |
| GitHub Actions + GitHub Pages         | CI y hosting gratuito                                 | Integrado con el repositorio, sin servicios de pago ni registros en terceros.                                  |
| Docker + docker compose               | Ejecutar sin instalar Node                            | Entorno reproducible en cualquier computador.                                                                  |

## 8. Solución de problemas comunes

- **Página en blanco en local:** probablemente abriste `http://localhost:5173/` sin `BASE_PATH=/`. Usa `http://localhost:5173/pulso/` o arranca con `BASE_PATH=/ npm run dev`.
- **La app no se actualiza después de un despliegue:** el service worker sirve la versión en caché. Cierra todas las pestañas de la app y vuelve a abrirla, o recarga dos veces.
- **`npm ci` falla por la versión de Node:** verifica `node -v` (debe ser ≥ 22.12). Con nvm: `nvm install && nvm use`.
- **El puerto 5173 u 8080 está ocupado:** cambia el puerto de la izquierda en `docker-compose.yml` (por ejemplo `'5174:5173'`).
- **Docker no ve los cambios de `package.json`:** reconstruye la imagen con `docker compose build --no-cache dev`.
