import { Paper } from "@mui/material";
import Typography from "@mui/material/Typography";
import React from "react";
import { styled } from "@mui/material/styles";
import { T } from "@tolgee/react";

// Replace makeStyles with styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
}));

export default function IntroPanel() {
  return (
    <StyledPaper variant="outlined">
      <Typography gutterBottom>
        <T keyName="intro.description1">
          datacat editor ist ein webbasiertes, OpenSource Arbeitswerkzeug zum gemeinsamen Entwickeln von Datenkatalogen
          für die Bauindustrie. Der Quellcode wird unter der MIT Lizenz zur Verfügung gestellt.
        </T>
      </Typography>
      <Typography gutterBottom>
        <T keyName="intro.description2">
          In einem Datenkatalog können Sie Konzepte wie Akteure, Aktivitäten, Bauteile und Merkmale mehrsprachig
          benennen, beschreiben und nach Ihrer Funktion und Gestalt standardkonform kategorisieren. Durch das Bilden von
          Beziehungen zwischen diesen Konzepten, kann die bebaute Umwelt schließlich näher beschrieben werden.
        </T>
      </Typography>
      <Typography gutterBottom>
        <T keyName="intro.description3">
          Der entwickelte Datenbestand steht zum Abruf über eine API für Entwickler von Import/Export-Werkzeugen und
          CAD/BIM-Plugins zur Verfügung. Zukünftig sollen Prüfroutinen entwickelt werden, die es erlauben Inkonsistenzen
          wie ungenutzte Konzepte, mögliche Duplikate, und fehlende Übersetzungen im Katalog ausfindig zu machen.
        </T>
      </Typography>
      <Typography gutterBottom>
        <T keyName="intro.description4">
          datacat wird an der Hochschule für Technik und Wirtschaft Dresden (HTW Dresden) entwickelt. Wenn Sie weiteres
          Interesse am Projekt oder Fragen zur Anwendung haben, kontaktieren Sie uns gern direkt über die unten
          genannten Daten.
        </T>
      </Typography>
      <Typography gutterBottom>
        <b>
          <T keyName="intro.call_to_action">
            Es handelt sich um ein Software-Preview. Ihre direkte Mitwirkung als OpenSource-Entwickler oder indirekt
            durch die Gabe von Feedback ist sehr erwünscht.
          </T>
        </b>
      </Typography>
    </StyledPaper>
  );
}
