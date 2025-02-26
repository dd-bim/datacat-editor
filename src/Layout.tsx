import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AppDrawer from "./components/AppDrawer";
import BoardingView from "./views/BoardingView";
import { AppBar } from "./components/AppBar";
import { useRoutes } from "react-router-dom";
import useAuthContext from "./hooks/useAuthContext";
import { Toolbar, Container, Paper } from "@mui/material";
import Footer from "./components/Footer";
import ConfirmationView from "./views/ConfirmationView";
import ProfileFormView from "./views/forms/ProfileFormView";
import HierarchyView from "./views/HierarchyView";
import useGridStyles from "./hooks/useGridStyle";
import { HomePanel } from "./components/HomePanel";
import { VerificationView } from "./views/VerificationView";
import { ExportView } from "./views/ExportView";
import { ImportView } from "./views/ImportView";
import { DeleteImportView } from "./views/DeleteImportView";
import { ImportViewExcel } from "./views/ImportViewExcel";
import GridViewView from "./views/GridViewView";
import TagView from "./views/TagView";
import GraphiQLEditor from "./GraphiQLEditor";
import { catalogEntryRoutes } from "./routes/CatalogEntryRoutes";

const drawerWidth = 250;

const useStyles = makeStyles((theme: any) => ({
  root: {
    display: "flex",
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
    padding: theme.spacing(3),
  },
  graphiql: {
    minHeight: "100vh",
    height: "100%",
  },
}));

export default function Layout() {
  const classes = useStyles();
  const gridStyles = useGridStyles();
  const { token } = useAuthContext();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Konfiguration der Routen für nicht authentifizierte Benutzer
  if (!token) {
    const publicRoutes = [
      { path: "/confirm", element: <ConfirmationView /> },
      { path: "*", element: <BoardingView /> },
    ];
    const routing = useRoutes(publicRoutes);
    return (
      <div className={classes.content}>
        <CssBaseline />
        {routing}
        <Footer />
      </div>
    );
  }

  // Konfiguration der Routen für authentifizierte Benutzer
  const appRoutes = [
    {
      path: "/",
      element: (
        <Container maxWidth="md">
          <Paper className={gridStyles.paper} variant="outlined">
            <HomePanel />
          </Paper>
        </Container>
      ),
    },
    { path: "/profile", element: <ProfileFormView /> },
    { path: "/search", element: <HierarchyView /> },
    { path: "/audit", element: <VerificationView /> },
    {
      path: "/import",
      element: (
        <>
          <ImportView />
          <ImportViewExcel />
          <DeleteImportView />
        </>
      ),
    },
    { path: "/export", element: <ExportView /> },
    {
      path: "/graphiql",
      element: (
        <Paper className={classes.graphiql} variant="outlined">
          <GraphiQLEditor />
        </Paper>
      ),
    },
    { path: "/tagview", element: <TagView /> },
    { path: "/gridview", element: <GridViewView /> },
    // Integration der Katalogeintrag-Routen
    ...catalogEntryRoutes,
    // Optional: Fallback-Route
    { path: "*", element: <div>Page not found</div> },
  ];

  const routing = useRoutes(appRoutes);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar onClick={() => setDrawerOpen(true)} />
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
        <Toolbar />
        {routing}
        <Footer />
      </main>
    </div>
  );
}