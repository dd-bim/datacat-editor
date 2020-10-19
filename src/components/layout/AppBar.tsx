import Toolbar from "@material-ui/core/Toolbar";
import {makeStyles, Theme} from '@material-ui/core/styles';
import Button from "@material-ui/core/Button";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import MaterialUIAppBar from "@material-ui/core/AppBar";
import React from "react";
import {QuickSearchWidget} from "./QuickSearchWidget";
import useAuthContext, {useWriteAccess} from "../../hooks/useAuthContext";
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import {Tooltip} from "@material-ui/core";
import {useProfile} from "../../providers/ProfileProvider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from '@material-ui/icons/Menu';
import CreateEntrySplitButton from "../CreateEntrySplitButton";
import AppTitle from "./AppTitle";

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
