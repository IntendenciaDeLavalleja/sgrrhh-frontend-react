# =======================================================
# Stage 1: Build
# El frontend usa URLs relativas (/api/hr), no necesita
# VITE_* vars en build time. El proxy hacia el backend
# se configura en nginx en runtime con BACKEND_URL.
# =======================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias primero (capa cacheada)
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fuente
COPY . .

RUN npm run build

# =======================================================
# Stage 2: Servir (nginx:alpine — sin Node en runtime)
# =======================================================
FROM nginx:alpine

# Instalar gettext para envsubst (reemplaza ${BACKEND_URL} en runtime)
RUN apk add --no-cache gettext

# Eliminar config por defecto de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nginx config como template (BACKEND_URL se inyecta en runtime)
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copiar assets compilados del stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Healthcheck para Coolify / Docker
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --spider -q http://localhost/health || exit 1

# envsubst sustituye solo ${BACKEND_URL} (no las variables propias de nginx)
CMD ["/bin/sh", "-c", \
  "envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
