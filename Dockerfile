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

# Copy and set up entrypoint script for runtime config generation
COPY generate-config.sh /docker-entrypoint.d/50-generate-config.sh
RUN chmod +x /docker-entrypoint.d/50-generate-config.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]