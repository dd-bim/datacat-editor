import React, {useState} from "react";
import Grid from "@material-ui/core/Grid";
import LoginForm from "../components/LoginForm";
import Typography from "@material-ui/core/Typography";
import SignupForm from "../components/SignupForm";
import useAuthContext from "../hooks/useAuthContext";
import {useSnackbar} from "notistack";
import {Paper} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import PetsIcon from "@material-ui/icons/Pets";
import IntroPanel from "../components/IntroPanel";

const useStyles = makeStyles(theme => ({
    paper: {
        padding: theme.spacing(2),
    }
}));

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: string;
    value: string;
}

function TabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function BoardingView() {
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();
    const {login} = useAuthContext();
    const [signupSent, setSignupSent] = useState(false);
    const [tab, setTab] = useState("login");

    const handleLogin = (token: string) => {
        enqueueSnackbar('Welcome back!');
        login(token);
    }

    const handleSignup = () => {
        setSignupSent(true);
        enqueueSnackbar('Signup successful! You will need to check your inbox and confirm your email address before logging in.');
    }


    return (
        <Grid container direction="row" alignItems="stretch" spacing={3}>
            <Grid item xs={12}>
                <Paper className={classes.paper} variant="outlined">
                    <Typography variant="h4">
                        <PetsIcon/> Willkommen beim datacat editor
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={8}>
                <IntroPanel/>
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
                <Paper>
                    <Tabs
                        value={tab}
                        onChange={(event, value) => setTab(value)}
                        indicatorColor="primary"
                        textColor="primary"
                        centered
                    >
                        <Tab label="Anmelden" value="login"/>
                        <Tab label="Registrieren" value="signup"/>
                    </Tabs>
                    <TabPanel value={tab} index="login">
                        <Typography>
                            Bitte nutzen Sie Ihren Benutzernamen und Ihr Password um sich beim Editor anzumelden.
                        </Typography>
                        <LoginForm onLogin={handleLogin}/>
                    </TabPanel>
                    <TabPanel value={tab} index="signup">
                        {signupSent ? (
                            <Typography>
                                Sie erhalten in den nächsten Minuten einen Bestätigungscode per Email, mit dem Sie
                                Ihren
                                Account aktivieren können.
                            </Typography>
                        ) : (
                            <React.Fragment>
                                <Typography>
                                    Sie können sich registrieren um lesenden Zugriff auf den Katalog zu erhalten.
                                    Möchten Sie
                                    sich an der Bearbeitung
                                    des Katalogs beteiligen, so informieren Sie bitte den Administrator.
                                </Typography>
                                <SignupForm onSignup={handleSignup}/>
                            </React.Fragment>

                        )}
                    </TabPanel>
                </Paper>
            </Grid>
        </Grid>
    )
}
