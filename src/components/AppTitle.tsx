import PetsIcon from "@mui/icons-material/Pets";
import Typography from "@mui/material/Typography";
import React from "react";
import { styled } from "@mui/material/styles";

// Replace makeStyles with styled components
const StyledTypography = styled(Typography)<{ component?: React.ElementType }>({
    flexGrow: 1,
    display: "inline-flex",
    alignItems: "center"
});

const LogoIcon = styled(PetsIcon)(({ theme }) => ({
    marginRight: theme.spacing(1)
}));

// Use React.PropsWithChildren for proper typing
type AppTitleProps = React.PropsWithChildren<{
    [key: string]: any;
}>;

const AppTitle = (props: AppTitleProps) => {
    const { children, ...otherProps } = props;
    return (
        <StyledTypography
            variant="h5"
            component="h1"
            {...otherProps}
        >
            <LogoIcon /> <span>datacat editor</span>
        </StyledTypography>
    )
}

export default AppTitle;
