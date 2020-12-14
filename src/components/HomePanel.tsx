import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import React from "react";

export function HomePanel() {
    return <>
        <Typography variant="h4">
            Willkommen bei datacat
        </Typography>

        <Typography variant="h5">Über das Projekt</Typography>
        <Typography variant="body1" paragraph>
            Die datacat-Plattform stellt eine projektübergreifende Forschungsarbeit des <b>Lehrbereichs "Geodäsie und
            BIM"
            der Fakultät Geoinformation der <Link
                href="https://www.htw-dresden.de/hochschule/fakultaeten/geoinformation/ueber-uns/personen/professoren/prof-dr-ing-christian-clemen"
                target="_blank" rel="noopener">
                Hochschule für Technik und Wirtschaft Dresden</Link> (HTW Dresden)</b> dar. Die Plattform
            zielt darauf ab, benutzer- und entwicklerfreundliche Komponenten für die Erarbeitung und Veröffentlichung
            von Klassifikationssystemen, Objektartenkatalogen und Merkmalsdatenbanken im Kontext der BIM-Methode zur
            Verfügung zu stellen.
        </Typography>

        <Typography variant="h5">Die Komponenten</Typography>
        <Typography variant="body1" paragraph>
            Die Plattform gliedert sich derzeit in die Kernkomponenten <b>datacat API</b>, einer entwicklerfreundlichen,
            selbstdokumentierenden GraphQL-Schnittstelle für komplexe Abfragen auf den Datenkatalog und dem <b>datacat
            editor</b>, einem browsergestützten Benutzerwerkzeug zur Navigation und Bearbeitung des Datenbestands.
        </Typography>

        <Typography variant="h5">Die Methodik</Typography>
        <Typography variant="body1" paragraph>
            Mittelpunkt der Entwicklung ist ein nah an den etablierten Standards <Link
            href="https://www.beuth.de/de/norm/din-en-iso-12006-3/263869434" target="_blank" rel="noopener">DIN EN ISO
            12006-3</Link> („Bauwesen -
            Organisation von Daten zu Bauwerken - Teil 3: Struktur für den objektorientierten Informationsaustausch“)
            und <Link href="https://www.beuth.de/de/norm/din-en-iso-23387/322401351" target="_blank" rel="noopener">DIN
            EN ISO 23387</Link> („Bauwerksinformationsmodellierung (BIM) - Datenvorlagen für Bauobjekte während des
            Lebenszyklus eines baulichen Vermögensgegenstandes - Konzepte und Grundsätze“) angelehntes Datenschema, das
            es ermöglichen soll auch komplexe Klassifikationssysteme im Katalog zu pflegen. Die zur Verfügung stehende
            API ist dabei völlig agnostisch gegenüber der anwendungsfallbezogenen Struktur, die im eigenen Datenkatalog
            umgesetzt werden soll, sie stellt lediglich sicher, dass die oben genannten Standards eingehalten werden.
            Die Anwendung „datacat editor“ ergänzt diesen Ansatz durch eine konkrete Ausgestaltung einer
            Benutzeroberfläche auf Basis dieser API für die Vorstandardisierungsarbeit in der Fachgruppe
            „BIM-Verkehrswege“ des buildingSMART e.V. Deutschland. Hierfür wird die durch die Fachgruppe definierte
            Fachanwendersicht auf das generische ISO 12006-3-Framework übertragen.
        </Typography>

        <Typography variant="h5">Open Source</Typography>
        <Typography variant="body1" paragraph>
            <b>datacat wird als freie, quelloffene Software unter der GPLv3 Lizenz entwickelt</b> und kann durch jeden,
            auch
            kommerziell genutzt und vervielfältigt werden. Der Quellcode wird auf <Link
            href="https://github.com/dd-bim/datacat" target="_blank" rel="noopener">GitHub</Link> gehostet. Jeder Art
            der
            Unterstützung des Projekts ist willkommen.
        </Typography>
    </>;
}
