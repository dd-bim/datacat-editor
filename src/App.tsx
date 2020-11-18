import {ThemeProvider} from "@material-ui/core/styles";
import React from "react";
import theme from "./theme";
import {BrowserRouter as Router} from "react-router-dom";
import Layout from "./Layout";
import ApiProvider from "./providers/ApiProvider";
import ProfileProvider from "./providers/ProfileProvider";
import {SnackbarProvider} from "notistack";
import {ReactKeycloakProvider} from "@react-keycloak/web";
import keycloak from "./keycloak";

const eventLogger = (event: unknown, error: unknown) => {
    console.log('onKeycloakEvent', event, error)
}

const tokenLogger = (tokens: unknown) => {
    console.log('onKeycloakTokens', tokens)
}

export default function App() {
    return (
        <Router>
            <ReactKeycloakProvider
                authClient={keycloak}
                onEvent={eventLogger}
                onTokens={tokenLogger}
            >
                <ApiProvider>
                    <ThemeProvider theme={theme}>
                        <SnackbarProvider
                            maxSnack={3}
                            variant="success"
                            autoHideDuration={5000}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                        >
                            <p>Hallo, Welt!</p>
                            <ProfileProvider>
                                <Layout/>
                            </ProfileProvider>
                        </SnackbarProvider>
                    </ThemeProvider>
                </ApiProvider>
            </ReactKeycloakProvider>
        </Router>
    );
}
