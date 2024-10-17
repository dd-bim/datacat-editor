import {useExportCatalogItemsQuery, ExportCatalogRecord_Fragment, useExportCatalogItemsRelationshipsQuery, ExportCatalogRecordRelationship_Fragment} from "../generated/types";
import Button from "@material-ui/core/Button";
import View from "./View";
import Typography from "@material-ui/core/Typography";
import dateUtil from "../dateUtil";
import JSZip from "jszip";
import FileSaver from "file-saver";

export function ExportView() {
    const {data: entity} = useExportCatalogItemsQuery();
    const {data: relation} = useExportCatalogItemsRelationshipsQuery();
    let loaded = false;
    if(relation && entity) loaded = true;

    let zip = new JSZip();

    const handleOnClick = () => {
        const entities: string[][] = [];
        const writeEntities = (node: ExportCatalogRecord_Fragment) => {
            
                let description;
                if (node.description) {
                    description = node.description.replace(/(\r\n|\n|\r)/gm, " ");
                }
                entities.push([
                    node.id,
                    `${node.typ ?? ""}`,
                    `"${node.schlagworte ?? ""}"`,
                    `"${node.name ?? ""}"`,
                    `"${node.name_en ?? ""}"`,
                    `"${description ?? ""}"`,
                    `${node.versionId ?? ""}`,
                    `${node.createdBy ?? ""}`,
                    `${node.created ?? ""}`,
                    `${node.lastModified ?? ""}`,
                    `${node.lastModifiedBy ?? ""}`
                ]);
            
        };
        entity?.findExportCatalogItems.nodes.forEach(writeEntities);
        let entitySet = new Set(entities.map(e => JSON.stringify(e)));
        let entityArr: string[][] = [];

        entitySet.forEach(row => {
            entityArr.push(JSON.parse(row));
        })

        const csvEntity = "id;typ;tags;name;name_en;description;version;createdBy;created;lastModified;lastModifiedBy\n"
        + entityArr.map(e => e.join(";")).join("\n");
        var entityBlob = new Blob([csvEntity], { type:"text/csv;charset=utf-8"});
        zip.file(`Entities.csv`, entityBlob);

        const relations: string[][] = [];
        const writeRelations = (node: ExportCatalogRecordRelationship_Fragment) => {
            
                relations.push([
                    node.Entity1,
                    node.Entity1Type,
                    node.RelationId,
                    node.RelationshipType,
                    node.Entity2,
                    node.Entity2Type
                ]);
       
        };
        relation?.findExportCatalogItemsRelationships.nodes.forEach(writeRelations);
        
        let relationSet = new Set(relations.map(e => JSON.stringify(e)));
        let relationArr: string[][] = [];

        relationSet.forEach(row => {
            relationArr.push(JSON.parse(row));
        })

        const csvRelation = "entity1;entity1Type;relationId;relationshipType;entity2;entity2Type\n"
        + relationArr.map(e => e.join(";")).join("\n");
        var relationBlob = new Blob([csvRelation], { type:"text/csv;charset=utf-8"});
        zip.file(`Relationships.csv`, relationBlob);

        const now = dateUtil().format("YYYY-MM-DD-HH-mm-ss");
        zip.generateAsync({type:"blob"}).then(function(content) {FileSaver.saveAs(content, `${now}_datacat_export.zip`)});
    };

    return (
        <View heading="Katalog exportieren">
            <Typography variant={"body1"}>
                Der folgende Button startet den Download einer ZIP-Datei mit zwei CSV-Dateien im Inneren. <br/>
                Die Datei "Entities.csv" enthält alle Katalogeinträge mit deren Metadaten. 
                In der Datei "Relationships.csv" sind die Relationen gespeichert, die zwischen den Katalogeinträgen bestehen.  <br/>
                Die Ergebnisdatei ist in UTF-8 encodiert, verwendet Komma (,) als Trennzeichen und doppelte Anführungszeichen
                (") als Textqualifizierer. <br/><br/>
                Die Daten stehen zum Export bereit, sobald der Button nicht mehr ausgegraut ist.
            </Typography>
            <Button onClick={handleOnClick} disabled={!loaded}>CSV exportieren</Button>

        </View>
    );
}
