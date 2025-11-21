// Runtime Environment Configuration für datacat-editor
// Diese Datei wird zur Laufzeit geladen und kann durch Docker-Umgebungsvariablen überschrieben werden

window.ENV_CONFIG = {
  // MinIO Konfiguration
  MINIO_ENDPOINT: 'localhost',
  MINIO_PORT: '9000',
  MINIO_USE_SSL: 'false',
  MINIO_BUCKET_NAME: 'datacat-ids',
  MINIO_ACCESS_KEY: '',
  MINIO_SECRET_KEY: ''
};

// console.log('✅ Runtime configuration loaded:', window.ENV_CONFIG);