# Build Stage
FROM node:lts-alpine AS builder
WORKDIR /app

# Alpine Linux Fix für Rollup
RUN apk add --no-cache libc6-compat

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production=false

# Copy source files
COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src
COPY public ./public

# Build the application
ENV VITE_API_URL=/graphql
ENV NODE_OPTIONS="--max-old-space-size=3072"
RUN npm run build

# Production Stage
FROM nginx:stable-alpine
WORKDIR /var/www

# Copy built assets from builder stage
COPY --from=builder /app/build .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Create entrypoint script for runtime config generation
RUN echo '#!/bin/sh' > /docker-entrypoint.d/50-generate-config.sh && \
    echo 'echo "Generating runtime configuration..."' >> /docker-entrypoint.d/50-generate-config.sh && \
    echo 'cat > /var/www/env-config.js << EOF' >> /docker-entrypoint.d/50-generate-config.sh && \
    echo '// Runtime Environment Configuration' >> /docker-entrypoint.d/50-generate-config.sh && \
    echo 'window.ENV_CONFIG = {' >> /docker-entrypoint.d/50-generate-config.sh && \
    echo '  MINIO_ENDPOINT: "${MINIO_ENDPOINT:-localhost}",' >> /docker-entrypoint.d/50-generate-config.sh && \
    echo '  MINIO_PORT: "${MINIO_PORT:-9000}",' >> /docker-entrypoint.d/50-generate-config.sh && \
    echo '  MINIO_USE_SSL: "${MINIO_USE_SSL:-false}",' >> /docker-entrypoint.d/50-generate-config.sh && \
    echo '  MINIO_BUCKET_NAME: "${MINIO_BUCKET_NAME:-datacat-ids}",' >> /docker-entrypoint.d/50-generate-config.sh && \
    echo '  MINIO_ACCESS_KEY: "${MINIO_ACCESS_KEY:-}",' >> /docker-entrypoint.d/50-generate-config.sh && \
    echo '  MINIO_SECRET_KEY: "${MINIO_SECRET_KEY:-}"' >> /docker-entrypoint.d/50-generate-config.sh && \
    echo '};' >> /docker-entrypoint.d/50-generate-config.sh && \
    echo 'EOF' >> /docker-entrypoint.d/50-generate-config.sh && \
    chmod +x /docker-entrypoint.d/50-generate-config.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]