import React, { useState } from "react";
import { Grid, Paper, Typography, Tabs, Tab } from "@mui/material";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import useAuthContext from "../hooks/useAuthContext";
import { useSnackbar } from "notistack";
import makeStyles from "@mui/styles/makeStyles";
import Box from "@mui/material/Box";
import PetsIcon from "@mui/icons-material/Pets";
import IntroPanel from "../components/IntroPanel";
import { Theme } from "@mui/material/styles";
import { T } from "@tolgee/react";
import LanguageSwitcher from "../components/LanguageSwitcher";

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    padding: theme.spacing(2),
  },
  languageSwitcher: {
    display: "flex",
    justifyContent: "flex-end",
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: string;
  value: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

export default function BoardingView() {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { login } = useAuthContext();
  const [signupSent, setSignupSent] = useState(false);
  const [tab, setTab] = useState("login");

  const handleLogin = (token: string) => {
    enqueueSnackbar(<T keyName="boarding.login_success">Willkommen zurück!</T>);
    login(token);
  };

  const handleSignup = () => {
    setSignupSent(true);
    enqueueSnackbar(
      <T keyName="boarding.signup_success">
        Sie erhalten in den nächsten Minuten einen Bestätigungscode per Email, mit dem Sie Ihren Account aktivieren können.
      </T>
    );
  };

  return (
    <div style={{ color: 'black' }}>
      <Grid container direction="row" alignItems="stretch" spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper} variant="outlined">
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Typography variant="h4">
                  <PetsIcon /> <T keyName="boarding.welcome">Willkommen beim datacat editor</T>
                </Typography>
              </Grid>
              <Grid item className={classes.languageSwitcher}>
                <LanguageSwitcher textColor="black" dropdownColor="black" borderColor="black" />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} lg={8}>
          <IntroPanel />
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
              <Tab label={<T keyName="boarding.login_tab">Anmelden</T>} value="login" />
              <Tab label={<T keyName="boarding.signup_tab">Registrieren</T>} value="signup" />
            </Tabs>
            <TabPanel value={tab} index="login">
              <Typography>
                <T keyName="boarding.login_message">
                  Bitte nutzen Sie Ihren Benutzernamen und Ihr Password um sich beim Editor anzumelden.
                </T>
              </Typography>
              <LoginForm onLogin={handleLogin} />
            </TabPanel>
            <TabPanel value={tab} index="signup">
              {signupSent ? (
                <Typography>
                  <T keyName="boarding.signup_success">
                    Sie erhalten in den nächsten Minuten einen Bestätigungscode per Email, mit dem Sie Ihren Account aktivieren können.
                  </T>
                </Typography>
              ) : (
                <React.Fragment>
                  <Typography>
                    <T keyName="boarding.signup_message">
                      Sie können sich registrieren um lesenden Zugriff auf den Katalog zu erhalten. Möchten Sie sich an der Bearbeitung des Katalogs beteiligen, so informieren Sie bitte den Administrator.
                    </T>
                  </Typography>
                  <SignupForm onSignup={handleSignup} />
                </React.Fragment>
              )}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
