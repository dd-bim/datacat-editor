import React from "react";
import {Typography, TypographyProps} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {Theme} from "@mui/material/styles";

export type FormSetProps = {
    className?: string;
    children: React.ReactNode;
};
const useStyles = makeStyles((theme: Theme) => ({
    root: {
        marginBottom: theme.spacing(3),
        border: `1px solid ${theme.palette.grey[100]}`,
        padding: theme.spacing(1),
        '& > .MuiTypography-root + *': {
            marginTop: theme.spacing(1.5), // Adds space after any Typography component
        },
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
