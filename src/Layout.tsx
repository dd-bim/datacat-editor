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
import HierarchyView from "./views/HierarchyView";
import { HomePanel } from "./components/HomePanel";
import { VerificationView } from "./views/VerificationView";
import { ExportView } from "./views/ExportView";
import { ImportView } from "./views/ImportView";
import { DeleteImportView } from "./views/DeleteImportView";
import { ImportViewExcel } from "./views/ImportViewExcel";
import GridViewView from "./views/GridViewView";
import TagView from "./views/TagView";
import GraphiQLEditor from "./GraphiQLEditor";
import IDSExportView from "./views/IDSExportView"; // Import the new IDSExportView
import { catalogEntryRoutes } from "./routes/CatalogEntryRoutes";
import { OntologyExportView } from "./views/OntologyExportView";

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
  minHeight: "100vh",
  height: "100%",
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
    { path: "/export", element: <><ExportView /><OntologyExportView/></> },
    { path: "/ids-export", element: <IDSExportView /> }, // Add route for IDS Export View
    {
      path: "/graphiql",
      element: (
        <GraphiQLPaper variant="outlined">
          <GraphiQLEditor />
        </GraphiQLPaper>
      ),
    },
    { path: "/tagview", element: <TagView /> },
    { path: "/gridview", element: <GridViewView /> },
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