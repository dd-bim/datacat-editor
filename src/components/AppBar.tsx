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
import {Tooltip, Box} from "@mui/material";
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
        display: 'flex',
        alignItems: 'center',
    },
    spacer: {
        marginRight: theme.spacing(2), // Consistent spacing between all elements
    },
    rightButtons: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: 'auto', // This pushes everything to the right
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
                    <Box className={classes.spacer}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={onClick}
                            edge="start"
                        >
                            <MenuIcon/>
                        </IconButton>
                    </Box>
                )}
                
                <Box className={classes.spacer}>
                    <AppTitle/>
                </Box>
                
                {profile && (
                    <Box className={classes.rightButtons}>
                        <Box className={classes.spacer}>
                            <QuickSearchWidget key="search-input"/>
                        </Box>

                        <Box className={classes.spacer}>
                            <CreateEntrySplitButton/>
                        </Box>

                        <Box className={classes.spacer}>
                            <LanguageSwitcher />
                        </Box>

                        <Box>
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
                        </Box>
                    </Box>
                )}
            </Toolbar>
        </MaterialUIAppBar>
    );
}
