import React from "react";
import { useExportCatalogItemsQuery, ExportCatalogRecord_Fragment, useExportCatalogItemsRelationshipsQuery, ExportCatalogRecordRelationship_Fragment } from "../generated/types";
import Button from "@mui/material/Button";
import View from "./View";
import Typography from "@mui/material/Typography";
import dateUtil from "../dateUtil";
import JSZip from "jszip";
import FileSaver from "file-saver";
import { T, useTranslate } from "@tolgee/react";

export function ExportView() {
  const { data: entity } = useExportCatalogItemsQuery();
  const { data: relation } = useExportCatalogItemsRelationshipsQuery();
  let loaded = false;
  if (relation && entity) loaded = true;

  let zip = new JSZip();
  const { t } = useTranslate();

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
        `${node.lastModifiedBy ?? ""}`,
      ]);
    };
    entity?.findExportCatalogItems.nodes.forEach(writeEntities);
    let entitySet = new Set(entities.map((e) => JSON.stringify(e)));
    let entityArr: string[][] = [];

    entitySet.forEach((row) => {
      entityArr.push(JSON.parse(row));
    });

    const csvEntity =
      "id;typ;tags;name;name_en;description;version;createdBy;created;lastModified;lastModifiedBy\n" +
      entityArr.map((e) => e.join(";")).join("\n");
    var entityBlob = new Blob([csvEntity], { type: "text/csv;charset=utf-8" });
    zip.file(`Entities.csv`, entityBlob);

    const relations: string[][] = [];
    const writeRelations = (node: ExportCatalogRecordRelationship_Fragment) => {
      relations.push([
        node.Entity1,
        node.Entity1Type,
        node.RelationId,
        node.RelationshipType,
        node.Entity2,
        node.Entity2Type,
      ]);
    };
    relation?.findExportCatalogItemsRelationships.nodes.forEach(writeRelations);

    let relationSet = new Set(relations.map((e) => JSON.stringify(e)));
    let relationArr: string[][] = [];

    relationSet.forEach((row) => {
      relationArr.push(JSON.parse(row));
    });

    const csvRelation =
      "entity1;entity1Type;relationId;relationshipType;entity2;entity2Type\n" +
      relationArr.map((e) => e.join(";")).join("\n");
    var relationBlob = new Blob([csvRelation], { type: "text/csv;charset=utf-8" });
    zip.file(`Relationships.csv`, relationBlob);

    const now = dateUtil().format("YYYY-MM-DD-HH-mm-ss");
    zip.generateAsync({ type: "blob" }).then(function (content) {
      FileSaver.saveAs(content, `${now}_datacat_export.zip`);
    });
  };

  const renderDescription = () => {
    const description = t("export_view.description").split("\n");
    return (
      <>
        {description[0]}
        <br />
        {description[1]}
        {description[2]}
        <br />
        {description[3]}
        <br />
        <br />
        {description[4]}
        <br />
      </>
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
    </View>
  );
}
