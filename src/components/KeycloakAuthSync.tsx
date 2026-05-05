import { useEffect, useState } from 'react';
import { useKeycloak } from '../providers/KeycloakProvider';
import useAuthContext from '../hooks/useAuthContext';
import { AuthMethod } from '../providers/AuthProvider';

/**
 * Komponente die automatisch das Keycloak-Token in den AuthContext überträgt
 * nach erfolgreicher Keycloak-Authentifizierung.
 * 
 * Muss innerhalb von AuthProvider UND KeycloakProvider verwendet werden.
 */
export const KeycloakAuthSync = () => {
  const { keycloak, initialized, authenticated } = useKeycloak();
  const { login, token: authToken } = useAuthContext();
  const [tokenTransferred, setTokenTransferred] = useState(false);

  useEffect(() => {
    const transferToken = async () => {
      // Prüfe ob Keycloak ein Token hat (auch wenn authenticated false ist)
      // Dies kann passieren wenn die Seite nach dem Login neu lädt
      if (initialized && keycloak && !authToken && !tokenTransferred) {
        if (keycloak.token) {
          try {
            await keycloak.updateToken(5);
            if (keycloak.token) {
              login(keycloak.token, AuthMethod.KEYCLOAK);
              setTokenTransferred(true);
            }
          } catch (error) {
            console.error('Failed to transfer Keycloak token:', error);
          }
        } else if (authenticated) {
          // authenticated ist true aber kein Token - versuche zu holen
          try {
            await keycloak.updateToken(5);
            if (keycloak.token) {
              login(keycloak.token, AuthMethod.KEYCLOAK);
              setTokenTransferred(true);
              console.log('Token successfully transferred to AuthContext');
            }
          } catch (error) {
            console.error('Failed to get token:', error);
          }
        }
      }
    };

    transferToken();
  }, [initialized, authenticated, keycloak, authToken, login, tokenTransferred]);

  // Diese Komponente rendert nichts
  return null;
};
