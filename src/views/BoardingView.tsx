import React, {useState} from "react";
import Grid from "@material-ui/core/Grid";
import LoginForm from "../components/LoginForm";
import Typography from "@material-ui/core/Typography";
import SignupForm from "../components/SignupForm";
import {useSnackbar} from "notistack";
import {Paper} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import PetsIcon from "@material-ui/icons/Pets";
import {useKeycloak} from "@react-keycloak/web";

const useStyles = makeStyles(theme => ({
    paper: {
        padding: theme.spacing(2),
    },
    paragraph: {
        marginBottom: theme.spacing(3)
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
    // const {enqueueSnackbar} = useSnackbar();
    const {keycloak} = useKeycloak();
    // const [signupSent, setSignupSent] = useState(false);
    const [tab, setTab] = useState("login");

    // const handleLogin = (token: string) => {
    //     enqueueSnackbar('Welcome back!');
    //     login(token);
    // }
    //
    // const handleSignup = () => {
    //     setSignupSent(true);
    //     enqueueSnackbar('Signup successful! You will need to check your inbox and confirm your email address before logging in.');
    // }


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
                <Paper className={classes.paper} variant={"outlined"}>
                    <Typography gutterBottom>
                        datacat editor ist ein webbasiertes, OpenSource Arbeitswerkzeug zum gemeinsamen Entwickeln von
                        Datenkatalogen für die Bauindustrie. Der Quellcode wird unter der GPL v3 Lizenz zur Verfügung
                        gestellt.
                    </Typography>
                    <Typography gutterBottom>
                        In einem Datenkatalog können Sie Konzepte wie Akteure, Aktivitäten, Bauteile und Merkmale
                        mehrsprachig benennen, beschreiben und nach Ihrer Funktion und Gestalt standardkonform
                        kategorisieren.
                        Durch das Bilden von Beziehungen zwischen diesen Konzepten, kann die bebaute Umwelt schließlich
                        näher beschrieben werden.
                    </Typography>
                    <Typography gutterBottom>
                        Der entwickelte Datenbestand steht zum Abruf über eine API für Entwickler von
                        Import/Export-Werkzeugen
                        und CAD/BIM-Plugins zur Verfügung. Zukünftig sollen Prüfroutinen entwickelt werden, die es
                        erlauben
                        Inkonsistenzen wie ungenutzte Konzepte, mögliche Duplikate, und fehlende Übersetzungen im
                        Katalog
                        ausfindig zu machen.
                    </Typography>
                    <Typography gutterBottom>
                        datacat wird an der Hochschule für Technik und Wirtschaft Dresden (HTW Dresden) entwickelt.
                        Wenn Sie weiteres Interesse am Projekt oder Fragen zur Anwendung haben, kontaktieren Sie
                        uns gern direkt über die unten genannten Daten.
                    </Typography>
                    <Typography gutterBottom>
                        <b>
                            Es handelt sich um ein Software-Preview. Ihre direkte Mitwirkung als OpenSource-Entwickler oder
                            indirekt durch die Gabe von Feedback ist sehr erwünscht.
                        </b>
                    </Typography>
                </Paper>
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
                        <Tab label="Anmelden" value="login" onClick={() => keycloak.login()}/>
                        <Tab label="Registrieren" value="signup" onClick={() => keycloak.register()}/>
                    </Tabs>
                    {/*<TabPanel value={tab} index="login">*/}
                    {/*    <Typography>*/}
                    {/*        Bitte nuten Sie Ihren Benutzernamen und Ihr Password um sich beim Editor anzumelden.*/}
                    {/*    </Typography>*/}
                    {/*    <LoginForm onLogin={handleLogin}/>*/}
                    {/*</TabPanel>*/}
                    {/*<TabPanel value={tab} index="signup">*/}
                    {/*    {signupSent ? (*/}
                    {/*        <Typography>*/}
                    {/*            Sie erhalten in den nächsten Minuten einen Bestätigungscode per Email, mit dem Sie*/}
                    {/*            Ihren*/}
                    {/*            Account aktivieren können.*/}
                    {/*        </Typography>*/}
                    {/*    ) : (*/}
                    {/*        <React.Fragment>*/}
                    {/*            <Typography>*/}
                    {/*                Sie können sich registrieren um lesenden Zugriff auf den Katalog zu erhalten.*/}
                    {/*                Möchten Sie*/}
                    {/*                sich an der Bearbeitung*/}
                    {/*                des Katalogs beteiligen, so informieren Sie bitte den Administrator.*/}
                    {/*            </Typography>*/}
                    {/*            <SignupForm onSignup={handleSignup}/>*/}
                    {/*        </React.Fragment>*/}

                    {/*    )}*/}
                    {/*</TabPanel>*/}
                </Paper>
            </Grid>
        </Grid>
    )
}
