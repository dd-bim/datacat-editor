import Paper, { PaperProps } from "@mui/material/Paper";
import React from "react";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Link } from "@mui/material";
import { T } from "@tolgee/react";

// Replace makeStyles with styled components
const FooterContainer = styled('div')(({ theme }) => ({
  display: "flex",
  justifyContent: "end",
  marginTop: theme.spacing(3),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
}));

export default function Footer(props: PaperProps) {
  return (
    <FooterContainer>
      <StyledPaper variant="outlined">
        <Typography variant="body2">
          <Link
            target="_blank"
            rel="noopener"
            href="https://www.htw-dresden.de/hochschule/fakultaeten/geoinformation/ueber-uns/personen/professoren/prof-dr-ing-christian-clemen"
          >
            <T keyName="footer.contact">Fragen & Kontakt</T>
          </Link>
        </Typography>
        <Typography variant="body2">
          <Link
            target="_blank"
            rel="noopener"
            href="https://github.com/dd-bim/datacat/issues"
          >
            <T keyName="footer.report_issue">Problem melden</T>
          </Link>
        </Typography>
        <Typography variant="caption">
          datacat editor {import.meta.env.VITE_APP_VERSION}
        </Typography>
      </StyledPaper>
    </FooterContainer>
  );
}
