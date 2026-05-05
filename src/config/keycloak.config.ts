// Keycloak configuration
// Diese Konfiguration sollte in den Umgebungsvariablen gesetzt werden

export interface KeycloakConfig {
  enabled: boolean;
  url: string;
  realm: string;
  clientId: string;
}

export const getKeycloakConfig = (): KeycloakConfig => {
  // Dynamisch zur Laufzeit auslesen
  const enabled = window.ENV_CONFIG?.KEYCLOAK_ENABLED !== 'false';
  const url = window.ENV_CONFIG?.KEYCLOAK_URL || '';
  const realm = window.ENV_CONFIG?.KEYCLOAK_REALM || '';
  const clientId = window.ENV_CONFIG?.KEYCLOAK_CLIENT_ID || '';

  return {
    enabled: enabled && !!url && !!realm && !!clientId,
    url,
    realm,
    clientId,
  };
};

// Erweitere das Window-Interface für Umgebungsvariablen
declare global {
  interface Window {
    ENV_CONFIG?: {
      MINIO_ENDPOINT?: string;
      MINIO_PORT?: string;
      MINIO_USE_SSL?: string;
      MINIO_BUCKET_NAME?: string;
      MINIO_ACCESS_KEY?: string;
      MINIO_SECRET_KEY?: string;
      KEYCLOAK_ENABLED?: string;
      KEYCLOAK_URL?: string;
      KEYCLOAK_REALM?: string;
      KEYCLOAK_CLIENT_ID?: string;
    };
  }
}
