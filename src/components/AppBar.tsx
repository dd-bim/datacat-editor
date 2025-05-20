import Toolbar from "@mui/material/Toolbar";
import { styled } from '@mui/material/styles';
import Button from "@mui/material/Button";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import MaterialUIAppBar from "@mui/material/AppBar";
import React from "react";
import useAuthContext, { useWriteAccess } from "../hooks/useAuthContext";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Tooltip, Box, Typography } from "@mui/material";
import { useProfile } from "../providers/ProfileProvider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from '@mui/icons-material/Menu';
import CreateEntrySplitButton from "./CreateEntrySplitButton";
import AppTitle from "./AppTitle";
import { QuickSearchWidget } from "./QuickSearchWidget";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLocation } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Link from '@mui/material/Link';

// Replace makeStyles with styled components
const StyledAppBar = styled(MaterialUIAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  ...theme.mixins.toolbar,
  display: 'flex',
  alignItems: 'center',
}));

const Spacer = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(2), // Consistent spacing between all elements
}));

const RightButtons = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginLeft: 'auto', // This pushes everything to the right
});

type AppBarProps = {
  onClick?(): void;
}

// Add a breadcrumb component
const AppBreadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  // Skip breadcrumbs on home page
  if (pathnames.length === 0) return null;
  
  // Map path segments to readable names
  const getPathName = (path: string) => {
    const entityMapping: Record<string, string> = {
      'document': 'Dokumente',
      'model': 'Fachmodelle',
      'class': 'Klassen',
      'property': 'Merkmale',
      'property-group': 'Merkmalsgruppen',
      'group': 'Gruppen',
      'value': 'Werte',
      'valueList': 'Wertelisten',
      'unit': 'Maßeinheiten',
      'import': 'Import',
      'export': 'Export',
      'search': 'Suche',
      'profile': 'Profil',
      'audit': 'Prüfen',
      'gridview': 'Tabellenansicht',
      'tagview': 'Tags',
      'graphiql': 'GraphiQL',
    };
    
    return entityMapping[path] || path;
  };
  
  return (
    <Breadcrumbs 
      separator={<NavigateNextIcon fontSize="small" />} 
      aria-label="breadcrumb"
      sx={{
        display: { xs: 'none', md: 'block' },
        color: 'white',
        '& .MuiBreadcrumbs-separator': { mx: 1, color: 'white' },
        '& a': { color: 'white', textDecoration: 'none' },
        '& a:hover': { textDecoration: 'underline' }
      }}
    >
      <Link color="inherit" href="/">
        Home
      </Link>
      {pathnames.map((value, index) => {
        const isLast = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        
        return isLast ? (
          <Typography color="white" key={to}>
            {getPathName(value)}
          </Typography>
        ) : (
          <Link color="inherit" href={to} key={to}>
            {getPathName(value)}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export function AppBar(props: AppBarProps) {
  const { onClick } = props;
  const { profile } = useProfile();
  const { logout } = useAuthContext();
  const verifiedUser = useWriteAccess();

  return (
    <StyledAppBar position="fixed">
      <StyledToolbar>
        {onClick && profile && (
          <Spacer>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={onClick}
              edge="start"
            >
              <MenuIcon />
            </IconButton>
          </Spacer>
        )}
        
        <Spacer 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start',
            justifyContent: 'center'
          }}
        >
          <AppTitle />
          {/* Add breadcrumbs under the title */}
          <AppBreadcrumbs />
        </Spacer>
        
        {profile && (
          <RightButtons>
            <Spacer>
              <QuickSearchWidget key="search-input" />
            </Spacer>

            <Spacer>
              <CreateEntrySplitButton />
            </Spacer>

            <Spacer>
              <LanguageSwitcher />
            </Spacer>

            <Box>
              <Button key="logout-button"
                variant="outlined"
                color="inherit"
                aria-label="logout"
                startIcon={verifiedUser ? (
                  <Tooltip title="Durch den Administrator bestätigter Benutzer">
                    <VerifiedUserIcon />
                  </Tooltip>
                ) : (
                  <Tooltip title="Durch den Administrator unbestätigter Benutzer (nur lesender Zugriff)">
                    <ErrorOutlineIcon />
                  </Tooltip>
                )}
                endIcon={<ExitToAppIcon />}
                onClick={() => logout()}
              >
                {profile.username}
              </Button>
            </Box>
          </RightButtons>
        )}
      </StyledToolbar>
    </StyledAppBar>
  );
}
