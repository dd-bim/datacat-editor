import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import InputBase, {InputBaseProps} from "@mui/material/InputBase";
import {alpha, styled} from "@mui/material/styles";

// Replace makeStyles with styled components
const Search = styled('div')(({ theme }) => ({
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
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
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
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingRight: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '30ch',
            },
        },
    },
}));

// These appear to be used elsewhere, so keeping them as styled components
const SearchResults = styled('div')(({ theme }) => ({
    zIndex: theme.zIndex.modal
}));

const SearchContent = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(1),
    minWidth: '150px',
    maxWidth: '75vw',
    padding: theme.spacing(2)
}));

const EntityIcon = styled('div')({
    minWidth: 32
});

export default function SearchField(props: InputBaseProps) {
    return (
        <Search>
            <StyledInputBase {...props} />
            <SearchIconWrapper>
                <SearchIcon/>
            </SearchIconWrapper>
        </Search>
    );
}