import Paper, { PaperProps } from "@mui/material/Paper";
import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import Typography from "@mui/material/Typography";
import { Link } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { T } from "@tolgee/react";

const useStyles = makeStyles((theme: Theme) => ({
  footer: {
    display: "flex",
    justifyContent: "end",
    marginTop: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(1),
  },
}));

export default function Footer(props: PaperProps) {
  const classes = useStyles();

  return (
    <div className={classes.footer}>
      <Paper className={classes.paper} variant="outlined">
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
      </Paper>
    </div>
  );
}
