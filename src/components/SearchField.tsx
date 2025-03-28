import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import InputBase, {InputBaseProps} from "@mui/material/InputBase";
import {alpha, Theme} from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme: Theme) => ({
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
        width: '100%',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingRight: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '30ch',
            },
        },
    },
    searchResults: {
        'z-index': theme.zIndex.modal
    },
    searchContent: {
        'margin-top': theme.spacing(1),
        'min-width': '150px',
        'max-width': '75vw',
        'padding': theme.spacing(2)
    },
    entityIcon: {
        'min-width': 32
    }
}));

export default function SearchField(props: InputBaseProps) {
    const classes = useStyles();

    return (
        <div className={classes.search}>
            <InputBase
                classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput,
                }}
                {...props}
            />
            <div className={classes.searchIcon}>
                <SearchIcon/>
            </div>
        </div>
    );
}