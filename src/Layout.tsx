import React, {useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppDrawer from "./components/AppDrawer";
import BoardingView from "./views/BoardingView";
import {AppBar} from "./components/AppBar";
import {Route, Switch} from "react-router-dom";
import useAuthContext from "./hooks/useAuthContext";
import {Toolbar} from "@material-ui/core";
import Footer from "./components/Footer";
import ConfirmationView from "./views/ConfirmationView";
import ProfileFormView from "./views/forms/ProfileFormView";
import HierarchyView from "./views/HierarchyView";
import Paper from "@material-ui/core/Paper";
import useGridStyles from "./hooks/useGridStyle";

import "graphiql/graphiql.min.css";
import CatalogEntryRoutes from "./routes/CatalogEntryRoutes";
import GraphiQLEditor from "./GraphiQLEditor";
import Container from "@material-ui/core/Container";
import {HomePanel} from "./components/HomePanel";
import {VerificationView} from "./views/VerificationView";
import {ExportView} from "./views/ExportView";
import { ImportView } from "./views/ImportView";
import { DeleteImportView } from "./views/DeleteImportView";
import { ImportViewExcel} from "./views/ImportViewExcel";
import GridViewView from "./views/GridViewView";

const drawerWidth = 250;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    content: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        padding: theme.spacing(3)
    },
    graphiql: {
        minHeight: "100vh",
        height: "100%"
    }
}));

export default function Layout() {
    const classes = useStyles();
    const gridStyles = useGridStyles();
    const {token} = useAuthContext();
    const [drawerOpen, setDrawerOpen] = useState(false);

    if (!token) {
        return (
            <div className={classes.content}>
                <CssBaseline/>
                <Switch>
                    <Route path="/confirm">
                        <ConfirmationView/>
                    </Route>
                    <Route>
                        <BoardingView/>
                    </Route>
                </Switch>
                <Footer/>
            </div>
        );
    }

    return (
        <div className={classes.root}>
            <CssBaseline/>
            <AppBar onClick={() => setDrawerOpen(true)}/>
            <AppDrawer
                open={drawerOpen}
                variant="temporary"
                onClose={() => setDrawerOpen(false)}
                className={classes.drawer}
                classes={{
                    paper: classes.drawerPaper,
                }}
            />
            <main className={classes.content}>
                <Toolbar/>
                <Switch>
                    <Route exact path="/">
                        <Container maxWidth="md">
                            <Paper className={gridStyles.paper} variant="outlined">
                                <HomePanel/>
                            </Paper>
                        </Container>

                    </Route>
                    <Route path="/profile">
                        <ProfileFormView/>
                    </Route>
                    <Route path="/search">
                        <HierarchyView/>
                    </Route>
                    <Route path="/audit">
                        <VerificationView/>
                    </Route>
                    <Route path="/import">
                        <ImportView/>
                        <ImportViewExcel/>
                        <DeleteImportView/>
                    </Route>
                    <Route path="/export">
                        <ExportView/>
                    </Route>
                    <Route path="/graphiql">
                        <Paper className={classes.graphiql}>
                            <GraphiQLEditor/>
                        </Paper>
                    </Route>
                    <Route path="/gridview">
                        <GridViewView/>
                    </Route>
                    <CatalogEntryRoutes/>
                </Switch>
                <Footer/>
            </main>

        </div>
    );
}
