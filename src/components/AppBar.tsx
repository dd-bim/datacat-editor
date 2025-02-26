import Toolbar from "@mui/material/Toolbar";
import {makeStyles} from '@mui/styles';
import {Theme} from '@mui/material/styles';
import Button from "@mui/material/Button";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import MaterialUIAppBar from "@mui/material/AppBar";
import React from "react";
import useAuthContext, {useWriteAccess} from "../hooks/useAuthContext";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {Tooltip} from "@mui/material";
import {useProfile} from "../providers/ProfileProvider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from '@mui/icons-material/Menu';
import CreateEntrySplitButton from "./CreateEntrySplitButton";
import AppTitle from "./AppTitle";
import {QuickSearchWidget} from "./QuickSearchWidget";
import LanguageSwitcher from "./LanguageSwitcher";

const useStyles = makeStyles((theme: Theme) => ({
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    toolbar: {
        ...theme.mixins.toolbar,
        '& > *': {
            'margin-right': theme.spacing(1)
        }
    }
}));

type AppBarProps = {
    onClick?(): void;
}

export function AppBar(props: AppBarProps) {
    const {onClick} = props;
    const classes = useStyles();
    const {profile} = useProfile();
    const {logout} = useAuthContext();
    const verifiedUser = useWriteAccess();

    return (
        <MaterialUIAppBar position="fixed" className={classes.appBar}>
            <Toolbar className={classes.toolbar}>
                {onClick && profile && (
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={onClick}
                        edge="start"
                    >
                        <MenuIcon/>
                    </IconButton>
                )}
                <AppTitle/>
                {profile && (
                    <React.Fragment>
                        <QuickSearchWidget key="search-input"/>

                        <CreateEntrySplitButton/>

                        <LanguageSwitcher /> {/* Sprachumschalter hinzufügen */}

                        <Button key="logout-button"
                                variant="outlined"
                                color="inherit"
                                aria-label="logout"
                                startIcon={verifiedUser ? (
                                    <Tooltip title="Durch den Administrator bestätigter Benutzer">
                                        <VerifiedUserIcon/>
                                    </Tooltip>
                                ) : (
                                    <Tooltip title="Durch den Administrator unbestätigter Benutzer (nur lesender Zugriff)">
                                        <ErrorOutlineIcon/>
                                    </Tooltip>
                                )}
                                endIcon={<ExitToAppIcon/>}
                                onClick={() => logout()}
                        >
                            {profile.username}
                        </Button>
                    </React.Fragment>
                )}
            </Toolbar>
        </MaterialUIAppBar>
    );
}
