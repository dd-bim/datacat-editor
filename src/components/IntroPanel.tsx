import {Paper} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme => ({
    paper: {
        padding: theme.spacing(2),
    },
    paragraph: {
        marginBottom: theme.spacing(3)
    }
}));

export default function IntroPanel() {
    const classes = useStyles();

    return (
        <Paper className={classes.paper} variant={"outlined"}>
            <Typography gutterBottom>
                datacat editor ist ein webbasiertes, OpenSource Arbeitswerkzeug zum gemeinsamen Entwickeln von
                Datenkatalogen für die Bauindustrie. Der Quellcode wird unter der GPL v3 Lizenz zur Verfügung
                gestellt.
            </Typography>
            <Typography gutterBottom>
                In einem Datenkatalog können Sie Konzepte wie Akteure, Aktivitäten, Bauteile und Merkmale
                mehrsprachig benennen, beschreiben und nach Ihrer Funktion und Gestalt standardkonform
                kategorisieren.
                Durch das Bilden von Beziehungen zwischen diesen Konzepten, kann die bebaute Umwelt schließlich
                näher beschrieben werden.
            </Typography>
            <Typography gutterBottom>
                Der entwickelte Datenbestand steht zum Abruf über eine API für Entwickler von
                Import/Export-Werkzeugen
                und CAD/BIM-Plugins zur Verfügung. Zukünftig sollen Prüfroutinen entwickelt werden, die es
                erlauben
                Inkonsistenzen wie ungenutzte Konzepte, mögliche Duplikate, und fehlende Übersetzungen im
                Katalog
                ausfindig zu machen.
            </Typography>
            <Typography gutterBottom>
                datacat wird an der Hochschule für Technik und Wirtschaft Dresden (HTW Dresden) entwickelt.
                Wenn Sie weiteres Interesse am Projekt oder Fragen zur Anwendung haben, kontaktieren Sie
                uns gern direkt über die unten genannten Daten.
            </Typography>
            <Typography gutterBottom>
                <b>
                    Es handelt sich um ein Software-Preview. Ihre direkte Mitwirkung als OpenSource-Entwickler oder
                    indirekt durch die Gabe von Feedback ist sehr erwünscht.
                </b>
            </Typography>
        </Paper>
    );
}
