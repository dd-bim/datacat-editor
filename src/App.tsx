import {ThemeProvider} from "@material-ui/core/styles";
import React from "react";
import theme from "./theme";
import {BrowserRouter as Router} from "react-router-dom";
import Layout from "./components/layout/Layout";
import AuthProvider from "./providers/AuthProvider";
import ApiProvider from "./providers/ApiProvider";
import ProfileProvider from "./providers/ProfileProvider";
import {SnackbarProvider} from "notistack";

export default function App() {
    return (
        <Router>
            <AuthProvider>
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
                            <ProfileProvider>
                                <Layout/>
                            </ProfileProvider>
                        </SnackbarProvider>
                    </ThemeProvider>
                </ApiProvider>
            </AuthProvider>
        </Router>
    );
}
