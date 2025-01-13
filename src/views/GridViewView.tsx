import { FC, useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  usePropertyTreeQuery,
  useGetBagLazyQuery,
  useAddTagMutation,
  useFindTagsQuery,
} from "../generated/types";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import { useSnackbar } from "notistack";

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    border: "2px solid #ccc",
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    margin: theme.spacing(2),
    overflowX: "auto",
    backgroundColor: theme.palette.background.paper,
  },
  fixedContainer: {
    position: "sticky",
    top: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: 3,
    padding: theme.spacing(2),
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  scrollableContainer: {
    maxHeight: "calc(100vh - 300px)", // Adjust this value based on the height of the fixed container
    overflowY: "auto",
    backgroundColor: theme.palette.background.paper,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    tableLayout: "fixed",
  },
  thTd: {
    border: "1px solid #ddd",
    padding: theme.spacing(1),
    textAlign: "left" as const,
    wordWrap: "break-word",
  },
  checkboxThTd: {
    border: "1px solid #ddd",
    padding: theme.spacing(1),
    textAlign: "center" as const,
    width: "50px",
  },
  checkboxTd: {
    border: "1px solid #ddd",
    padding: theme.spacing(1),
    textAlign: "center" as const,
    width: "50px",
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
  tagChip: {
    margin: theme.spacing(0.5),
    fontSize: theme.typography.fontSize,
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  tagFilterTitle: {
    marginBottom: theme.spacing(1),
  },
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  tagControls: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
  },
  formControl: {
    minWidth: 200,
    marginRight: theme.spacing(2),
  },
  stickyHeader: {
    position: "sticky",
    top: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: 1,
  },
  filterContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    position: "sticky",
    top: 0,
    zIndex: 2,
  },
  chipContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
  },
  tableHeader: {
    position: "sticky",
    top: 50, // Adjust this value based on the height of the filterContainer
    backgroundColor: theme.palette.background.paper,
    zIndex: 1,
  },
  scrollabletable: {
    paddingLeft: "15px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: theme.palette.background.paper,
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
  const {
    loading: propertyTreeLoading,
    error: propertyTreeError,
    data: propertyTreeData,
  } = usePropertyTreeQuery({});
  const [getBag, { error: bagError }] = useGetBagLazyQuery();
  const [addTag] = useAddTagMutation();

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
  const [documentNames, setDocumentNames] = useState<{
    [key: string]: { name: string | null; id: string | null };
  }>({});
  const [modelIds, setModelIds] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [allSelected, setAllSelected] = useState<boolean>(false);
  const [newTag, setNewTag] = useState("");
  const { data, refetch } = useFindTagsQuery({ variables: { pageSize: 100 } });
  const [tags, setTags] = useState<string[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const handleCheckboxChange = useCallback((column: keyof VisibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  }, []);

  const [rows, setRows] = useState<any[]>([]);

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
    // Baue die URL korrekt zusammen
    const newUrl = `/${entityTypePath}/${id}`;
    history.push(newUrl); // Navigiere zur neuen URL
    window.location.reload();
  };

  const buildRows = () => {
    const rows: any[] = [];
    const seenCombinations = new Set();

    paths.forEach((path, index) => {
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
        tags: [],
        uniqueId: index,
      };

      path.forEach((id: string) => {
        const node = nodes.find((node) => node.id === id);
        if (node) {
          [
            "document",
            "model",
            "group",
            "class",
            "property",
            "propertyGroup",
          ].forEach((column) => {
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
      if (a.document !== b.document)
        return a.document.localeCompare(b.document);
      if (a.model !== b.model) return a.model.localeCompare(b.model);
      if (a.group !== b.group) return a.group.localeCompare(b.group);
      if (a.class !== b.class) return a.class.localeCompare(b.class);
      if (a.propertyGroup !== b.propertyGroup)
        return a.propertyGroup.localeCompare(b.propertyGroup);
      return a.property.localeCompare(b.property);
    });

    return rows;
  };

  const handleTagFilter = (tag: string | null) => {
    setSelectedTag(tag);
  };

  const handleRowSelection = (id: number) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = () => {
    const newSelectedRows = filteredRows.reduce((acc, row) => {
      acc[row.uniqueId] = !allSelected;
      return acc;
    }, {} as { [key: number]: boolean });
    setSelectedRows(newSelectedRows);
    setAllSelected(!allSelected);
  };

  const handleAddTag = async () => {
    if (!newTag) {
      enqueueSnackbar("Bitte wählen Sie ein Tag aus.", { variant: "error" });
      return;
    }

    enqueueSnackbar("Start Add Tags", { variant: "info" });

    let tagAdded = false;

    // Finde die passende tagId für den ausgewählten newTag
    const selectedTagObject = data?.findTags.nodes.find(
      (tag) => tag.name === newTag
    );
    const tagId = selectedTagObject ? selectedTagObject.id : null;

    if (!tagId) {
      enqueueSnackbar("Tag ID nicht gefunden.", { variant: "error" });
      return;
    }

    for (const [rowId, isSelected] of Object.entries(selectedRows)) {
      if (isSelected) {
        const row = filteredRows.find((r) => r.uniqueId.toString() === rowId);
        if (!row) continue;

        const entriesToUpdate = Object.entries(row.ids).filter(
          ([, id]) => typeof id === "string" && id.trim() !== ""
        );

        for (const [column, entryId] of entriesToUpdate) {
          const entryTags = row.tags.filter(
            (tag: { entryId: string }) => tag.entryId === entryId
          );

          const tagAlreadyExists = entryTags.some(
            (tag: { name: string }) => tag.name === newTag
          );

          if (tagAlreadyExists) {
            continue;
          }

          try {
            const { data } = await addTag({
              variables: {
                input: {
                  catalogEntryId: entryId as string,
                  tagId: tagId,
                },
              },
            });

            if (data) {
              tagAdded = true;
              row.tags.push({ entryId, name: newTag });
            }
          } catch (error) {
            console.error(
              `Fehler beim Hinzufügen des Tags zu Eintrag ${entryId}:`,
              error
            );
          }
        }
      }
    }

    try {
      if (tagAdded) {
        await refetch();
        enqueueSnackbar("End Add Tags", { variant: "info" });
      }
    } catch (error) {
      enqueueSnackbar("Fehler beim Aktualisieren der Tags.", {
        variant: "error",
      });
      console.error("Fehler beim Aktualisieren der Tags:", error);
    }
  };

  useEffect(() => {
    let rows = buildRows();

    if (selectedTag) {
      rows = rows.filter((row) =>
        row.tags.some((tag: any) => tag.name === selectedTag)
      );
    }

    const visibleColumnsArray = Object.keys(visibleColumns).filter(
      (key) => visibleColumns[key as keyof VisibleColumns]
    );
    if (visibleColumnsArray.length === 1) {
      const uniqueValues = new Set();
      const column = visibleColumnsArray[0];
      rows = rows.filter((row) => {
        const value = row.ids[column];
        if (uniqueValues.has(value)) {
          return false;
        } else {
          uniqueValues.add(value);
          return true;
        }
      });

      rows.sort((a, b) => {
        const valueA = a[column] || "";
        const valueB = b[column] || "";
        return valueA.localeCompare(valueB);
      });

      setEntityCount(uniqueValues.size);
    } else {
      setEntityCount(null);
    }

    setFilteredRows(rows);
  }, [visibleColumns, propertyTreeData, selectedTag]);

  useEffect(() => {
    const modelIds = Array.from(
      new Set(
        filteredRows.map((row) => row.ids.model).filter((id: string) => id)
      )
    );
    setModelIds(modelIds);
  }, [filteredRows]);

  useEffect(() => {
    let initialRows = buildRows();

    if (selectedTag) {
      initialRows = initialRows.filter((row) =>
        row.tags.some((tag: any) => tag.name === selectedTag)
      );
    }

    setRows(initialRows);
  }, [propertyTreeData, selectedTag, visibleColumns]);

  useEffect(() => {
    const fetchDocumentNames = async () => {
      const newDocumentData: {
        [key: string]: { name: string | null; id: string | null };
      } = {
        ...documentNames,
      };

      // Lade Dokumentennamen und IDs nur für IDs, die noch nicht aufgelöst wurden
      for (const id of modelIds) {
        if (!newDocumentData[id]) {
          try {
            const response = await getBag({ variables: { id } });
            const documentNode =
              response.data?.getBag?.documentedBy?.nodes[0]?.relatingDocument;
            const documentName = documentNode?.name || null;
            const documentId = documentNode?.id || null;
            newDocumentData[id] = { name: documentName, id: documentId };
          } catch (error) {
            console.error(
              `Fehler beim Laden des Referenzdokuments für ID ${id}:`,
              error
            );
          }
        }
      }

      setDocumentNames(newDocumentData); // Dokumentdaten speichern
    };

    if (modelIds.length > 0) {
      fetchDocumentNames();
    }
  }, [modelIds, getBag]);

  useEffect(() => {
    if (data) {
      setTags(data.findTags.nodes.map((tag) => tag.name));
    }
  }, [data]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const isAnyColumnHidden = Object.values(visibleColumns).some(
    (value) => !value
  );

  const excludedTags = [
    "Fachmodell",
    "Gruppe",
    "Klasse",
    "Merkmal",
    "Masseinheit",
    "Grösse",
    "Wert",
    "Maßeinheit",
    "Größe",
  ];

  const filterTags = (tags: string[]) =>
    tags.filter((tag) => !excludedTags.includes(tag));

  const allTags = filterTags(tags).sort();

  const handleTagChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setNewTag(event.target.value as string);
  };

  if (propertyTreeLoading) return <p>Tabelleninhalte werden geladen</p>;
  if (propertyTreeError) return <p>Error: {propertyTreeError.message}</p>;
  if (bagError) return <p>Error: {bagError.message}</p>;

  return (
    <div className={classes.tableContainer}>
      <div className={classes.fixedContainer}>
        <div className={classes.headerContainer}>
          <h3 className={classes.tagFilterTitle}>
            Filtermöglichkeit nach Tags
          </h3>
          <div className={classes.tagControls}>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel id="importTag-label">Tag auswählen</InputLabel>
              <Select
                labelId="importTag-label"
                id="importTag"
                label="Tag auswählen"
                name="importTag"
                value={newTag}
                onChange={handleTagChange}
              >
                <MenuItem value="">
                  <em>Tag auswählen</em>
                </MenuItem>
                {allTags.map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={handleAddTag}>
              Add Tag
            </Button>
          </div>
        </div>
        <div className={classes.tagButtonContainer}>
          {allTags.map((tag) => (
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
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleShowOnlyColumn("document")}
          >
            Nur Referenzdokumente anzeigen
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleShowOnlyColumn("model")}
          >
            Nur Fachmodelle anzeigen
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleShowOnlyColumn("group")}
          >
            Nur Gruppen anzeigen
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleShowOnlyColumn("class")}
          >
            Nur Klassen anzeigen
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleShowOnlyColumn("propertyGroup")}
          >
            Nur Merkmalsgruppen anzeigen
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleShowOnlyColumn("property")}
          >
            Nur Merkmale anzeigen
          </Button>
          {isAnyColumnHidden && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleShowAllColumns}
            >
              Alle Anzeigen
            </Button>
          )}
        </div>
        <table className={classes.table}>
          <thead className={classes.stickyHeader}>
            <tr>
              <th className={`${classes.th} ${classes.checkboxThTd}`}>
                <div className={classes.headerCell}>
                  <div className={classes.headerContent}>
                    <Checkbox
                      color="primary"
                      checked={allSelected}
                      onChange={handleSelectAll}
                    />
                  </div>
                </div>
              </th>
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
                        label={`Referenzdokumente${
                          entityCount !== null && visibleColumns.document
                            ? ` (${entityCount})`
                            : ""
                        }`}
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
                        label={`Fachmodelle${
                          entityCount !== null && visibleColumns.model
                            ? ` (${entityCount})`
                            : ""
                        }`}
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
                        label={`Gruppen${
                          entityCount !== null && visibleColumns.group
                            ? ` (${entityCount})`
                            : ""
                        }`}
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
                        label={`Klassen${
                          entityCount !== null && visibleColumns.class
                            ? ` (${entityCount})`
                            : ""
                        }`}
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
                            onChange={() =>
                              handleCheckboxChange("propertyGroup")
                            }
                            color="primary"
                          />
                        }
                        label={`Merkmalsgruppen${
                          entityCount !== null && visibleColumns.propertyGroup
                            ? ` (${entityCount})`
                            : ""
                        }`}
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
                        label={`Merkmale${
                          entityCount !== null && visibleColumns.property
                            ? ` (${entityCount})`
                            : ""
                        }`}
                        className={classes.checkboxLabel}
                      />
                    </div>
                  </div>
                </th>
              )}
            </tr>
          </thead>
        </table>
      </div>
      <div className={classes.scrollabletable}>
        <div className={classes.scrollableContainer}>
          <table className={classes.table}>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.uniqueId}
                  className={index % 2 === 0 ? classes.trEven : undefined}
                >
                  <td className={classes.checkboxTd}>
                    <Checkbox
                      checked={!!selectedRows[row.uniqueId]} // Zustand der Checkbox basierend auf der eindeutigen ID
                      onChange={() => handleRowSelection(row.uniqueId)} // Checkbox-Zustand für die eindeutige ID ändern
                      color="primary"
                    />
                  </td>
                  {visibleColumns.document && (
                    <td
                      className={`${classes.thTd} ${
                        documentNames[row.ids.model]?.id
                          ? classes.clickableRow
                          : ""
                      }`}
                      onClick={
                        documentNames[row.ids.model]?.id
                          ? () =>
                              handleOnSelect(
                                documentNames[row.ids.model]!.id as string,
                                "document"
                              )
                          : undefined
                      }
                    >
                      {documentNames[row.ids.model]?.name || row.document}
                    </td>
                  )}
                  {visibleColumns.model && (
                    <td
                      className={`${classes.thTd} ${
                        row.model ? classes.clickableRow : ""
                      }`}
                      onClick={
                        row.model
                          ? () => handleOnSelect(row.ids.model, "model")
                          : undefined
                      }
                    >
                      {row.model}
                    </td>
                  )}
                  {visibleColumns.group && (
                    <td
                      className={`${classes.thTd} ${
                        row.group ? classes.clickableRow : ""
                      }`}
                      onClick={
                        row.group
                          ? () => handleOnSelect(row.ids.group, "group")
                          : undefined
                      }
                    >
                      {row.group}
                    </td>
                  )}
                  {visibleColumns.class && (
                    <td
                      className={`${classes.thTd} ${
                        row.class ? classes.clickableRow : ""
                      }`}
                      onClick={
                        row.class
                          ? () => handleOnSelect(row.ids.class, "class")
                          : undefined
                      }
                    >
                      {row.class}
                    </td>
                  )}
                  {visibleColumns.propertyGroup && (
                    <td
                      className={`${classes.thTd} ${
                        row.propertyGroup ? classes.clickableRow : ""
                      }`}
                      onClick={
                        row.propertyGroup
                          ? () =>
                              handleOnSelect(
                                row.ids.propertyGroup,
                                "propertyGroup"
                              )
                          : undefined
                      }
                    >
                      {row.propertyGroup}
                    </td>
                  )}
                  {visibleColumns.property && (
                    <td
                      className={`${classes.thTd} ${
                        row.property ? classes.clickableRow : ""
                      }`}
                      onClick={
                        row.property
                          ? () => handleOnSelect(row.ids.property, "property")
                          : undefined
                      }
                    >
                      {row.property}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GridViewView;
