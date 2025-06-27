import { useExportCatalogRecordsQuery, ExportCatalogRecord_Fragment, useExportCatalogRecordsRelationshipsQuery, ExportCatalogRecordRelationship_Fragment } from "../generated/types";
import Button from "@mui/material/Button";
import View from "./View";
import Typography from "@mui/material/Typography";
import dateUtil from "../dateUtil";
import JSZip from "jszip";
import FileSaver from "file-saver";
import { T } from "@tolgee/react";
import ontologyExport from "./OntologyExport";

export function ExportView() {
  const { data: entity, loading: entityLoading } = useExportCatalogRecordsQuery();
  const { data: relation, loading: relationLoading } = useExportCatalogRecordsRelationshipsQuery();
console.log("entity", entity);
console.log("relation", relation);
  const loaded = !entityLoading && !relationLoading && !!entity && !!relation;


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
        `"${node.type ?? ""}"`,
        `"${node.tags ?? ""}"`,
        `"${node.name ?? ""}"`,
        `"${node.name_en ?? ""}"`,
        `"${description ?? ""}"`,
        `${node.majorVersion ?? ""}`,
        `${node.minorVersion ?? ""}`,
        `"${node.createdBy ?? ""}"`,
        `"${node.created ?? ""}"`,
        `"${node.lastModified ?? ""}"`,
        `"${node.lastModifiedBy ?? ""}"`,
        `"${node.status ?? ""}"`,
        `"${node.languageOfCreator ?? ""}"`,
        `"${node.countryOfOrigin ?? ""}"`,
        `"${node.deprecationExplanation ?? ""}"`,
        `"${node.languages ?? ""}"`,
        `"${node.examples ?? ""}"`,
        `"${node.dataType ?? ""}"`,
        `"${node.dataFormat ?? ""}"`,
        `"${node.scale ?? ""}"`,
        `"${node.base ?? ""}"`,
        `"${node.uri ?? ""}"`,
        `"${node.author ?? ""}"`,
        `"${node.publisher ?? ""}"`,
        `"${node.isbn ?? ""}"`,
        `"${node.dateOfPublication ?? ""}"`
      ]);
    };
    entity?.findExportCatalogRecords.nodes.forEach(writeEntities);
    let entitySet = new Set(entities.map((e) => JSON.stringify(e)));
    let entityArr: string[][] = [];

    entitySet.forEach((row) => {
      entityArr.push(JSON.parse(row));
    });

    const csvEntity =
      "id;typ;tags;name;name_en;description;majorVersion;minorVersion;createdBy;created;lastModified;lastModifiedBy;status;languageOfCreator;countryOfOrigin;deprecationExplanation;languages;examples;datatype;dataFormat;scale;base;uri;author;publisher;isbn;dateOfPublication \n" +
      entityArr.map((e) => e.join(";")).join("\n");
    var entityBlob = new Blob([csvEntity], { type: "text/csv;charset=utf-8" });
    zip.file(`Entities.csv`, entityBlob);

    const relations: string[][] = [];
    const writeRelations = (node: ExportCatalogRecordRelationship_Fragment) => {
      relations.push([
        node.entity1,
        node.relationship,
        node.entity2
      ]);
    };
    relation?.findExportCatalogRecordsRelationships.nodes.forEach(writeRelations);

    let relationSet = new Set(relations.map((e) => JSON.stringify(e)));
    let relationArr: string[][] = [];

    relationSet.forEach((row) => {
      relationArr.push(JSON.parse(row));
    });

    const csvRelation =
      "entity1;relationship;entity2\n" +
      relationArr.map((e) => e.join(";")).join("\n");
    var relationBlob = new Blob([csvRelation], { type: "text/csv;charset=utf-8" });
    zip.file(`Relationships.csv`, relationBlob);

    const now = dateUtil().format("YYYY-MM-DD-HH-mm-ss");
    zip.generateAsync({ type: "blob" }).then(function (content) {
      FileSaver.saveAs(content, `${now}_datacat_export.zip`);
    });
  };

  const renderDescription = () => {
    return (
      <span style={{ whiteSpace: "pre-line" }}>
        <T keyName="export_view.description" />
      </span>
    );
  };

  return (
    <View heading={<T keyName="export_view.heading" />}>
      <Typography variant={"body1"}>
        {renderDescription()}
      </Typography>
      <Button onClick={handleOnClick} disabled={!loaded}>
        <T keyName="export_view.export_button" />
      </Button>
      <Button onClick={ontologyExport}>
        <T keyName="export_view.export_ontology_button" />
      </Button>
    </View>
  );
}
