import { FC, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import {
  usePropertyTreeQuery,
  useGetBagLazyQuery,
  useAddTagMutation,
  useFindTagsQuery,
} from "../generated/types";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import {
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { SelectChangeEvent } from "@mui/material/Select";
import { FixedSizeList as List } from "react-window";
import { Table, Column, AutoSizer } from "react-virtualized";
import "react-virtualized/styles.css";
import VirtualizedTable from "./VirtualizedTable"; // Passe den Pfad an, falls notwendig

const useStyles = makeStyles((theme: any) => ({
  tableContainer: {
    border: "2px solid #ccc",
    borderRadius: theme.spacing(1),
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    margin: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    overflow: "hidden",
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
    borderCollapse: "collapse", // Entfernt Abstände zwischen Zellen
  },
  thTd: {
    border: "1px solid #ddd",
    padding: "8px", // Einheitliches Padding
    textAlign: "left",
    backgroundColor: "#f9f9f9",
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  th: {
    backgroundColor: "#f2f2f2",
    fontWeight: "bold",
  },
  trEven: {
    backgroundColor: "#f9f9f9",
  },
  trOdd: {
    backgroundColor: "#ffffff",
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
  checkboxCell: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
  headerStyle: {
    backgroundColor: "#f2f2f2",
    fontWeight: "bold",
    textAlign: "left",
    padding: theme.spacing(1),
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
  row: {
    display: "flex",
    alignItems: "center",
  },
  rowStyle: {
    borderBottom: "1px solid #ddd",
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

interface RowData {
  uniqueId: number;
  document?: string;
  model?: string;
  group?: string;
  class?: string;
  propertyGroup?: string;
  property?: string;
}

interface Props {
  rows: RowData[];
  visibleColumns: {
    document: boolean;
    model: boolean;
    group: boolean;
    class: boolean;
    propertyGroup: boolean;
    property: boolean;
  };
  onSelectRow?: (uniqueId: number) => void;
  selectedRows?: { [key: number]: boolean };
}

const GridViewView: FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
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
  const [setFilteredRows] = useState<any[]>([]);
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

  const headerRef = useRef<HTMLTableElement>(null);
  const [columnWidths, setColumnWidths] = useState<number[]>([]);
  const headerHeight = headerRef.current
    ? headerRef.current.getBoundingClientRect().height
    : 50; // Fallback-Höhe

  useEffect(() => {
    if (headerRef.current) {
      const headerCols = Array.from(headerRef.current.querySelectorAll("th"));
      const widths = headerCols.map((col) => col.getBoundingClientRect().width);
      setColumnWidths(widths);
    }
  }, [visibleColumns, headerRef.current]);

  useEffect(() => {
    if (columnWidths.length > 0) {
      const bodyCols = Array.from(document.querySelectorAll("tbody td"));
      bodyCols.forEach((col, index) => {
        (col as HTMLElement).style.width = `${
          columnWidths[index % columnWidths.length]
        }px`;
      });
    }
  }, [columnWidths]);

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
    const newUrl = `/${entityTypePath}/${id}`;
    navigate(newUrl);
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
    const newSelectedRows = memoizedFilteredRows.reduce((acc, row) => {
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
        const row = memoizedFilteredRows.find(
          (r) => r.uniqueId.toString() === rowId
        );
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

  const memoizedFilteredRows = useMemo(() => {
    let rows = buildRows();
    console.log("Built rows:", rows);
  
    if (selectedTag) {
      rows = rows.filter((row) =>
        row.tags.some((tag: any) => tag.name === selectedTag)
      );
    }
  
    const visibleColumnsArray = Object.keys(visibleColumns).filter(
      (key) => visibleColumns[key as keyof VisibleColumns]
    );
  
    if (visibleColumnsArray.length === 1) {
      const column = visibleColumnsArray[0];
      const uniqueValues = new Set<string>();
  
      rows = rows.filter((row) => {
        const value = row[column];
        if (uniqueValues.has(value)) {
          return false;
        }
        uniqueValues.add(value);
        return true;
      });
  
      setEntityCount(uniqueValues.size);
    } else {
      setEntityCount(null);
    }
  
    console.log("Filtered rows:", rows);
    return rows;
  }, [visibleColumns, propertyTreeData, selectedTag]);
  
  useEffect(() => {
    const modelIds = Array.from(
      new Set(
        memoizedFilteredRows
          .map((row) => row.ids.model)
          .filter((id: string) => id)
      )
    );
    setModelIds(modelIds);
  }, [memoizedFilteredRows]);

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

  const handleTagChange = (event: SelectChangeEvent<string>) => {
    setNewTag(event.target.value as string);
  };

  if (propertyTreeLoading) return <p>Tabelleninhalte werden geladen</p>;
  if (propertyTreeError) return <p>Error: {propertyTreeError.message}</p>;
  if (bagError) return <p>Error: {bagError.message}</p>;

  console.log("Rows passed to VirtualizedTable:", memoizedFilteredRows);

  return (
    <div className={classes.tableContainer}>
      {/* Header: Filter und Aktionen */}
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
      </div>

      {/* Tabellen-Header */}
      <table ref={headerRef} className={classes.table}>
        <thead className={classes.stickyHeader}>
          <tr>
            <th className={`${classes.th} ${classes.checkboxThTd}`}>
              <div className={classes.headerCell}>
                <Checkbox
                  color="primary"
                  checked={allSelected}
                  onChange={handleSelectAll}
                />
              </div>
            </th>
            {visibleColumns.document && (
              <th className={`${classes.th} ${classes.thTd}`}>
                <div className={classes.headerCell}>Referenzdokumente</div>
              </th>
            )}
            {visibleColumns.model && (
              <th className={`${classes.th} ${classes.thTd}`}>
                <div className={classes.headerCell}>Fachmodelle</div>
              </th>
            )}
            {visibleColumns.group && (
              <th className={`${classes.th} ${classes.thTd}`}>
                <div className={classes.headerCell}>Gruppen</div>
              </th>
            )}
            {visibleColumns.class && (
              <th className={`${classes.th} ${classes.thTd}`}>
                <div className={classes.headerCell}>Klassen</div>
              </th>
            )}
            {visibleColumns.propertyGroup && (
              <th className={`${classes.th} ${classes.thTd}`}>
                <div className={classes.headerCell}>Merkmalsgruppen</div>
              </th>
            )}
            {visibleColumns.property && (
              <th className={`${classes.th} ${classes.thTd}`}>
                <div className={classes.headerCell}>Merkmale</div>
              </th>
            )}
          </tr>
        </thead>
      </table>

      {/* Tabellenbody mit VirtualizedTable */}
      <VirtualizedTable
        rows={memoizedFilteredRows}
        visibleColumns={visibleColumns}
        selectedRows={selectedRows}
        onSelectRow={(newSelectedRows) => setSelectedRows(newSelectedRows)}
      />
    </div>
  );
};

export default GridViewView;
