import PetsIcon from "@material-ui/icons/Pets";
import Typography from "@material-ui/core/Typography";
import React, {FC} from "react";
import {makeStyles, Theme} from "@material-ui/core/styles";

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
            <PetsIcon className={classes.logo}/> <span>{process.env.REACT_APP_TITLE}</span>
        </Typography>
    )
}

export default AppTitle;
