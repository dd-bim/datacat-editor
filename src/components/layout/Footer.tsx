import Paper, {PaperProps} from "@material-ui/core/Paper";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import {Link} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    footer: {
        display: "flex",
        justifyContent: "end",
        marginTop: theme.spacing(3)
    },
    paper: {
        padding: theme.spacing(1)
    }
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
                        Fragen & Kontakt
                    </Link>
                </Typography>
                <Typography variant="body2">
                    <Link
                        target="_blank"
                        rel="noopener"
                        href="https://github.com/dd-bim/datacat"
                    >
                        Problem melden
                    </Link>
                </Typography>
                <Typography variant="caption">
                    {process.env.REACT_APP_TITLE} {process.env.REACT_APP_VERSION}
                </Typography>
            </Paper>
        </div>
    );
}
