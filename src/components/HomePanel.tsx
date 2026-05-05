import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import React from "react";
import { T } from "@tolgee/react";
import { Box } from "@mui/material";

export function HomePanel() {
  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4">
        <T keyName="home.title">Willkommen bei datacat</T>
      </Typography>

      <Typography variant="h5" sx={{ mt: 3 }}>
        <T keyName="home.about.title">Über das Projekt</T>
      </Typography>
      <Typography variant="body1" component="p">
        <T keyName="home.about.description">
          Die datacat-Plattform stellt eine projektübergreifende Forschungsarbeit des Lehrbereichs "Geodäsie und BIM"
          der Fakultät Geoinformation der Hochschule für Technik und Wirtschaft Dresden (HTW Dresden) dar. Die Plattform
          zielt darauf ab, benutzer- und entwicklerfreundliche Komponenten für die Erarbeitung und Veröffentlichung von
          Klassifikationssystemen, Objektartenkatalogen und Merkmalsdatenbanken im Kontext der BIM-Methode zur
          Verfügung zu stellen.
        </T>
      </Typography>

      <Typography variant="h5">
        <T keyName="home.components.title">Die Komponenten</T>
      </Typography>
      <Typography variant="body1" component="p">
        <T keyName="home.components.description">
          Die Plattform gliedert sich derzeit in die Kernkomponenten datacat API, einer entwicklerfreundlichen,
          selbstdokumentierenden GraphQL-Schnittstelle für komplexe Abfragen auf den Datenkatalog und dem datacat
          editor, einem browsergestützten Benutzerwerkzeug zur Navigation und Bearbeitung des Datenbestands.
        </T>
      </Typography>

      <Typography variant="h5">
        <T keyName="home.methodology.title">Die Methodik</T>
      </Typography>
      <Typography variant="body1" component="p">
        <T keyName="home.methodology.description">
          Mittelpunkt der Entwicklung ist ein nah an den etablierten Standards DIN EN ISO 12006-3 und DIN EN ISO 23387
          angelehntes Datenschema, das es ermöglichen soll auch komplexe Klassifikationssysteme im Katalog zu pflegen.
          Die zur Verfügung stehende API ist dabei völlig agnostisch gegenüber der anwendungsfallbezogenen Struktur, die
          im eigenen Datenkatalog umgesetzt werden soll, sie stellt lediglich sicher, dass die oben genannten Standards
          eingehalten werden. Die Anwendung „datacat editor“ ergänzt diesen Ansatz durch eine konkrete Ausgestaltung
          einer Benutzeroberfläche auf Basis dieser API für die Vorstandardisierungsarbeit in der Fachgruppe
          „BIM-Verkehrswege“ des buildingSMART e.V. Deutschland. Hierfür wird die durch die Fachgruppe definierte
          Fachanwendersicht auf das generische ISO 12006-3-Framework übertragen.
        </T>
      </Typography>

      <Typography variant="h5">
        <T keyName="home.opensource.title">Open Source</T>
      </Typography>
      <Typography variant="body1" component="p">
        <T keyName="home.opensource.description">
          datacat wird als freie, quelloffene Software unter der MIT Lizenz entwickelt und kann durch jeden, auch
          kommerziell genutzt und vervielfältigt werden. Der Quellcode wird auf GitHub gehostet. Jeder Art der
          Unterstützung des Projekts ist willkommen.
        </T>
      </Typography>
    </Box>
  );
}
