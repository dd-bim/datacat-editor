import React from "react";
import {Typography, TypographyProps} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";

export type FormSetProps = {
    className?: string;
    children: React.ReactNode;
};

const useStyles = makeStyles(theme => ({
    root: {
        marginBottom: theme.spacing(3),
        border: `1px solid ${theme.palette.grey[100]}`,
        padding: theme.spacing(1)
    }
}));

export default function FormSet(props: FormSetProps) {
    const {className, children} = props;
    const classes = useStyles();

    return (
        <div className={`${classes.root} ${className}`}>
            {children}
        </div>
    );
}

export function FormSetTitle(props: TypographyProps) {
    const {children, ...otherProps} = props;
    return (
        <Typography variant="subtitle1" {...otherProps}>{children}</Typography>
    );
}

export function FormSetDescription(props: TypographyProps) {
    const {children, ...otherProps} = props;
    return (
        <Typography variant="body2" color="textSecondary" {...otherProps}>{children}</Typography>
    );
}

export function FormSetNotice(props: TypographyProps) {
    const {children, ...otherProps} = props;
    return (
        <Typography variant="body2" {...otherProps}>
            {children}
        </Typography>
    );
}
