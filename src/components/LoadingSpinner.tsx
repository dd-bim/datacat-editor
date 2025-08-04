import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const LoadingContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'fullscreen',
})<{ fullscreen?: boolean }>(({ theme, fullscreen }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  minHeight: fullscreen ? "100vh" : "200px",
  padding: theme.spacing(2),
}));

const StyledSpinner = styled(CircularProgress)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const LoadingText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: "center",
}));

type LoadingSpinnerProps = {
  message?: string;
  size?: number;
  fullscreen?: boolean;
  subMessage?: string;
};

export default function LoadingSpinner({
  message = "Wird geladen...",
  size = 40,
  fullscreen = false,
  subMessage,
}: LoadingSpinnerProps) {
  return (
    <LoadingContainer fullscreen={fullscreen}>
      <StyledSpinner size={size} />
      <LoadingText variant={fullscreen ? "h6" : "body1"}>
        {message}
      </LoadingText>
      {subMessage && (
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
          {subMessage}
        </Typography>
      )}
    </LoadingContainer>
  );
}
