# =======================================================
# Stage 1: Build
# Vite hornea las VITE_* env vars en build time.
# En Coolify: agregar VITE_API_URL como Build Variable.
# Docker manual: --build-arg VITE_API_URL=https://api.sgrrhh.lavalleja.uy/api
# =======================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias primero (capa cacheada)
COPY package.json package-lock.json* ./
RUN npm ci

# Copiar código fuente
COPY . .

# VITE_API_URL es requerida en build time.
# Debe apuntar a la URL pública del backend Flask + /api
# Ejemplo: https://api.sgrrhh.lavalleja.uy/api
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# =======================================================
# Stage 2: Servir (nginx:alpine — sin Node en runtime)
# =======================================================
FROM nginx:alpine

# Eliminar config por defecto de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nuestra config (gzip + cache + SPA fallback + health check)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar assets compilados del stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Healthcheck para Coolify / Docker
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
