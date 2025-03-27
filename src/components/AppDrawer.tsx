import * as React from "react";
import { FunctionComponent } from "react";
import Drawer, { DrawerProps } from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material/styles";
import ListItem, { ListItemProps } from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Tooltip from "@mui/material/Tooltip";
import { Link as RouterLink } from "react-router-dom";
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
import {
  ClassEntity,
  DataTemplateEntity,
  DocumentEntity,
  GroupEntity,
  MeasureEntity,
  ModelEntity,
  PropertyEntity,
  PropertyGroupEntity,
  UnitEntity,
  ValueEntity,
} from "../domain";
import AppTitle from "./AppTitle";
import { useAdminAccess } from "../hooks/useAuthContext";
import { T } from "@tolgee/react";

const useStyles = makeStyles((theme: Theme) => ({
  drawerContainer: {
    overflow: "auto",
  },
  heading: {
    padding: theme.spacing(2),
  },
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
  return (
    <Tooltip title={tooltip} aria-label={tooltip} arrow enterDelay={500}>
      <ListItem component="div" disablePadding>
        <ListItemButton
          component={RouterLink}
          to={to}
          disabled={disabled}
          onClick={onClick}
        >
          {icon && <ListItemIcon>{icon}</ListItemIcon>}
          <ListItemText inset={!icon} primary={primary} secondary={secondary} />
        </ListItemButton>
      </ListItem>
    </Tooltip>
  );
};

const AppDrawer: FunctionComponent<DrawerProps> = (props) => {
  const classes = useStyles();
  const isAdmin = useAdminAccess();
  const { onClose } = props;

  const handleItemClick = () => {
    if (onClose) {
      onClose({}, "backdropClick");
    }
  };

  return (
    <Drawer {...props}>
      <div className={classes.drawerContainer}>
        <div className={classes.heading}>
          <AppTitle />
        </div>

        <List dense>
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
            primary={<T keyName="app_drawer.documents">Referenzdokumente</T>}
            to={`/${DocumentEntity.path}`}
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<ModelEntity.Icon />}
            primary={<T keyName="app_drawer.models">Fachmodelle</T>}
            to={`/${ModelEntity.path}`}
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<GroupEntity.Icon />}
            primary={<T keyName="app_drawer.groups">Gruppen</T>}
            to={`/${GroupEntity.path}`}
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<ClassEntity.Icon />}
            primary={<T keyName="app_drawer.classes">Klassen</T>}
            to={`/${ClassEntity.path}`}
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<DataTemplateEntity.Icon />}
            primary={<T keyName="app_drawer.data_templates">Datenvorlagen</T>}
            to={`/${DataTemplateEntity.path}`}
            disabled
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<PropertyGroupEntity.Icon />}
            primary={<T keyName="app_drawer.property_groups">Merkmalsgruppen</T>}
            to={`/${PropertyGroupEntity.path}`}
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<PropertyEntity.Icon />}
            primary={<T keyName="app_drawer.properties">Merkmale</T>}
            to={`/${PropertyEntity.path}`}
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<MeasureEntity.Icon />}
            primary={<T keyName="app_drawer.measures">Größen</T>}
            to={`/${MeasureEntity.path}`}
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<UnitEntity.Icon />}
            primary={<T keyName="app_drawer.units">Maßeinheiten</T>}
            to={`/${UnitEntity.path}`}
            onClick={handleItemClick}
          />

          <AppDrawerItem
            icon={<BookmarksIcon />}
            primary={<T keyName="app_drawer.values">Werte</T>}
            to={`/${ValueEntity.path}`}
            onClick={handleItemClick}
          />
        </List>
      </div>
    </Drawer>
  );
};

export default AppDrawer;
