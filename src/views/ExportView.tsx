import useHierarchy, {PropertyTreeNode} from "../hooks/useHierarchy";
import {useExportCatalogItemsQuery, usePropertyTreeQuery, ExportCatalogItem_Fragment, useExportCatalogItemsRelationshipsQuery, ExportCatalogItemRelationship_Fragment} from "../generated/types";
import Button from "@material-ui/core/Button";
import {getEntityType} from "../domain";
import View from "./View";
import React from "react";
import Typography from "@material-ui/core/Typography";
import dateUtil from "../dateUtil";
import JSZip from "jszip";
import FileSaver from "file-saver";

// function saveAs(uri: string, filename: string) {
//     const link = document.createElement('a');
//     link.href = uri;
//     link.download = filename;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// }

export function ExportView() {
    const {data: entity} = useExportCatalogItemsQuery();
    const {data: relation} = useExportCatalogItemsRelationshipsQuery();
    let loaded = false;
    if(relation && entity) loaded = true;

    let zip = new JSZip();

    const handleOnClick = () => {
        const entities: string[][] = [];
        const writeEntities = (node: ExportCatalogItem_Fragment) => {
            
                let description;
                if (node.description) {
                    description = node.description.replace(/(\r\n|\n|\r)/gm, " ");
                }
                entities.push([
                    node.id,
                    `"${node.typ ?? ""}"`,
                    `"${node.schlagworte ?? ""}"`,
                    `"${node.name ?? ""}"`,
                    `"${node.name_en ?? ""}"`,
                    `"${description ?? ""}"`,
                    `"${node.versionId ?? ""}"`,
                    `"${node.createdBy ?? ""}"`,
                    `"${node.created ?? ""}"`,
                    `"${node.lastModified ?? ""}"`,
                    `"${node.lastModifiedBy ?? ""}"`
                ]);
            
        };
        entity?.findExportCatalogItems.nodes.forEach(writeEntities);
        
        let entitySet = new Set(entities.map(e => JSON.stringify(e)));
        let entityArr: string[][] = [];

        entitySet.forEach(row => {
            entityArr.push(JSON.parse(row));
        })

        const csvEntity = "data:text/csv;charset=utf-8," 
        + "id,typ,schlagworte,name,name_en,description,versionId,createdBy,created,lastModified,lastModifiedBy\n"
        + entityArr.map(e => e.join(",")).join("\n");
        var entityBlob = new Blob([csvEntity], { type:"text/csv;charset=utf-8"});
        zip.file(`Entities.csv`, entityBlob);

        const relations: string[][] = [];
        const writeRelations = (node: ExportCatalogItemRelationship_Fragment) => {
            
                relations.push([
                    node.Entity1,
                    `"${node.Entity1Type}"`,
                    node.RelationId,
                    `"${node.RelationshipType}"`,
                    node.Entity2,
                    `"${node.Entity2Type}"`
                ]);
       
        };
        relation?.findExportCatalogItemsRelationships.nodes.forEach(writeRelations);
        
        let relationSet = new Set(relations.map(e => JSON.stringify(e)));
        let relationArr: string[][] = [];

        relationSet.forEach(row => {
            relationArr.push(JSON.parse(row));
        })

        const csvRelation = "data:text/csv;charset=utf-8," 
        + "Entity1,Entity1Type,RelationId,RelationshipType,Entity2,Entity2Type\n"
        + relationArr.map(e => e.join(",")).join("\n");
        var relationBlob = new Blob([csvRelation], { type:"text/csv;charset=utf-8"});
        zip.file(`Relationships.csv`, relationBlob);

        const now = dateUtil().format("YYYY-MM-DD-HH-mm-ss");
        zip.generateAsync({type:"blob"}).then(function(content) {FileSaver.saveAs(content, `${now}_datacat_export.zip`)});
    };

    // export function ExportView() {
    //     const {data} = usePropertyTreeQuery();
    //     const {nodes} = useHierarchy({
    //         leaves: data?.hierarchy.nodes ?? [],
    //         paths: data?.hierarchy.paths ?? []
    //     });
    //     // let r = 0;
    //     // console.log(data);
    //     // nodes.forEach((node) => {
    //     //     console.log(node);
    //     // })
    //     const handleOnClick = () => {
    //         // var entityCount = 0;
    //         const rows: string[][] = [];
    //         const writeRow = (node: PropertyTreeNode) => {
    //             const definition = getEntityType(node.data.recordType, node.data.tags.map(x => x.id));
                
    
    //             if (definition.export) {
    //                 let description;
    //                 if (node.data.description) {
    //                     description = node.data.description.replace(/(\r\n|\n|\r)/gm, " ");
    //                 }
    //                 rows.push([
    //                     definition.title,
    //                     node.id,
    //                     `"${node.data.name ?? ""}"`,
    //                     `"${description ?? ""}"`
    //                 ]);
    //             }
    //             node.children.forEach(writeRow);
    //         };
    //         nodes.forEach(writeRow);
            
    //         // console.log(rows.length);
    //         let set = new Set(rows.map(e => JSON.stringify(e)));
    //         let uniqueArr: string[][] = [];
    
    //         set.forEach(row => {
    //             uniqueArr.push(JSON.parse(row));
    
    //         })
    
    //         const csvContent = "data:text/csv;charset=utf-8," + uniqueArr.map(e => e.join(",")).join("\n");
    //         const encodedUri = encodeURI(csvContent);
    //         const now = dateUtil().format("YYYY-MM-DD-HH-mm-ss");
    //         saveAs(encodedUri, `${now}_datacat_export.csv`);
    // // r = entityCount;
    // // console.log("Count: " + entityCount);
    //     };

    return (
        <View heading="Katalog exportieren">
            <Typography variant={"body1"}>
                Der folgende Button startet den Download einer ZIP-Datei mit zwei CSV-Dateien im Inneren. <br/>
                Die Datei "Entities.csv" enthält alle Katalogeinträge mit deren Metadaten. 
                In der Datei "Relationships.csv" sind die Relationen gespeichert, die zwischen den Katalogeinträgen bestehen.  <br/>
                Die Ergebnisdatei ist in UTF-8 encodiert, verwendet Komma (,) als Trennzeichen und doppelte Anführungszeichen
                (") als Textqualifizierer.
            </Typography>
            {/* <Button onClick={handleOnClick} disabled={!nodes.length}>CSV exportieren</Button> */}
            <Button onClick={handleOnClick} disabled={!loaded}>CSV exportieren</Button>

        </View>
    );
}
