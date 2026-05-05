#!/bin/sh
echo "Generating runtime configuration..."
cat > /var/www/env-config.js << EOF
// Runtime Environment Configuration
window.ENV_CONFIG = {
  MINIO_ENDPOINT: "${MINIO_ENDPOINT:-localhost}",
  MINIO_PORT: "${MINIO_PORT:-9000}",
  MINIO_USE_SSL: "${MINIO_USE_SSL:-false}",
  MINIO_BUCKET_NAME: "${MINIO_BUCKET_NAME:-datacat-ids}",
  MINIO_ACCESS_KEY: "${MINIO_ACCESS_KEY:-}",
  MINIO_SECRET_KEY: "${MINIO_SECRET_KEY:-}",
  KEYCLOAK_ENABLED: "${KEYCLOAK_ENABLED:-false}",
  KEYCLOAK_URL: "${KEYCLOAK_URL:-http://localhost:8091}",
  KEYCLOAK_REALM: "${KEYCLOAK_REALM:-datacat}",
  KEYCLOAK_CLIENT_ID: "${KEYCLOAK_CLIENT_ID:-datacat-api}"
};
EOF
