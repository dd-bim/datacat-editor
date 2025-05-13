import React from "react";
import { Paper, TypographyProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

type ViewProps = {
    heading: React.ReactNode
    HeadingProps?: TypographyProps
    children?: React.ReactNode
}

// Replace makeStyles with styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3)
}));

const HeadingTypography = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1)
}));

const View = (props: ViewProps) => {
    const {
        heading,
        HeadingProps,
        children
    } = props;

    return (
        <StyledPaper>
            <HeadingTypography variant="h4" {...HeadingProps}>{heading}</HeadingTypography>
            {children}
        </StyledPaper>
    )
}

export default View;
