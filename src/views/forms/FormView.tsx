import React, { ReactNode } from "react";
import { styled } from "@mui/material/styles";

// Replace makeStyles with styled component
const StyledFormContainer = styled('div')(({ theme }) => ({
    // Uncomment and modify spacing if needed
    // "& > :not(:last-child)": {
    //     marginBottom: theme.spacing(1)
    // }
}));

export type FormProps<T> = {
    id: string;
    onDelete?(): void;
};

export type WithChildren<T> = T & {
    children?: ReactNode;
};

export default function FormView(props: WithChildren<{}>) {
    const { children } = props;

    return (
        <StyledFormContainer>
            {children}
        </StyledFormContainer>
    );
}
