import React, { FC } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { usePropertyTreeQuery } from "../generated/types";

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    border: "2px solid #ccc",
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    margin: theme.spacing(2),
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
  },
  thTd: {
    border: "1px solid #ddd",
    padding: theme.spacing(1),
    textAlign: "left" as const,
  },
  th: {
    backgroundColor: "#f2f2f2",
  },
  trEven: {
    backgroundColor: "#f9f9f9",
  },
  clickableRow: {
    cursor: "pointer",
  },
}));

const GridViewView: FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const { path, url } = useRouteMatch();
  const { loading, error, data } = usePropertyTreeQuery({});

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const nodes = data?.hierarchy?.nodes || [];

  const groupedNodes: { [key: string]: any[] } = nodes.reduce(
    (acc: { [key: string]: any[] }, node: any) => {
      const relationId = node.relationId || "undefined";
      if (!acc[relationId]) acc[relationId] = [];
      acc[relationId].push(node);
      return acc;
    },
    {}
  );

  const mapRecordTypeToColumn = (node: any, column: string) => {
    const tags = node.tags || [];
    console.log(tags);
    switch (column) {
      case "document":
        return node.recordType === "ExternalDocument" ? node.name : "";
      case "model":
        for (const tag of tags) {
          if (tag.id === "6f96aaa7-e08f-49bb-ac63-93061d4c5db2") {
            return node.name || "";
          }
        }
        return "";
      case "group":
        for (const tag of tags) {
          if (tag.id === "5997da9b-a716-45ae-84a9-e2a7d186bcf9") {
            return node.name || "";
          }
        }
        return "";
      case "class":
        return node.recordType === "Subject" ? node.name : "";
      case "feature":
        return node.recordType === "Property" ? node.name : "";
      case "featureGroup":
        return node.recordType === "Nest" ? node.name : "";
      case "size":
        return node.recordType === "Measure" ? node.name : "";
      case "unit":
        return node.recordType === "Unit" ? node.name : "";
      case "value":
        return node.recordType === "Value" ? node.name : "";
      default:
        return "";
    }
  };

  return (
    <div className={classes.tableContainer}>
      <table className={classes.table}>
        <thead>
          <tr>
            <th className={`${classes.th} ${classes.thTd}`}>Referenzdokument</th>
            <th className={`${classes.th} ${classes.thTd}`}>Fachmodell</th>
            <th className={`${classes.th} ${classes.thTd}`}>Gruppe</th>
            <th className={`${classes.th} ${classes.thTd}`}>Klasse</th>
            <th className={`${classes.th} ${classes.thTd}`}>Merkmal</th>
            <th className={`${classes.th} ${classes.thTd}`}>Merkmalgruppe</th>
            <th className={`${classes.th} ${classes.thTd}`}>Größe</th>
            <th className={`${classes.th} ${classes.thTd}`}>Einheit</th>
            <th className={`${classes.th} ${classes.thTd}`}>Wert</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedNodes).map(
            ([relationId, group]: [string, any[]]) => {
              return group.map((node, index) => {
                const currentDocument = mapRecordTypeToColumn(node, "document");
                const currentModel = mapRecordTypeToColumn(node, "model");
                const currentGroup = mapRecordTypeToColumn(node, "group");
                const currentClass = mapRecordTypeToColumn(node, "class");
                const currentFeature = mapRecordTypeToColumn(node, "feature");
                const currentFeatureGroup = mapRecordTypeToColumn(
                  node,
                  "featureGroup"
                );
                const currentSize = mapRecordTypeToColumn(node, "size");
                const currentUnit = mapRecordTypeToColumn(node, "unit");
                const currentValue = mapRecordTypeToColumn(node, "value");

                return (
                  <tr
                    key={`relation-${relationId}-node-${index}`}
                    className={index % 2 === 0 ? classes.trEven : undefined}
                  >
                    <td className={classes.thTd}>{currentDocument}</td>
                    <td className={classes.thTd}>{currentModel}</td>
                    <td className={classes.thTd}>{currentGroup}</td>
                    <td className={classes.thTd}>{currentClass}</td>
                    <td className={classes.thTd}>{currentFeature}</td>
                    <td className={classes.thTd}>{currentFeatureGroup}</td>
                    <td className={classes.thTd}>{currentSize}</td>
                    <td className={classes.thTd}>{currentUnit}</td>
                    <td className={classes.thTd}>{currentValue}</td>
                  </tr>
                );
              });
            }
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GridViewView;
