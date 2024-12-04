import React, { FC, useState, useEffect, useMemo, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { usePropertyTreeQuery, useGetBagQuery } from "../generated/types";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import { gql } from "@apollo/client";

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    border: "2px solid #ccc",
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    margin: theme.spacing(2),
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    tableLayout: "auto",
  },
  thTd: {
    border: "1px solid #ddd",
    padding: theme.spacing(1),
    textAlign: "left" as const,
    wordWrap: "break-word",
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
  filterContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  buttonContainer: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  checkboxLabel: {
    marginLeft: theme.spacing(1),
  },
  headerCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tagButtonContainer: {
    display: "flex",
    flexWrap: "wrap",
    marginBottom: theme.spacing(2),
  },
  tagButton: {
    margin: theme.spacing(0.5),
  },
  tagChip: {
    margin: theme.spacing(0.5),
    fontSize: theme.typography.fontSize,
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  tagFilterTitle: {
    marginBottom: theme.spacing(1),
  },
}));

interface VisibleColumns {
  document: boolean;
  model: boolean;
  group: boolean;
  class: boolean;
  property: boolean;
  propertyGroup: boolean;
}

const GridViewView: FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const { loading: propertyTreeLoading, error: propertyTreeError, data: propertyTreeData } = usePropertyTreeQuery({});
  const { loading: bagLoading, error: bagError, data: bagData } = useGetBagQuery({
    variables: { id: "861c8539-bfaf-4b7d-acab-462ff06faa4a" },
  });

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    document: true,
    model: true,
    group: true,
    class: true,
    property: true,
    propertyGroup: true,
  });

  const [entityCount, setEntityCount] = useState<number | null>(null);
  const [filteredRows, setFilteredRows] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const handleCheckboxChange = useCallback((column: keyof VisibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  }, []);

  const handleShowOnlyColumn = useCallback((column: keyof VisibleColumns) => {
    setVisibleColumns({
      document: false,
      model: false,
      group: false,
      class: false,
      property: false,
      propertyGroup: false,
      [column]: true,
    });
    setEntityCount(null);
  }, []);

  const handleShowAllColumns = useCallback(() => {
    setVisibleColumns({
      document: true,
      model: true,
      group: true,
      class: true,
      property: true,
      propertyGroup: true,
    });
    setEntityCount(null);
  }, []);

  const nodes = propertyTreeData?.hierarchy?.nodes || [];
  const paths = propertyTreeData?.hierarchy?.paths || [];

  const mapRecordTypeToColumn = (node: any, column: string) => {
    const tags = node.tags || [];
    switch (column) {
      case "document":
        for (const tag of tags) {
          if (tag.id === "992c8887-301e-4764-891c-ae954426fc22") {
            return node.name || "";
          }
        }
        return "";
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
      case "property":
        return node.recordType === "Property" ? node.name : "";
      case "propertyGroup":
        return node.recordType === "Nest" ? node.name : "";
      default:
        return "";
    }
  };

  const getNodeById = (id: string) => nodes.find(node => node.id === id);

  const handleOnSelect = (id: string, column: string) => {
    let entityTypePath = "";
    switch (column) {
      case "document":
        entityTypePath = "document";
        break;
      case "model":
        entityTypePath = "model";
        break;
      case "group":
        entityTypePath = "group";
        break;
      case "class":
        entityTypePath = "class";
        break;
      case "property":
        entityTypePath = "property";
        break;
      case "propertyGroup":
        entityTypePath = "property-group";
        break;
      default:
        return;
    }
    const newUrl = `/${entityTypePath}/${id}`;
    history.push(newUrl);
    window.location.reload();
  };

  const buildRows = () => {
    const rows: any[] = [];
    const seenCombinations = new Set();

    paths.forEach(path => {
      const row: any = {
        document: "",
        model: "",
        group: "",
        class: "",
        property: "",
        propertyGroup: "",
        ids: {
          document: "",
          model: "",
          group: "",
          class: "",
          property: "",
          propertyGroup: "",
        },
        recordType: "",
        tags: []
      };

      path.forEach((id: string) => {
        const node = nodes.find(node => node.id === id);
        if (node) {
          ["document", "model", "group", "class", "property", "propertyGroup"].forEach(column => {
            const value = mapRecordTypeToColumn(node, column);
            if (value) {
              row[column] = value;
              row.ids[column] = node.id;
            }
          });
          row.recordType = node.recordType;
          row.tags = node.tags;
        }
      });

      const combinationKey = `${row.document}-${row.model}-${row.group}-${row.class}-${row.property}-${row.propertyGroup}`;
      if (!seenCombinations.has(combinationKey)) {
        seenCombinations.add(combinationKey);
        rows.push(row);
      }
    });

    rows.sort((a, b) => {
      if (a.document !== b.document) return a.document.localeCompare(b.document);
      if (a.model !== b.model) return a.model.localeCompare(b.model);
      if (a.group !== b.group) return a.group.localeCompare(b.group);
      if (a.class !== b.class) return a.class.localeCompare(b.class);
      if (a.propertyGroup !== b.propertyGroup) return a.propertyGroup.localeCompare(b.propertyGroup);
      return a.property.localeCompare(b.property);
    });

    return rows;
  };

  const handleTagFilter = (tag: string | null) => {
    setSelectedTag(tag);
  };

  useEffect(() => {
    let rows = buildRows();

    if (selectedTag) {
      rows = rows.filter(row => row.tags.some((tag: any) => tag.name === selectedTag));
    }

    const visibleColumnsArray = Object.keys(visibleColumns).filter(key => visibleColumns[key as keyof VisibleColumns]);
    if (visibleColumnsArray.length === 1) {
      const uniqueValues = new Set();
      const column = visibleColumnsArray[0];
      rows = rows.filter(row => {
        const value = row.ids[column];
        if (uniqueValues.has(value)) {
          return false;
        } else {
          uniqueValues.add(value);
          return true;
        }
      });

      rows.sort((a, b) => {
        const valueA = a[column] || '';
        const valueB = b[column] || '';
        return valueA.localeCompare(valueB);
      });

      setEntityCount(uniqueValues.size);
    } else {
      setEntityCount(null);
    }

    setFilteredRows(rows);
  }, [visibleColumns, propertyTreeData, selectedTag]);

  if (propertyTreeLoading || bagLoading) return <p>Tabelleninhalte werden geladen</p>;
  if (propertyTreeError) return <p>Error: {propertyTreeError.message}</p>;
  if (bagError) return <p>Error: {bagError.message}</p>;

  const isAnyColumnHidden = Object.values(visibleColumns).some(value => !value);

  const excludedTags = ["Fachmodell", "Gruppe", "Klasse", "Merkmal", "Masseinheit", "Grösse", "Wert", "Maßeinheit", "Größe"];
  const allTags = Array.from(new Set(nodes.flatMap(node => node.tags.map((tag: any) => tag.name))))
  .filter(tag => !excludedTags.includes(tag))
  .sort(); // Tags alphabetisch sortieren

  return (
    <div className={classes.tableContainer}>
      <h3 className={classes.tagFilterTitle}>Filtermöglichkeit nach Tags</h3>
      <div className={classes.tagButtonContainer}>
        {allTags.map(tag => (
          <Chip
            key={tag}
            label={tag}
            clickable
            color={selectedTag === tag ? "secondary" : "default"}
            onClick={() => handleTagFilter(tag)}
            className={classes.tagChip}
          />
        ))}
        <Chip
          label="Alle Anzeigen"
          clickable
          color={selectedTag === null ? "secondary" : "default"}
          onClick={() => handleTagFilter(null)}
          className={classes.tagChip}
        />
      </div>
      <div className={classes.buttonContainer}>
        <Button variant="contained" color="primary" onClick={() => handleShowOnlyColumn("document")}>
          Nur Referenzdokumente anzeigen
        </Button>
        <Button variant="contained" color="primary" onClick={() => handleShowOnlyColumn("model")}>
          Nur Fachmodelle anzeigen
        </Button>
        <Button variant="contained" color="primary" onClick={() => handleShowOnlyColumn("group")}>
          Nur Gruppen anzeigen
        </Button>
        <Button variant="contained" color="primary" onClick={() => handleShowOnlyColumn("class")}>
          Nur Klassen anzeigen
        </Button>
        <Button variant="contained" color="primary" onClick={() => handleShowOnlyColumn("propertyGroup")}>
          Nur Merkmalsgruppen anzeigen
        </Button>
        <Button variant="contained" color="primary" onClick={() => handleShowOnlyColumn("property")}>
          Nur Merkmale anzeigen
        </Button>
        {isAnyColumnHidden && (
          <Button variant="contained" color="secondary" onClick={handleShowAllColumns}>
            Alle Anzeigen
          </Button>
        )}
      </div>
      <table className={classes.table}>
        <thead>
          <tr>
            {visibleColumns.document && (
              <th className={`${classes.th} ${classes.thTd}`}>
                <div className={classes.headerCell}>
                  <div className={classes.headerContent}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={visibleColumns.document}
                          onChange={() => handleCheckboxChange("document")}
                          color="primary"
                        />
                      }
                      label={`Referenzdokumente${entityCount !== null && visibleColumns.document ? ` (${entityCount})` : ''}`}
                      className={classes.checkboxLabel}
                    />
                  </div>
                </div>
              </th>
            )}
            {visibleColumns.model && (
              <th className={`${classes.th} ${classes.thTd}`}>
                <div className={classes.headerCell}>
                  <div className={classes.headerContent}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={visibleColumns.model}
                          onChange={() => handleCheckboxChange("model")}
                          color="primary"
                        />
                      }
                      label={`Fachmodelle${entityCount !== null && visibleColumns.model ? ` (${entityCount})` : ''}`}
                      className={classes.checkboxLabel}
                    />
                  </div>
                </div>
              </th>
            )}
            {visibleColumns.group && (
              <th className={`${classes.th} ${classes.thTd}`}>
                <div className={classes.headerCell}>
                  <div className={classes.headerContent}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={visibleColumns.group}
                          onChange={() => handleCheckboxChange("group")}
                          color="primary"
                        />
                      }
                      label={`Gruppen${entityCount !== null && visibleColumns.group ? ` (${entityCount})` : ''}`}
                      className={classes.checkboxLabel}
                    />
                  </div>
                </div>
              </th>
            )}
            {visibleColumns.class && (
              <th className={`${classes.th} ${classes.thTd}`}>
                <div className={classes.headerCell}>
                  <div className={classes.headerContent}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={visibleColumns.class}
                          onChange={() => handleCheckboxChange("class")}
                          color="primary"
                        />
                      }
                      label={`Klassen${entityCount !== null && visibleColumns.class ? ` (${entityCount})` : ''}`}
                      className={classes.checkboxLabel}
                    />
                  </div>
                </div>
              </th>
            )}
            {visibleColumns.propertyGroup && (
              <th className={`${classes.th} ${classes.thTd}`}>
                <div className={classes.headerCell}>
                  <div className={classes.headerContent}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={visibleColumns.propertyGroup}
                          onChange={() => handleCheckboxChange("propertyGroup")}
                          color="primary"
                        />
                      }
                      label={`Merkmalsgruppen${entityCount !== null && visibleColumns.propertyGroup ? ` (${entityCount})` : ''}`}
                      className={classes.checkboxLabel}
                    />
                  </div>
                </div>
              </th>
            )}
            {visibleColumns.property && (
              <th className={`${classes.th} ${classes.thTd}`}>
                <div className={classes.headerCell}>
                  <div className={classes.headerContent}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={visibleColumns.property}
                          onChange={() => handleCheckboxChange("property")}
                          color="primary"
                        />
                      }
                      label={`Merkmale${entityCount !== null && visibleColumns.property ? ` (${entityCount})` : ''}`}
                      className={classes.checkboxLabel}
                    />
                  </div>
                </div>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row, index) => (
            <tr key={index} className={index % 2 === 0 ? classes.trEven : undefined}>
              {visibleColumns.document && (
                <td
                  className={`${classes.thTd} ${row.document ? classes.clickableRow : ''}`}
                  onClick={row.document ? () => handleOnSelect(row.ids.document, "document") : undefined}
                >
                  {row.document}
                  {bagData?.getBag?.documentedBy?.nodes.map((node, idx) => (
                    <div key={idx}>{node.relatingDocument.id}</div>
                  ))}
                </td>
              )}
              {visibleColumns.model && (
                <td
                  className={`${classes.thTd} ${row.model ? classes.clickableRow : ''}`}
                  onClick={row.model ? () => handleOnSelect(row.ids.model, "model") : undefined}
                >
                  {row.model}
                </td>
              )}
              {visibleColumns.group && (
                <td
                  className={`${classes.thTd} ${row.group ? classes.clickableRow : ''}`}
                  onClick={row.group ? () => handleOnSelect(row.ids.group, "group") : undefined}
                >
                  {row.group}
                </td>
              )}
              {visibleColumns.class && (
                <td
                  className={`${classes.thTd} ${row.class ? classes.clickableRow : ''}`}
                  onClick={row.class ? () => handleOnSelect(row.ids.class, "class") : undefined}
                >
                  {row.class}
                </td>
              )}
              {visibleColumns.propertyGroup && (
                <td
                  className={`${classes.thTd} ${row.propertyGroup ? classes.clickableRow : ''}`}
                  onClick={row.propertyGroup ? () => handleOnSelect(row.ids.propertyGroup, "propertyGroup") : undefined}
                >
                  {row.propertyGroup}
                </td>
              )}
              {visibleColumns.property && (
                <td
                  className={`${classes.thTd} ${row.property ? classes.clickableRow : ''}`}
                  onClick={row.property ? () => handleOnSelect(row.ids.property, "property") : undefined}
                >
                  {row.property}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GridViewView;