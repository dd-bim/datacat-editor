import * as React from "react";
import { FunctionComponent } from "react";
import Drawer, { DrawerProps } from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import { styled } from "@mui/material/styles";
import ListItem, { ListItemProps } from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Tooltip from "@mui/material/Tooltip";
import { Link as RouterLink, useLocation } from "react-router-dom";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import StorageIcon from "@mui/icons-material/Storage";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CodeIcon from "@mui/icons-material/Code";
import ChecklistIcon from "@mui/icons-material/Checklist";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PublishIcon from "@mui/icons-material/Publish";
import DescriptionIcon from "@mui/icons-material/Description";
import {
  ClassEntity,
  DataTemplateEntity,
  DocumentEntity,
  GroupEntity,
  ValueListEntity,
  ModelEntity,
  PropertyEntity,
  PropertyGroupEntity,
  UnitEntity,
  ValueEntity,
  DictionaryEntity
} from "../domain";
import AppTitle from "./AppTitle";
import { useAdminAccess } from "../hooks/useAuthContext";
import { T } from "@tolgee/react";

// Replace makeStyles with styled components
const DrawerContainer = styled('div')({
  overflow: "auto",
});

const HeadingDiv = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
}));

type AppDrawerItemProps = {
  icon?: React.ReactNode;
  primary: React.ReactNode;
  secondary?: string;
  tooltip?: string;
  to: string;
  onClick: () => void;
  disabled?: boolean;
};

// Enhanced AppDrawerItem with active state handling
export const AppDrawerItem: FunctionComponent<
  AppDrawerItemProps & ListItemProps
> = (props) => {
  const {
    icon,
    primary,
    secondary,
    tooltip = "",
    to,
    disabled,
    onClick,
  } = props;
  
  const location = useLocation();
  const isActive = location.pathname === to || 
                  (to !== '/' && location.pathname.startsWith(to + '/'));
  
  return (
    <Tooltip title={tooltip} aria-label={tooltip} arrow enterDelay={500}>
      <ListItem component="div" disablePadding>
        <ListItemButton
          component={RouterLink}
          to={to}
          disabled={disabled}
          onClick={onClick}
          selected={isActive}
          sx={{
            '&.Mui-selected': {
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.12)',
              },
            },
          }}
        >
          {icon && (
            <ListItemIcon
              sx={{ 
                color: isActive ? 'primary.main' : 'inherit',
                minWidth: '40px' // Make icons more compact
              }}
            >
              {icon}
            </ListItemIcon>
          )}
          <ListItemText 
            inset={!icon} 
            primary={primary} 
            secondary={secondary}
            primaryTypographyProps={{
              sx: { 
                fontWeight: isActive ? 'bold' : 'normal',
                color: isActive ? 'primary.main' : 'inherit'
              }
            }}
          />
        </ListItemButton>
      </ListItem>
    </Tooltip>
  );
};

const AppDrawer: FunctionComponent<DrawerProps> = (props) => {
  const isAdmin = useAdminAccess();
  const { onClose } = props;

  const handleItemClick = () => {
    if (onClose) {
      onClose({}, "backdropClick");
    }
  };

  return (
    <Drawer {...props}>
      <DrawerContainer>
        <HeadingDiv>
          <AppTitle />
        </HeadingDiv>

        <List 
          dense
          sx={{
            // Add dividers between categories
            '& .MuiListSubheader-root': {
              lineHeight: '32px',
              backgroundColor: 'background.paper',
              position: 'relative',
              borderTop: '1px solid rgba(0, 0, 0, 0.12)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
              marginTop: 1,
              paddingTop: 0.5,
              paddingBottom: 0.5,
              fontWeight: 'bold',
            }
          }}
        >
          <ListSubheader disableSticky>
            <T keyName="app_drawer.general">Allgemein</T>
          </ListSubheader>

          <AppDrawerItem
            icon={<HomeIcon />}
            primary={<T keyName="app_drawer.home">Startseite</T>}
            to="/"
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<AccountCircleIcon />}
            primary={<T keyName="app_drawer.edit_profile">Profil bearbeiten</T>}
            to="/profile"
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<SearchIcon />}
            primary={<T keyName="app_drawer.search_catalog">Katalog durchsuchen</T>}
            to="/search"
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<ChecklistIcon />}
            primary={<T keyName="app_drawer.audit">Prüfen</T>}
            to="/audit"
            onClick={handleItemClick}
          />
          {isAdmin && (
            <AppDrawerItem
              icon={<PublishIcon />}
              primary={<T keyName="app_drawer.import">Importieren</T>}
              to="/import"
              onClick={handleItemClick}
            />
          )}

          <AppDrawerItem
            icon={<FileDownloadIcon />}
            primary={<T keyName="app_drawer.export">Exportieren</T>}
            to="/export"
            onClick={handleItemClick}
          />

          {/* New IDS Export menu item */}
          <AppDrawerItem
            icon={<DescriptionIcon />}
            primary={<T keyName="app_drawer.ids_export">IDS Export</T>}
            to="/ids-export"
            onClick={handleItemClick}
          />

          {isAdmin && (
            <AppDrawerItem
              icon={<CodeIcon />}
              primary={<T keyName="app_drawer.graphiql">GraphiQL Interface</T>}
              to="/graphiql"
              onClick={handleItemClick}
            />
          )}

          {isAdmin && (
            <AppDrawerItem
              icon={<LocalOfferIcon />}
              primary={<T keyName="app_drawer.new_tags">Neue Tags anlegen</T>}
              to="/tagview"
              onClick={handleItemClick}
            />
          )}

          <AppDrawerItem
            icon={<StorageIcon />}
            primary={<T keyName="app_drawer.grid_view">Tabellenansicht</T>}
            to="/gridview"
            onClick={handleItemClick}
          />

          <ListSubheader disableSticky>
            <T keyName="app_drawer.catalog">Katalog</T>
          </ListSubheader>

          <AppDrawerItem
            icon={<DocumentEntity.Icon />}
            primary={<T keyName="documents.titlePlural">Referenzdokumente</T>}
            to={`/${DocumentEntity.path}`}
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<ModelEntity.Icon />}
            primary={<T keyName="dictionary.titlePlural">Dictionary</T>}
            to={`/${DictionaryEntity.path}`}
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<ModelEntity.Icon />}
            primary={<T keyName="model.titlePlural">Fachmodelle</T>}
            to={`/${ModelEntity.path}`}
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<GroupEntity.Icon />}
            primary={<T keyName="theme.titlePlural">Themen</T>}
            to={`/${GroupEntity.path}`}
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<ClassEntity.Icon />}
            primary={<T keyName="class.titlePlural">Klassen</T>}
            to={`/${ClassEntity.path}`}
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<PropertyGroupEntity.Icon />}
            primary={<T keyName="propertyGroup.titlePlural">Merkmalsgruppen</T>}
            to={`/${PropertyGroupEntity.path}`}
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<PropertyEntity.Icon />}
            primary={<T keyName="property.titlePlural">Merkmale</T>}
            to={`/${PropertyEntity.path}`}
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<ValueListEntity.Icon />}
            primary={<T keyName="valuelist.titlePlural">Wertelisten</T>}
            to={`/${ValueListEntity.path}`}
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<UnitEntity.Icon />}
            primary={<T keyName="unit.titlePlural">Maßeinheiten</T>}
            to={`/${UnitEntity.path}`}
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<BookmarksIcon />}
            primary={<T keyName="value.titlePlural">Werte</T>}
            to={`/${ValueEntity.path}`}
            onClick={handleItemClick}
          />
        </List>
      </DrawerContainer>
    </Drawer>
  );
};

export default AppDrawer;
