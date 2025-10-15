import React, { useState } from "react";
import { styled } from "@mui/material/styles"; 
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
import { HomePanel } from "./components/HomePanel";
import { VerificationView } from "./views/VerificationView";
import { ExportView } from "./views/ExportView";
import { ImportView } from "./views/ImportView";
import { DeleteImportView } from "./views/DeleteImportView";
import { ImportViewExcel } from "./views/ImportViewExcel";
import TagView from "./views/TagView";
import { catalogEntryRoutes } from "./routes/CatalogEntryRoutes";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy load heavy components to improve initial load performance
const GraphiQLEditor = React.lazy(() => import("./GraphiQLEditor"));
const GridViewView = React.lazy(() => import("./views/GridViewView"));
const HierarchyView = React.lazy(() => import("./views/HierarchyView"));
const IDSExportView = React.lazy(() => import("./views/IDSExportView"));
const OntologyExportView = React.lazy(() => import("./views/OntologyExportView").then(module => ({ default: module.OntologyExportView })));

const drawerWidth = 250;

// Replace makeStyles with styled components
const Root = styled('div')({
  display: "flex",
});

const Content = styled('main')(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  padding: theme.spacing(3),
}));

const GraphiQLPaper = styled(Paper)(({ theme }) => ({
  height: "100vh",
  overflow: "hidden",
}));

export default function Layout() {
  const { token } = useAuthContext();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Configuration for unauthenticated users
  if (!token) {
    const publicRoutes = [
      { path: "/confirm", element: <ConfirmationView /> },
      { path: "*", element: <BoardingView /> },
    ];
    const routing = useRoutes(publicRoutes);
    return (
      <Content>
        <CssBaseline />
        {routing}
        <Footer />
      </Content>
    );
  }

  // Configuration for authenticated users
  const appRoutes = [
    {
      path: "/",
      element: (
        <Container maxWidth="md">
          <Paper  variant="outlined">
            <HomePanel />
          </Paper>
        </Container>
      ),
    },
    { path: "/profile", element: <ProfileFormView /> },
    { 
      path: "/search", 
      element: (
        <React.Suspense fallback={<LoadingSpinner />}>
          <HierarchyView />
        </React.Suspense>
      )
    },
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
    { 
      path: "/export", 
      element: (
        <React.Suspense fallback={<LoadingSpinner />}>
          <ExportView />
          <OntologyExportView/>
        </React.Suspense>
      )
    },
    { 
      path: "/ids-export", 
      element: (
        <React.Suspense fallback={<LoadingSpinner />}>
          <IDSExportView />
        </React.Suspense>
      )
    },
    {
      path: "/graphiql",
      element: (
        <GraphiQLPaper variant="outlined">
          <React.Suspense fallback={<LoadingSpinner />}>
            <GraphiQLEditor />
          </React.Suspense>
        </GraphiQLPaper>
      ),
    },
    { path: "/tagview", element: <TagView /> },
    { 
      path: "/gridview", 
      element: (
        <React.Suspense fallback={<LoadingSpinner />}>
          <GridViewView />
        </React.Suspense>
      )
    },
    // Integration of catalog entry routes
    ...catalogEntryRoutes,
    // Optional: Fallback route
    { path: "*", element: <div>Page not found</div> },
  ];

  const routing = useRoutes(appRoutes);

  return (
    <Root>
      <CssBaseline />
      <AppBar onClick={() => setDrawerOpen(true)} />
      <AppDrawer
        open={drawerOpen}
        variant="temporary"
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerWidth,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
          },
        }}
      />
      <Content>
        <Toolbar />
        {routing}
        <Footer />
      </Content>
    </Root>
  );
}