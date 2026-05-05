import { ThemeProvider } from "@mui/material/styles";
import { StyledEngineProvider } from "@mui/material";
import React from "react";
import { getTheme } from "./theme";
import { BrowserRouter as Router } from "react-router-dom";
import Layout from "./Layout";
import AuthProvider from "./providers/AuthProvider";
import { KeycloakProvider } from "./providers/KeycloakProvider";
import { KeycloakAuthSync } from "./components/KeycloakAuthSync";
import { getKeycloakConfig } from "./config/keycloak.config";
import ApiProvider from "./providers/ApiProvider";
import ProfileProvider from "./providers/ProfileProvider";
import LanguageProvider from "./providers/LanguageProvider"; // LanguageProvider importieren
import { SnackbarProvider } from "notistack";
import { AppProvider } from "./context/AppContext";
import { CustomThemeProvider, useCustomTheme } from "./context/ThemeContext";

// Inner component that has access to theme context
function ThemedApp() {
  const { darkMode } = useCustomTheme();
  const currentTheme = getTheme(darkMode);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={currentTheme}>
        <SnackbarProvider
          maxSnack={3}
          variant="success"
          autoHideDuration={5000}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
        >
          <ProfileProvider>
            <KeycloakAuthSync />
            <Layout />
          </ProfileProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default function App() {
  const keycloakConfig = getKeycloakConfig();
  
  return (
    <AppProvider>
      <CustomThemeProvider>
        <LanguageProvider>
          <Router>
            <KeycloakProvider config={keycloakConfig}>
              <AuthProvider>
                <ApiProvider>
                  <ThemedApp />
                </ApiProvider>
              </AuthProvider>
            </KeycloakProvider>
          </Router>
        </LanguageProvider>
      </CustomThemeProvider>
    </AppProvider>
  );
}
