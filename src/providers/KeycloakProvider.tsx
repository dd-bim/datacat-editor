import React, { createContext, useContext, useEffect, useState } from 'react';
import Keycloak from 'keycloak-js';

// Globales Flag um Doppel-Init zu verhindern (außerhalb der Komponente)
let isInitializing = false;
let initPromise: Promise<void> | null = null;

interface KeycloakContextType {
  keycloak: Keycloak | null;
  initialized: boolean;
  authenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | undefined>;
}

const KeycloakContext = createContext<KeycloakContextType>({
  keycloak: null,
  initialized: false,
  authenticated: false,
  login: async () => {},
  logout: async () => {},
  getToken: async () => undefined,
});

export const useKeycloak = () => useContext(KeycloakContext);

interface KeycloakProviderProps {
  children: React.ReactNode;
  config: {
    enabled: boolean;
    url: string;
    realm: string;
    clientId: string;
  };
}

export const KeycloakProvider: React.FC<KeycloakProviderProps> = ({ children, config }) => {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Nur initialisieren wenn Keycloak aktiviert und konfiguriert ist
    if (!config.enabled || !config.url || !config.realm || !config.clientId) {
      setInitialized(true);
      return;
    }
    
    // Reset Flag falls es hängt
    if (isInitializing && initialized) {
      isInitializing = false;
    }
    
    // Verhindere Doppel-Initialisierung mit globalem Flag
    if (isInitializing) {
      return;
    }
    
    isInitializing = true;

    let cleanupFunction: (() => void) | undefined;
    
    const initKeycloak = async () => {
      try {
        // Keycloak nutzt HASH, nicht Query-Parameter
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const code = params.get('code');
        const error = params.get('error');
        
        const kc = new Keycloak({
          url: config.url,
          realm: config.realm,
          clientId: config.clientId,
        });

        let auth = false;
        
        // check-sso NUR wenn Code vorhanden UND noch nicht verarbeitet
        const processedFlag = sessionStorage.getItem('keycloak_processing');
        
        if (code && !error && !processedFlag) {
          sessionStorage.setItem('keycloak_processing', 'true');
          
          auth = await kc.init({
            onLoad: 'check-sso',
            checkLoginIframe: false,
          });
          
          sessionStorage.removeItem('keycloak_processing');
        } else {
          auth = await kc.init({
            checkLoginIframe: false,
          });
        }
        
        // URL bereinigen falls Code/Error vorhanden
        if (code || error) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        sessionStorage.removeItem('keycloak_login_initiated');

        setKeycloak(kc);
        setAuthenticated(auth);
        setInitialized(true);
        isInitializing = false;
        initPromise = null;

        // Token refresh setup nur wenn bereits authentifiziert
        if (auth) {
          const intervalId = setInterval(() => {
            kc.updateToken(70)
              .catch(() => {
                console.error('Failed to refresh token');
              });
          }, 60000);

          // Cleanup für interval
          cleanupFunction = () => clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Keycloak initialization failed:', error);
        setInitialized(true);
        isInitializing = false;
        initPromise = null;
      }
    };

    initPromise = initKeycloak();

    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, [config]); // Nur von config abhängig

  const login = async () => {
    if (keycloak) {
      // Setze Flag dass wir einen Login erwarten
      sessionStorage.setItem('keycloak_login_initiated', 'true');
      await keycloak.login({
        redirectUri: window.location.origin + window.location.pathname + '?keycloak_callback=true',
      });
    }
  };

  const logout = async () => {
    if (keycloak) {
      await keycloak.logout({
        redirectUri: window.location.origin,
      });
    }
  };

  const getToken = async (): Promise<string | undefined> => {
    if (keycloak && authenticated) {
      try {
        await keycloak.updateToken(5);
        return keycloak.token;
      } catch (error) {
        console.error('Failed to refresh token', error);
        return undefined;
      }
    }
    return undefined;
  };

  return (
    <KeycloakContext.Provider
      value={{
        keycloak,
        initialized,
        authenticated,
        login,
        logout,
        getToken,
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
};
