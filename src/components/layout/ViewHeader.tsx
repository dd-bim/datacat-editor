import {Typography} from "@material-ui/core";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme => ({
    subtitle: {
        'color': theme.palette.text.hint
    }
}));

type ViewHeaderProps = {
    title: string
    subtitle?: string
}

export default function ViewHeader(props: ViewHeaderProps) {
    const { title, subtitle } = props;
    const classes = useStyles();

    return (
        <React.Fragment>
            <Typography
                variant="h5"
                gutterBottom={!subtitle}
            >
                {title}
            </Typography>
            {subtitle && (
                <Typography
                    className={classes.subtitle}
                    variant="subtitle1"
                    gutterBottom
                >
                    {subtitle}
                </Typography>
            )}
        </React.Fragment>
    )
}
