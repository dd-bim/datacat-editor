import * as React from 'react';
import {FunctionComponent} from 'react';
import Drawer, {DrawerProps} from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import makeStyles from "@material-ui/core/styles/makeStyles";
import ListItem, {ListItemProps} from "@material-ui/core/ListItem";
import Tooltip from "@material-ui/core/Tooltip";
import {Link as RouterLink} from "react-router-dom";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import SearchIcon from "@material-ui/icons/Search"
import HomeIcon from '@material-ui/icons/Home';
import StorageIcon from '@material-ui/icons/Storage';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import {
    ClassEntity,
    DataTemplateEntity,
    DocumentEntity,
    GroupEntity,
    ModelEntity,
    PropertyEntity,
    PropertyGroupEntity,
    ValueEntity
} from "../domain";
import AppTitle from "./AppTitle";

const useStyles = makeStyles(theme => ({
    drawerContainer: {
        overflow: 'auto',
    },
    heading: {
        padding: theme.spacing(2)
    }
}));

type AppDrawerItemProps = {
    icon?: React.ReactNode
    primary: string
    secondary?: string
    tooltip?: string,
    to: string
}

export const AppDrawerItem: FunctionComponent<AppDrawerItemProps & ListItemProps> = (props) => {
    const {icon, primary, secondary, tooltip = '', to, disabled} = props

    return (
        <Tooltip title={tooltip} aria-label={tooltip} arrow enterDelay={500}>
            <ListItem
                button
                component={RouterLink}
                to={to}
                disabled={disabled}
            >
                {icon && (
                    <ListItemIcon>
                        {icon}
                    </ListItemIcon>
                )}
                <ListItemText
                    inset={!icon}
                    primary={primary}
                    secondary={secondary}
                />
            </ListItem>
        </Tooltip>
    );
}

const AppDrawer: FunctionComponent<DrawerProps> = (props) => {
    const classes = useStyles();
    return (
        <Drawer {...props}>
            <div className={classes.drawerContainer}>
                <div className={classes.heading}>
                    <AppTitle/>
                </div>

                <List dense>
                    <ListSubheader disableSticky>Allgemein</ListSubheader>

                    <AppDrawerItem
                        icon={<HomeIcon/>}
                        primary="Startseite"
                        to="/"
                    />

                    <AppDrawerItem
                        icon={<AccountCircleIcon/>}
                        primary="Profil bearbeiten"
                        to="/profile"
                    />

                    <AppDrawerItem
                        icon={<SearchIcon/>}
                        primary="Katalog durchsuchen"
                        to="/search"
                    />

                    <AppDrawerItem
                        icon={<StorageIcon/>}
                        primary="Prüfen"
                        to="/audit"
                        disabled
                    />

                    <AppDrawerItem
                        icon={<ImportExportIcon/>}
                        primary="Exportieren"
                        to="/export"
                        disabled
                    />

                    <ListSubheader disableSticky>Eingabe</ListSubheader>

                    <AppDrawerItem
                        icon={<DocumentEntity.Icon/>}
                        primary={DocumentEntity.titlePlural}
                        to={`/${DocumentEntity.path}`}
                    />

                    <AppDrawerItem
                        icon={<ModelEntity.Icon/>}
                        primary={ModelEntity.titlePlural}
                        to={`/${ModelEntity.path}`}
                    />

                    <AppDrawerItem
                        icon={<GroupEntity.Icon/>}
                        primary={GroupEntity.titlePlural}
                        to={`/${GroupEntity.path}`}
                    />

                    <AppDrawerItem
                        icon={<ClassEntity.Icon/>}
                        primary={ClassEntity.titlePlural}
                        to={`/${ClassEntity.path}`}
                    />

                    <AppDrawerItem
                        icon={<DataTemplateEntity.Icon/>}
                        primary={DataTemplateEntity.titlePlural}
                        to={`/${DataTemplateEntity.path}`}
                        disabled
                    />

                    <AppDrawerItem
                        icon={<PropertyGroupEntity.Icon/>}
                        primary={PropertyGroupEntity.titlePlural}
                        to={`/${PropertyGroupEntity.path}`}
                    />

                    <AppDrawerItem
                        icon={<PropertyEntity.Icon/>}
                        primary={PropertyEntity.titlePlural}
                        to={`/${PropertyEntity.path}`}
                    />

                    <AppDrawerItem
                        icon={<ValueEntity.Icon/>}
                        primary={ValueEntity.titlePlural}
                        to={`/${ValueEntity.path}`}
                    />
                </List>
            </div>
        </Drawer>
    );
}

export default AppDrawer;
