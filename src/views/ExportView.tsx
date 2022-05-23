import useHierarchy, {PropertyTreeNode} from "../hooks/useHierarchy";
import {usePropertyTreeQuery} from "../generated/types";
import Button from "@material-ui/core/Button";
import {getEntityType} from "../domain";
import View from "./View";
import React from "react";
import Typography from "@material-ui/core/Typography";
import dateUtil from "../dateUtil";

function saveAs(uri: string, filename: string) {
    const link = document.createElement('a');
    link.href = uri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function ExportView() {
    const {data} = usePropertyTreeQuery();
    const {nodes} = useHierarchy({
        leaves: data?.hierarchy.nodes ?? [],
        paths: data?.hierarchy.paths ?? []
    });

    const handleOnClick = () => {
        const rows: string[][] = [];
        const writeRow = (node: PropertyTreeNode) => {
            const definition = getEntityType(node.data.recordType, node.data.tags.map(x => x.id));

            if (definition.export) {
                let description;
                if (node.data.description) {
                    description = node.data.description.replace(/(\r\n|\n|\r)/gm, " ");
                }
                rows.push([
                    definition.title,
                    node.id,
                    `"${node.data.name ?? ""}"`,
                    `"${description ?? ""}"`
                ]);
            }
            node.children.forEach(writeRow);
        };
        nodes.forEach(writeRow);

        let set = new Set(rows.map(e => JSON.stringify(e)));
        let uniqueArr: string[][] = [];

        set.forEach(row => {
            uniqueArr.push(JSON.parse(row));

        })

        const csvContent = "data:text/csv;charset=utf-8," + uniqueArr.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const now = dateUtil().format("YYYY-MM-DD-HH-mm-ss");
        saveAs(encodedUri, `${now}_datacat_export.csv`);
    };

    return (
        <View heading="Katalog exportieren (Preview)">
            <Typography variant={"body1"} gutterBottom>
                Über Funktionen auf dieser Seite, haben Sie die Möglichkeit den Datenkatalog zu exportieren.
            </Typography>

            <Typography variant={"body2"}>
                Die nachfolgende Funktion erlaubt den Export des Datenkatalogs als einfache CSV-Datei.
                Die Ausgabe ist derzeit auf Fachmodelle, Gruppen und Klassen beschränkt. Die Ergebnisdatei
                ist in UTF-8 encodiert, verwendet Komma (,) als Trennzeichen und doppelte Anführungszeichen
                (") als Textqualifizierer.
            </Typography>
            <Button onClick={handleOnClick} disabled={!nodes.length}>CSV exportieren</Button>
        </View>
    );
}
