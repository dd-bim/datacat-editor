import React, {FC} from "react";
import {Paper, TypographyProps} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";

type ViewProps = {
    heading: React.ReactNode
    HeadingProps?: TypographyProps
}

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(3)
    },
    heading: {
        marginBottom: theme.spacing(1)
    }
}));

const View: FC<ViewProps> = (props) => {
    const {
        heading,
        HeadingProps,
        children
    } = props;
    const classes = useStyles();

    return (
        <Paper className={classes.root}>
            <Typography className={classes.heading} variant="h4" {...HeadingProps}>{heading}</Typography>
            {children}
        </Paper>
    )
}

export default View;
