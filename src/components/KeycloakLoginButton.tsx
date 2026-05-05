import React from 'react';
import { Button, Divider, Box, Typography, CircularProgress } from '@mui/material';
import { T } from '@tolgee/react';
import { useKeycloak } from '../providers/KeycloakProvider';
import useAuthContext from '../hooks/useAuthContext';
import { AuthMethod } from '../providers/AuthProvider';
import { useSnackbar } from 'notistack';
import { getKeycloakConfig } from '../config/keycloak.config';

interface KeycloakLoginButtonProps {
  disabled?: boolean;
}

export default function KeycloakLoginButton({ disabled }: KeycloakLoginButtonProps) {
  const { keycloak, authenticated, getToken, initialized } = useKeycloak();
  const { login } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  
  // Prüfe ob Keycloak aktiviert ist
  const keycloakConfig = getKeycloakConfig();
  
  // Button nicht anzeigen, wenn Keycloak nicht aktiviert ist
  if (!keycloakConfig.enabled) {
    return null;
  }

  const handleKeycloakLogin = async () => {
    if (keycloak) {
      await keycloak.login({
        redirectUri: window.location.origin,
      });
    }
  };

  return (
    <Box>
      <Divider sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <T keyName="login.or">oder</T>
        </Typography>
      </Divider>
      <Button
        fullWidth
        variant="outlined"
        onClick={handleKeycloakLogin}
        disabled={disabled || !keycloak}
      >
        <T keyName="login.keycloak_button">Mit Keycloak anmelden</T>
      </Button>
    </Box>
  );
}
