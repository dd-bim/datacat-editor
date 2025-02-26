import PetsIcon from "@mui/icons-material/Pets";
import Typography from "@mui/material/Typography";
import React, {FC} from "react";
import {makeStyles, Theme} from "@mui/styles";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        flexGrow: 1,
        display: "inline-flex",
        alignItems: "center"
    },
    logo: {
        marginRight: theme.spacing(1)
    }
}));

const AppTitle: FC = (props) => {
    const classes = useStyles();
    const {children, ...otherProps} = props;
    return (
        <Typography
            className={classes.root}
            variant="h5"
            component="h1"
            {...otherProps}
        >
            <PetsIcon className={classes.logo}/> <span>datacat editor</span>
        </Typography>
    )
}

export default AppTitle;
