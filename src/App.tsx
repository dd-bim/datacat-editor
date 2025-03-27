import { ThemeProvider } from "@mui/material/styles";
import React from "react";
import theme from "./theme";
import { BrowserRouter as Router } from "react-router-dom";
import Layout from "./Layout";
import AuthProvider from "./providers/AuthProvider";
import ApiProvider from "./providers/ApiProvider";
import ProfileProvider from "./providers/ProfileProvider";
import LanguageProvider from "./providers/LanguageProvider"; // LanguageProvider importieren
import { SnackbarProvider } from "notistack";
import { AppProvider } from './context/AppContext';

export default function App() {
    return (
        <AppProvider>
            <LanguageProvider> {/* TolgeeProvider wird hier eingebunden */}
                <Router>
                    <AuthProvider>
                        <ApiProvider>
                            <ThemeProvider theme={theme}>
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
                                        <Layout />
                                    </ProfileProvider>
                                </SnackbarProvider>
                            </ThemeProvider>
                        </ApiProvider>
                    </AuthProvider>
                </Router>
            </LanguageProvider>
        </AppProvider>
    );
}
