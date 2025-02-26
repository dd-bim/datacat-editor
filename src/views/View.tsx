import React, {FC} from "react";
import {Paper, TypographyProps} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Typography from "@mui/material/Typography";

type ViewProps = {
    heading: React.ReactNode
    HeadingProps?: TypographyProps
    children?: React.ReactNode
}

const useStyles = makeStyles((theme: { spacing: (factor: number) => number }) => ({
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
