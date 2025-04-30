import React from "react";
import {Typography, TypographyProps} from "@mui/material";
import { styled } from "@mui/material/styles";

// Replace makeStyles with styled component
const FormSetContainer = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(3),
    border: `1px solid ${theme.palette.grey[100]}`,
    padding: theme.spacing(1),
    '& > .MuiTypography-root + *': {
        marginTop: theme.spacing(1.5), // Adds space after any Typography component
    },
}));

export type FormSetProps = {
    className?: string;
    children: React.ReactNode;
};

export default function FormSet(props: FormSetProps) {
    const {className, children} = props;
    return (
        <FormSetContainer className={className}>
            {children}
        </FormSetContainer>
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
