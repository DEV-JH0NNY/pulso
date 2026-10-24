# syntax=docker/dockerfile:1

# --- Base con dependencias instaladas ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Desarrollo: servidor de Vite con recarga en caliente ---
FROM deps AS dev
COPY . .
ENV BASE_PATH=/
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# --- Compilación de producción ---
FROM deps AS build
COPY . .
ARG BASE_PATH=/
ENV BASE_PATH=${BASE_PATH}
RUN npm run build

# --- Servidor estático liviano para probar el build ---
FROM nginx:1.27-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
