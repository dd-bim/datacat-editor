import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
    usePropertyTreeQuery,
    useAddTagMutation,
    useFindTagsQuery,
    useFindItemQuery
} from "../generated/types";
import {
    Box,
    Chip,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Paper,
    Typography,
    Checkbox,
    SelectChangeEvent,
    LinearProgress,
    TextField,
    InputAdornment,
    Toolbar as MuiToolbar,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridRowSelectionModel,
    GridDensity
} from "@mui/x-data-grid";
import { T, useTranslate } from "@tolgee/react";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import GetAppIcon from "@mui/icons-material/GetApp";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import ViewComfyIcon from "@mui/icons-material/ViewComfy";
import ViewHeadlineIcon from "@mui/icons-material/ViewHeadline";
import LoadingSpinner from "../components/LoadingSpinner";
import { DictionaryEntity, DocumentEntity, ClassEntity, PropertyEntity, PropertyGroupEntity, ValueEntity, ValueListEntity, ThemeEntity } from "../domain";
import { useApolloClient } from "@apollo/client/react";

// Memoized constants außerhalb der Komponente
const EXCLUDED_TAGS = [
    "Dictionary",
    "Thema",
    "Klasse",
    "Merkmal",
    "Masseinheit",
    "Wert",
    "Maßeinheit",
    "Werteliste",
    "Merkmalsgruppe",
    "Referenzdokument"
] as const;

// Replace makeStyles with styled components
const MainContainer = styled(Box)(() => ({
    height: "100vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
}));

// Replace makeStyles with styled components
const TableContainer = styled(Paper)(({ theme }) => ({
    border: "2px solid #ccc",
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    margin: 0,
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0 // Wichtig für flex-shrinking
}));

const FixedContainer = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    zIndex: 3,
    padding: theme.spacing(1), // Noch weiter reduziertes Padding
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    flexShrink: 0, // Verhindert Schrumpfen
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: theme.spacing(1), // Reduziert von 2 auf 1
}));

const TagButtonContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexWrap: "wrap",
    marginBottom: theme.spacing(1), // Reduziert von 2 auf 1
}));

const TagChip = styled(Chip)(({ theme }) => ({
    margin: theme.spacing(0.5),
    fontSize: theme.typography.fontSize,
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    flexWrap: "wrap",
}));

const TagControls = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    minWidth: 200,
    marginRight: theme.spacing(2),
}));

const CustomToolbar = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1, 2),
    borderBottom: "1px solid #e0e0e0",
    backgroundColor: "#fafafa",
    gap: theme.spacing(1),
}));

const ToolbarSection = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
}));

// Styled Component für den Hilfstext
const MultiSelectHelpText = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
    fontStyle: "italic",
    marginLeft: theme.spacing(1),
}));

// Custom DataGrid Toolbar Component
const DataGridToolbar = memo(({
    searchText,
    onSearchChange,
    onExportCSV,
    totalRows,
    selectedRowsCount,
    density,
    onDensityChange,
    t,
}: {
    searchText: string;
    onSearchChange: (value: string) => void;
    onExportCSV: () => void;
    totalRows: number;
    selectedRowsCount: number;
    density: GridDensity;
    onDensityChange: (density: GridDensity) => void;
    t: any;
}) => (
    <CustomToolbar>
        <ToolbarSection>
            <TextField
                size="small"
                placeholder={t("grid_view.search_placeholder") || "Suchen..."}
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
                sx={{ minWidth: 250 }}
            />
            <Typography variant="body2" color="text.secondary">
                {totalRows} {t("grid_view.total_entries") || "Einträge gesamt"}
                {selectedRowsCount > 0 && ` | ${selectedRowsCount} ${t("grid_view.selected") || "ausgewählt"}`}
            </Typography>
            <MultiSelectHelpText>
                {t("grid_view.multiselect_help") || "Mehrfachauswahl: Strg + Klick"}
            </MultiSelectHelpText>
        </ToolbarSection>

        <ToolbarSection>
            <ToggleButtonGroup
                value={density}
                exclusive
                onChange={(_, newDensity) => newDensity && onDensityChange(newDensity)}
                size="small"
                aria-label={t("grid_view.table_density") || "Tabellendichte"}
            >
                <ToggleButton
                    value="comfortable"
                    aria-label={t("grid_view.density_large") || "Groß"}
                    title={t("grid_view.density_large") || "Groß"}
                >
                    <ViewHeadlineIcon />
                </ToggleButton>
                <ToggleButton
                    value="standard"
                    aria-label={t("grid_view.density_medium") || "Mittel"}
                    title={t("grid_view.density_medium") || "Mittel"}
                >
                    <ViewComfyIcon />
                </ToggleButton>
                <ToggleButton
                    value="compact"
                    aria-label={t("grid_view.density_small") || "Klein"}
                    title={t("grid_view.density_small") || "Klein"}
                >
                    <ViewCompactIcon />
                </ToggleButton>
            </ToggleButtonGroup>

            <Button
                variant="outlined"
                size="small"
                startIcon={<GetAppIcon />}
                onClick={onExportCSV}
                title={t("grid_view.export_csv_tooltip") || "Als CSV exportieren"}
            >
                {t("grid_view.export_csv") || "CSV Export"}
            </Button>
        </ToolbarSection>
    </CustomToolbar>
));

interface VisibleColumns {
    // dictionary: boolean;
    // document: boolean;
    theme: boolean;
    class: boolean;
    property: boolean;
    propertyGroup: boolean;
}

// Extracted and memoized tag component for better performance
const MemoizedTagChip = memo(
    ({
        tag,
        selectedTag,
        onTagClick,
    }: {
        tag: string;
        selectedTag: string | null;
        onTagClick: (tag: string | null) => void;
    }) => (
        <TagChip
            key={tag}
            label={tag}
            clickable
            color={selectedTag === tag ? "secondary" : "default"}
            onClick={() => onTagClick(tag)}
        />
    )
);

// Extracted TagFilterSection component for better organization
const TagFilterSection = memo(({
    allTags,
    selectedTag,
    handleTagFilter,
    newTag,
    handleTagChange,
    handleAddTag,
    handleRefresh,
    propertyTreeLoading,
    t,
}: {
    allTags: string[];
    selectedTag: string | null;
    handleTagFilter: (tag: string | null) => void;
    newTag: string;
    handleTagChange: (event: SelectChangeEvent<string>) => void;
    handleAddTag: () => void;
    handleRefresh: () => void;
    propertyTreeLoading: boolean;
    t: any;
}) => (
    <>
        <HeaderContainer>
            <Typography variant="h6">{<T keyName="grid_view.tag_filter_title" />}</Typography>
            <TagControls>
                <StyledFormControl variant="outlined">
                    <InputLabel id="importTag-label">
                        {<T keyName="grid_view.tag_filter_placeholder" />}
                    </InputLabel>
                    <Select
                        labelId="importTag-label"
                        id="importTag"
                        label={<T keyName="grid_view.tag_filter_placeholder" />}
                        name="importTag"
                        value={newTag}
                        onChange={handleTagChange}
                        style={{ minWidth: "200px" }}
                    >
                        <MenuItem value="">
                            <em>{<T keyName="grid_view.select_tag" />}</em>
                        </MenuItem>
                        {allTags.map((tag) => (
                            <MenuItem key={tag} value={tag}>
                                {tag}
                            </MenuItem>
                        ))}
                    </Select>
                </StyledFormControl>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddTag}
                    startIcon={<LocalOfferIcon />}
                    disabled={!newTag}
                >
                    {<T keyName="grid_view.add_tag" />}
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleRefresh}
                    startIcon={<RefreshIcon />}
                    disabled={propertyTreeLoading}
                    title={t("grid_view.refresh_data_tooltip")}
                >
                    {<T keyName="grid_view.refresh" />}
                </Button>
            </TagControls>
        </HeaderContainer>

        <TagButtonContainer>
            {allTags.map((tag) => (
                <MemoizedTagChip
                    key={tag}
                    tag={tag}
                    selectedTag={selectedTag}
                    onTagClick={handleTagFilter}
                />
            ))}
            <TagChip
                label={<T keyName="grid_view.show_all" />}
                clickable
                color={selectedTag === null ? "secondary" : "default"}
                onClick={() => handleTagFilter(null)}
            />
        </TagButtonContainer>
    </>
));

// Main component
const GridViewView = () => {
    const navigate = useNavigate();
    const apolloClient = useApolloClient();
    const {
        loading: propertyTreeLoading,
        error: propertyTreeError,
        data: propertyTreeData,
        refetch: refetchPropertyTree,
    } = usePropertyTreeQuery({});
    const [addTag] = useAddTagMutation();

    // Neue Query für alle Merkmalsgruppen
    const {
        data: allNestsData,
        loading: allNestsLoading,
        error: allNestsError,
        refetch: refetchAllNests,
    } = useFindItemQuery({
        variables: {
            input: {
                tagged: PropertyGroupEntity.tags,
                pageSize: 200, // Genug für alle Merkmalsgruppen
            },
        },
        fetchPolicy: "cache-and-network",
        errorPolicy: "all",
    });
    const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
        // dictionary: true,
        // document: true,
        theme: true,
        class: true,
        property: true,
        propertyGroup: true,
    });

    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [documentNames, setDocumentNames] = useState<{
        [key: string]: { name: string | null; id: string | null };
    }>({});
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [isTagging, setIsTagging] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [density, setDensity] = useState<GridDensity>("compact");
    const { data, refetch } = useFindTagsQuery({ variables: { pageSize: 100 } });
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslate();

    // --- Nur noch propertyTreeData verwenden ---
    const nodes = propertyTreeData?.hierarchy?.nodes || [];
    const paths = propertyTreeData?.hierarchy?.paths || [];

    // Memoized filter function
    const filterTags = useCallback((tags: string[]) =>
        tags.filter((tag) => !EXCLUDED_TAGS.includes(tag as any)), []
    );

    // Auto-refresh when new property groups are created
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'datacat_property_groups_updated' || e.key === 'datacat_refresh_needed') {
                refetchPropertyTree?.();
                enqueueSnackbar("Neue Merkmalsgruppen erkannt - Daten werden aktualisiert", {
                    variant: "info",
                    autoHideDuration: 3000
                });
                // Cleanup the flag
                localStorage.removeItem(e.key || '');
            }
        };

        // Listen for storage events from other tabs/windows
        window.addEventListener('storage', handleStorageChange);

        // Also check for custom events within the same window
        const handleCustomRefresh = () => {
            refetchPropertyTree?.();
            refetchAllNests?.();
            enqueueSnackbar("Daten werden aktualisiert...", {
                variant: "info",
                autoHideDuration: 2000
            });
        };

        window.addEventListener('datacat_refresh_property_tree', handleCustomRefresh);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('datacat_refresh_property_tree', handleCustomRefresh);
        };
    }, [refetchPropertyTree, enqueueSnackbar]);

    // Column visibility handlers
    const handleShowOnlyColumn = useCallback((column: keyof VisibleColumns) => {
        setVisibleColumns({
            // dictionary: false,
            // document: false,
            theme: false,
            class: false,
            property: false,
            propertyGroup: false,
            [column]: true,
        });
    }, []);

    const handleShowAllColumns = useCallback(() => {
        setVisibleColumns({
            // dictionary: true,
            // document: true,
            theme: true,
            class: true,
            property: true,
            propertyGroup: true,
        });
    }, []);

    // Tag filtering
    const handleTagFilter = useCallback((tag: string | null) => {
        setSelectedTag(tag);
    }, []);

    const handleTagChange = useCallback((event: SelectChangeEvent<string>) => {
        setNewTag(event.target.value as string);
    }, []);

    // Row mapping functions - KORRIGIERT: Alle Tags prüfen
    const mapRecordTypeToColumn = useCallback((node: any, column: string) => {
        const tags = node.tags || [];
        switch (column) {
            // case "dictionary":
            //     for (const tag of tags) {
            //         if (DictionaryEntity.tags!.includes(tag.id)) {
            //             return node.name || "";
            //         }
            //     }
            //     return "";
            // case "document":
            //     for (const tag of tags) {
            //         if (DocumentEntity.tags!.includes(tag.id)) {
            //             return node.name || "";
            //         }
            //     }
            //     return "";
            case "theme":
                for (const tag of tags) {
                    if (ThemeEntity.tags!.includes(tag.id)) {
                        return node.name || "";
                    }
                }
                return "";
            case "class":
                for (const tag of tags) {
                    if (ClassEntity.tags!.includes(tag.id)) {
                        return node.name || "";
                    }
                }
                return "";
            case "property":
                for (const tag of tags) {
                    if (PropertyEntity.tags!.includes(tag.id)) {
                        return node.name || "";
                    }
                }
                return "";
            case "propertyGroup":
                for (const tag of tags) {
                    if (PropertyGroupEntity.tags!.includes(tag.id)) {
                        return node.name || "";
                    }
                }
                return "";
            default:
                return "";
        }
    }, []);

    // Navigation handler
    const handleOnSelect = useCallback((id: string, column: string) => {
        let entityTypePath = "";
        switch (column) {
            // case "dictionary":
            //     entityTypePath = "dictionary";
            //     break;
            // case "document":
            //     entityTypePath = "document";
            //     break;
            case "theme":
                entityTypePath = "theme";
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
    }, [navigate]);

    // Build data rows: Erzeugt die Zeilen für die DataGrid-Tabelle anhand der Hierarchiepfade
    const buildRows = useCallback(() => {
        const rows: any[] = [];
        const seenCombinations = new Set();
        const nodeMap = new Map(nodes.map(node => [node.id, node]));



        // Für jeden Pfad eine Zeile erzeugen
        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];
            const row: any = {
                // dictionary: "",
                // document: "",
                theme: "",
                class: "",
                property: "",
                propertyGroup: "",
                ids: {
                    // dictionary: "",
                    // document: "",
                    theme: "",
                    class: "",
                    property: "",
                    propertyGroup: "",
                },
                recordType: "",
                tags: [],
                uniqueId: `path-${i}`,
            };

            for (let j = 0; j < path.length; j++) {
                const id = path[j];
                const node = nodeMap.get(id);
                if (node) {
                    for (const column of ["theme", "class", "property", "propertyGroup"] as (keyof VisibleColumns)[]) { //"dictionary", "document",
                        const value = mapRecordTypeToColumn(node, column);
                        if (value) {
                            row[column] = value;
                            row.ids[column] = node.id;
                        }
                    }
                    row.recordType = node.recordType;
                    row.tags = node.tags;
                }
            }

            const combinationKey = `${row.theme}-${row.class}-${row.property}-${row.propertyGroup}`; // ${row.dictionary}-${row.document}-
            if (!seenCombinations.has(combinationKey)) {
                seenCombinations.add(combinationKey);
                rows.push(row);
            }
        }

        // Zusätzlich: Eigenständige Merkmalsgruppen aus der Nest-Query hinzufügen
        const allNestNodes = allNestsData?.search?.nodes || [];

        const standalonePropertyGroups = allNestNodes.filter((node: any) => {

            // Prüfe nur auf recordType "Nest" - das sollte alle Merkmalsgruppen erfassen
            if (node.recordType !== "Nest") {
                return false;
            }

            // Prüfe, ob diese Merkmalsgruppe bereits in den Zeilen enthalten ist
            const isAlreadyInRows = rows.some(row => row.ids.propertyGroup === node.id);

            return !isAlreadyInRows;
        });

        // Füge eigenständige Merkmalsgruppen als separate Zeilen hinzu
        standalonePropertyGroups.forEach((node: any, index: number) => {
            const row: any = {
                document: "",
                model: "",
                group: "",
                class: "",
                property: "",
                propertyGroup: node.name || "",
                ids: {
                    document: "",
                    model: "",
                    group: "",
                    class: "",
                    property: "",
                    propertyGroup: node.id,
                },
                recordType: node.recordType,
                tags: node.tags,
                uniqueId: `standalone-propertygroup-${index}`,
            };

            const combinationKey = `${row.document}-${row.model}-${row.group}-${row.class}-${row.property}-${row.propertyGroup}`;
            if (!seenCombinations.has(combinationKey)) {
                seenCombinations.add(combinationKey);
                rows.push(row);
            }
        });

        // Sortiere die Zeilen für eine konsistente Anzeige
        rows.sort((a, b) => {
            // if (a.document !== b.document)
            //     return a.document.localeCompare(b.document);
            // if (a.dictionary !== b.dictionary)
            //     return a.dictionary.localeCompare(b.dictionary);
            if (a.theme !== b.theme) return a.theme.localeCompare(b.theme);
            if (a.class !== b.class) return a.class.localeCompare(b.class);
            if (a.propertyGroup !== b.propertyGroup)
                return a.propertyGroup.localeCompare(b.propertyGroup);
            return a.property.localeCompare(b.property);
        });

        return rows;
    }, [
        paths,
        nodes,
        mapRecordTypeToColumn
    ]);

    // Filtered rows und entityCount in einem useMemo
    const { filteredRows, entityCount, modelIds } = useMemo(() => {
        let rows = buildRows();

        // Sichtbare Spalten zuerst ermitteln
        const visibleColumnsArray = Object.keys(visibleColumns).filter(
            (key) => visibleColumns[key as keyof VisibleColumns]
        );

        // Tag-Filter mit verbesserter Logik: Nur Elemente anzeigen, die das Tag haben UND in sichtbaren Spalten sind
        if (selectedTag) {
            const tagSet = new Set([selectedTag]);
            rows = rows.filter((row) => {
                // Prüfe für jede sichtbare Spalte, ob das entsprechende Element das Tag hat
                return visibleColumnsArray.some((column) => {
                    const elementId = row.ids[column as keyof VisibleColumns];
                    const elementValue = row[column as keyof VisibleColumns];

                    // Nur prüfen wenn Element existiert
                    if (!elementId || !elementValue) return false;

                    // Finde das entsprechende Node um dessen Tags zu prüfen
                    const elementNode = nodes.find((n: any) => n.id === elementId);
                    if (!elementNode?.tags) return false;

                    // Prüfe ob dieses spezifische Element das Tag hat
                    return elementNode.tags.some((tag: any) =>
                        tagSet.has(tag.name) || tagSet.has(tag.id)
                    );
                });
            });
        }

        // Search Filter
        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase().trim();
            rows = rows.filter((row) => {
                return (
                    (row.document && row.document.toLowerCase().includes(searchLower)) ||
                    (row.model && row.model.toLowerCase().includes(searchLower)) ||
                    (row.group && row.group.toLowerCase().includes(searchLower)) ||
                    (row.class && row.class.toLowerCase().includes(searchLower)) ||
                    (row.property && row.property.toLowerCase().includes(searchLower)) ||
                    (row.propertyGroup && row.propertyGroup.toLowerCase().includes(searchLower))
                );
            });
        }

        // Spalten-basierte Filterung für eindeutige Werte
        let count: number | null = null;
        if (visibleColumnsArray.length === 1) {
            const column = visibleColumnsArray[0];
            const uniqueValuesMap = new Map<string, boolean>();

            rows = rows.filter((row) => {
                const value = row[column];
                if (!value || uniqueValuesMap.has(value)) {
                    return false;
                }
                uniqueValuesMap.set(value, true);
                return true;
            });

            count = uniqueValuesMap.size;
        }

        // Modell-IDs für Dokumentnamen extrahieren
        const modelIds = Array.from(
            new Set(
                rows.map((row) => row.ids.model).filter((id: string) => id)
            )
        );

        return { filteredRows: rows, entityCount: count, modelIds };
    }, [visibleColumns, selectedTag, searchText, buildRows, nodes]);

    // Tag-Query nur einmalig und bei Änderungen der Tags
    useEffect(() => {
        if (data) {
            setTags(data.findTags.nodes.map((tag: any) => tag.name));
        }
    }, [data]);

    // // Dokumentnamen nur nachladen, wenn sich modelIds ändern
    // useEffect(() => {
    //     if (modelIds.length === 0) return;

    //     const abortController = new AbortController();
    //     let isMounted = true;

    //     const fetchDocumentNames = async () => {
    //         const newDocumentData: {
    //             [key: string]: { name: string | null; id: string | null };
    //         } = {};

    //         // Filtere nur IDs, die noch nicht geladen wurden
    //         const missingModelIds = modelIds.filter(id => !documentNames[id]);

    //         if (missingModelIds.length === 0) return;

    //         try {
    //             // Parallele Abfragen für bessere Performance
    //             const promises = missingModelIds.map(async (id) => {
    //                 try {
    //                     const response = await getBag({
    //                         variables: { id },
    //                         context: { signal: abortController.signal }
    //                     });
    //                     const documentNode =
    //                         response.data?.getBag?.documentedBy?.nodes[0]?.relatingDocument;
    //                     const documentName = documentNode?.name || null;
    //                     const documentId = documentNode?.id || null;
    //                     return { id, name: documentName, documentId };
    //                 } catch (error) {
    //                     // Einzelne Fehler nicht propagieren
    //                     return { id, name: null, documentId: null };
    //                 }
    //             });

    //             const results = await Promise.allSettled(promises);

    //             results.forEach((result) => {
    //                 if (result.status === 'fulfilled' && result.value) {
    //                     const { id, name, documentId } = result.value;
    //                     newDocumentData[id] = { name, id: documentId };
    //                 }
    //             });

    //         } catch (error) {
    //             if (error instanceof Error && error.name !== 'AbortError') {
    //                 console.warn('Error fetching document names:', error);
    //             }
    //         }

    //         if (isMounted && !abortController.signal.aborted && Object.keys(newDocumentData).length > 0) {
    //             setDocumentNames(prev => ({ ...prev, ...newDocumentData }));
    //         }
    //     };

    //     fetchDocumentNames();

    //     return () => {
    //         isMounted = false;
    //         abortController.abort();
    //     };
    // }, [modelIds, getBag]);

    // Enhanced tag adding functionality with improved tag checking
    const handleAddTag = useCallback(async () => {
        if (!newTag) {
            enqueueSnackbar(<T keyName="grid_view.please_select_tag" />, { variant: "error" });
            return;
        }
        if (selectedRows.length === 0) {
            enqueueSnackbar(<T keyName="grid_view.please_select_rows" />, {
                variant: "warning",
            });
            return;
        }

        setIsTagging(true);
        enqueueSnackbar(<T keyName="grid_view.adding_tags" />, { variant: "info" });

        // Frische Daten ermitteln, damit lokale row.tags aktuell sind
        try {
            const { data: freshData } = await refetch();
            // Aktualisiere lokale Tags, falls verfügbar
            if (freshData?.findTags.nodes) {
                setTags(freshData.findTags.nodes.map((tag: any) => tag.name));
            }
        } catch (error) {
            console.warn('Failed to refresh tags:', error);
            enqueueSnackbar(t("grid_view.error_fetching_latest_tags"), {
                variant: "warning",
            });
        }

        // Tag-ID ermitteln
        const selectedTagObj = data?.findTags.nodes.find(
            (tag: any) => tag.name === newTag
        );
        const tagId = selectedTagObj?.id;
        if (!tagId) {
            enqueueSnackbar(<T keyName="grid_view.tag_id_not_found" />, { variant: "error" });
            setIsTagging(false);
            return;
        }

        // Ausgewählte Zeilen filtern
        const selectedRowSet = new Set(selectedRows);
        const entries = filteredRows.filter((row) =>
            selectedRowSet.has(String(row.uniqueId))
        );

        // Sichtbare Spalten ermitteln
        const visibleColumnsArray = Object.keys(visibleColumns).filter(
            (key) => visibleColumns[key as keyof VisibleColumns]
        );

        // Map für eindeutige Katalog-Einträge mit verbesserter Logik
        const catalogMap = new Map<string, { already: boolean; row: any }>();

        // Nur Einträge taggen, die in sichtbaren Spalten sind
        entries.forEach((row) => {
            visibleColumnsArray.forEach((column) => {
                const entryId = row.ids[column as keyof VisibleColumns];
                const entryValue = row[column as keyof VisibleColumns];

                // Nur verarbeiten wenn Element existiert
                if (!entryId || !entryValue) return;

                if (!catalogMap.has(entryId)) {
                    // Finde das entsprechende Node um dessen Tags zu prüfen
                    const elementNode = nodes.find((n: any) => n.id === entryId);
                    const hasTag = !!(elementNode?.tags && Array.isArray(elementNode.tags) &&
                        elementNode.tags.some((tg: any) => tg.id === tagId));

                    catalogMap.set(entryId, { already: hasTag, row });
                }
            });
        });

        let toAdd = 0,
            alreadyCount = 0;
        catalogMap.forEach((v) => (v.already ? alreadyCount++ : toAdd++));

        // Falls nichts hinzuzufügen ist
        if (toAdd === 0) {
            setIsTagging(false);
            enqueueSnackbar(
                alreadyCount > 0
                    ? <T keyName="grid_view.all_entries_already_tagged" {...{ count: alreadyCount }} />
                    : <T keyName="grid_view.no_tags_to_add" />,
                { variant: alreadyCount > 0 ? "info" : "warning" }
            );
            return;
        }

        // Tags hinzufügen mit verbesserter Performance
        let added = 0,
            failed = 0;
        const addTagPromises: Promise<void>[] = [];

        for (const [entryId, status] of catalogMap.entries()) {
            if (status.already) continue;

            const addTagPromise = addTag({
                variables: { input: { catalogEntryId: entryId, tagId } },
            })
                .then(() => {
                    added++;
                    // Zeilen-Tags lokal aktualisieren
                    const rowsToUpdate = entries.filter(row =>
                        Object.values(row.ids).includes(entryId)
                    );
                    rowsToUpdate.forEach((row) => {
                        row.tags = Array.isArray(row.tags)
                            ? [
                                ...row.tags,
                                {
                                    id: tagId,
                                    name: newTag,
                                    catalogEntryId: entryId,
                                    entryId,
                                },
                            ]
                            : [
                                {
                                    id: tagId,
                                    name: newTag,
                                    catalogEntryId: entryId,
                                    entryId,
                                },
                            ];
                    });
                })
                .catch((error: any) => {
                    failed++;
                    console.error(`Failed to add tag to ${entryId}:`, error);
                });

            addTagPromises.push(addTagPromise);
        }

        // Warte auf alle Tag-Ergänzungen
        await Promise.allSettled(addTagPromises);

        // Feedback ausgeben
        if (added > 0) {
            enqueueSnackbar(
                alreadyCount > 0
                    ? <T keyName="grid_view.tags_added_with_existing" {...{
                        added,
                        existing: alreadyCount,
                    }} />
                    : <T keyName="grid_view.tags_added_count" {...{ count: added }} />,
                { variant: "success" }
            );
        }
        if (failed > 0) {
            enqueueSnackbar(<T keyName="grid_view.tags_adding_failed" />, { variant: "error" });
        }

        setIsTagging(false);
    }, [newTag, selectedRows, enqueueSnackbar, t, refetch, data, filteredRows, addTag, visibleColumns, nodes]);

    // Refresh-Handler für manuelle Aktualisierung mit Cache-Reset
    const handleRefresh = useCallback(async () => {
        try {
            enqueueSnackbar(t("grid_view.refreshing_data"), { variant: "info" });

            // Apollo Cache für PropertyTree komplett leeren
            await apolloClient.clearStore();

            await Promise.all([
                refetchPropertyTree(),
                refetchAllNests(),
                refetch()
            ]);
            // Dokumentnamen-Cache zurücksetzen
            setDocumentNames({});
            enqueueSnackbar(t("grid_view.data_refreshed"), { variant: "success" });
        } catch (error) {
            console.error('Refresh failed:', error);
            enqueueSnackbar(t("grid_view.refresh_failed"), { variant: "error" });
        }
    }, [apolloClient, refetchPropertyTree, refetchAllNests, refetch, enqueueSnackbar, t]);

    // CSV Export Handler
    const handleExportCSV = useCallback(() => {
        const headers = [
            // t("grid_view.reference_documents"),
            // t("grid_view.domain_models"),
            t("theme.titlePlural"),
            t("class.titlePlural"),
            t("propertyGroup.titlePlural"),
            t("property.titlePlural")
        ];

        const csvContent = [
            headers.join(","),
            ...filteredRows.map(row => [
                // `"${row.document || ""}"`,
                // `"${row.model || ""}"`,
                `"${row.theme || ""}"`,
                `"${row.class || ""}"`,
                `"${row.propertyGroup || ""}"`,
                `"${row.property || ""}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `datacat-grid-export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        enqueueSnackbar(t("grid_view.export_success") || "Export erfolgreich", { variant: "success" });
    }, [filteredRows, t, enqueueSnackbar]);

    // Search Handler
    const handleSearchChange = useCallback((value: string) => {
        setSearchText(value);
    }, []);

    // Density Handler
    const handleDensityChange = useCallback((newDensity: GridDensity) => {
        setDensity(newDensity);
    }, []);

    // Memoized values
    const allTags = useMemo(() => filterTags(tags).sort(), [tags, filterTags]);
    const isAnyColumnHidden = useMemo(() => Object.values(visibleColumns).some(
        (value) => !value
    ), [visibleColumns]);

    // Memoized values
    const columns: GridColDef[] = useMemo(() => [
        // ...(visibleColumns.document
        //     ? [
        //         {
        //             field: "document",
        //             headerName: t("document.titlePlural"),
        //             flex: 1,
        //             minWidth: 200,
        //             renderCell: (params: GridRenderCellParams) => {
        //                 const documentName =
        //                     documentNames[params.row.ids.model]?.name || params.value;
        //                 const documentId = documentNames[params.row.ids.model]?.id;

        //                 return (
        //                     <Box
        //                         sx={{
        //                             cursor: documentId ? "pointer" : "default",
        //                             width: "100%",
        //                             height: "100%",
        //                             display: "flex",
        //                             alignItems: "center",
        //                             "&:hover": {
        //                                 textDecoration: documentId ? "underline" : "none",
        //                             },
        //                         }}
        //                         onClick={(e) => {
        //                             e.stopPropagation();
        //                             if (documentId) {
        //                                 handleOnSelect(documentId, "document");
        //                             }
        //                         }}
        //                     >
        //                         {documentName || "\u00A0"}
        //                     </Box>
        //                 );
        //             },
        //         },
        //     ]
        //     : []),

        // ...(visibleColumns.dictionary
        //     ? [
        //         {
        //             field: "dictionary",
        //             headerName: t("dictionary.titlePlural"),
        //             flex: 1,
        //             minWidth: 200,
        //             renderCell: (params: GridRenderCellParams) => (
        //                 <Box
        //                     sx={{
        //                         cursor: params.value ? "pointer" : "default",
        //                         width: "100%",
        //                         height: "100%",
        //                         display: "flex",
        //                         alignItems: "center",
        //                         "&:hover": {
        //                             textDecoration: params.value ? "underline" : "none",
        //                         },
        //                     }}
        //                     onClick={(e) => {
        //                         e.stopPropagation();
        //                         if (params.value) {
        //                             handleOnSelect(params.row.ids.dictionary, "dictionary");
        //                         }
        //                     }}
        //                 >
        //                     {params.value || "\u00A0"}
        //                 </Box>
        //             ),
        //         },
        //     ]
        //     : []),

        ...(visibleColumns.theme
            ? [
                {
                    field: "theme",
                    headerName: t("theme.titlePlural"),
                    flex: 1,
                    minWidth: 150,
                    renderCell: (params: GridRenderCellParams) => (
                        <Box
                            sx={{
                                cursor: params.value ? "pointer" : "default",
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                "&:hover": {
                                    textDecoration: params.value ? "underline" : "none",
                                },
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (params.value) {
                                    handleOnSelect(params.row.ids.theme, "theme");
                                }
                            }}
                        >
                            {params.value || "\u00A0"}
                        </Box>
                    ),
                },
            ]
            : []),

        ...(visibleColumns.class
            ? [
                {
                    field: "class",
                    headerName: t("class.titlePlural"),
                    flex: 1,
                    minWidth: 150,
                    renderCell: (params: GridRenderCellParams) => (
                        <Box
                            sx={{
                                cursor: params.value ? "pointer" : "default",
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                "&:hover": {
                                    textDecoration: params.value ? "underline" : "none",
                                },
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (params.value) {
                                    handleOnSelect(params.row.ids.class, "class");
                                }
                            }}
                        >
                            {params.value || "\u00A0"}
                        </Box>
                    ),
                },
            ]
            : []),

        ...(visibleColumns.propertyGroup
            ? [
                {
                    field: "propertyGroup",
                    headerName: t("propertyGroup.titlePlural"),
                    flex: 1,
                    minWidth: 180,
                    renderCell: (params: GridRenderCellParams) => (
                        <Box
                            sx={{
                                cursor: params.value ? "pointer" : "default",
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                "&:hover": {
                                    textDecoration: params.value ? "underline" : "none",
                                },
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (params.value) {
                                    handleOnSelect(
                                        params.row.ids.propertyGroup,
                                        "propertyGroup"
                                    );
                                }
                            }}
                        >
                            {params.value || "\u00A0"}
                        </Box>
                    ),
                },
            ]
            : []),

        ...(visibleColumns.property
            ? [
                {
                    field: "property",
                    headerName: t("property.titlePlural"),
                    flex: 1,
                    minWidth: 180,
                    renderCell: (params: GridRenderCellParams) => (
                        <Box
                            sx={{
                                cursor: params.value ? "pointer" : "default",
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                "&:hover": {
                                    textDecoration: params.value ? "underline" : "none",
                                },
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (params.value) {
                                    handleOnSelect(params.row.ids.property, "property");
                                }
                            }}
                        >
                            {params.value || "\u00A0"}
                        </Box>
                    ),
                },
            ]
            : []),
    ], [visibleColumns, documentNames, handleOnSelect, t]);

    // Show loading spinner while data is being fetched
    if (propertyTreeLoading) {
        return (
            <LoadingSpinner
                message={t("grid_view.loading_table_contents")}
                subMessage={t("grid_view.loading_hierarchy_data")}
                fullscreen={true}
            />
        );
    }

    if (propertyTreeError)
        return <Typography>Error: {propertyTreeError.message}</Typography>;


    return (
        <MainContainer>
            <TableContainer>
                <FixedContainer>
                    {/* Use extracted TagFilterSection component */}
                    <TagFilterSection
                        allTags={allTags}
                        selectedTag={selectedTag}
                        handleTagFilter={handleTagFilter}
                        newTag={newTag}
                        handleTagChange={handleTagChange}
                        handleAddTag={handleAddTag}
                        handleRefresh={handleRefresh}
                        propertyTreeLoading={propertyTreeLoading}
                        t={t}
                    />

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >
                        <ButtonContainer>
                            {/* <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleShowOnlyColumn("dictionary")}
                        >
                            {<T keyName="grid_view.show_only_dictionaries" />}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleShowOnlyColumn("document")}
                        >
                            {<T keyName="grid_view.show_only_documents" />}
                        </Button> */}
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleShowOnlyColumn("theme")}
                                title={t("grid_view.show_only_themes_tooltip")}
                            >
                                {<T keyName="grid_view.show_only_themes" />}
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleShowOnlyColumn("class")}
                                title={t("grid_view.show_only_classes_tooltip")}
                            >
                                {<T keyName="grid_view.show_only_classes" />}
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleShowOnlyColumn("propertyGroup")}
                                title={t("grid_view.show_only_property_groups_tooltip")}
                            >
                                {<T keyName="grid_view.show_only_property_groups" />}
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleShowOnlyColumn("property")}
                                title={t("grid_view.show_only_properties_tooltip")}
                            >
                                {<T keyName="grid_view.show_only_properties" />}
                            </Button>
                            {isAnyColumnHidden && (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleShowAllColumns}
                                    title={t("grid_view.show_all_columns_tooltip")}
                                >
                                    {<T keyName="grid_view.show_all" />}
                                </Button>
                            )}
                        </ButtonContainer>

                        {/* Show loading indicator when tagging */}
                        {isTagging && (
                            <Box sx={{ width: "100%", mt: 1, mb: 1 }}>
                                <LinearProgress />
                                <Typography
                                    variant="caption"
                                    sx={{ mt: 0.5, display: "block", textAlign: "center" }}
                                >
                                    {<T keyName="grid_view.adding_tags_please_wait" />}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </FixedContainer>

                {/* Adjust Box to take remaining space without causing overflow */}
                <Box
                    sx={{
                        flexGrow: 1,
                        width: "100%",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative", // Für absolute Positionierung der Auswahlhilfe
                        minHeight: 0, // Wichtig für Flex-Layout
                    }}
                >
                    <DataGridToolbar
                        searchText={searchText}
                        onSearchChange={handleSearchChange}
                        onExportCSV={handleExportCSV}
                        totalRows={filteredRows.length}
                        selectedRowsCount={selectedRows.length}
                        density={density}
                        onDensityChange={handleDensityChange}
                        t={t}
                    />

                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        getRowId={(row) => row.uniqueId}
                        checkboxSelection
                        onRowSelectionModelChange={(
                            newSelectionModel: GridRowSelectionModel
                        ) => {
                            // Extract IDs from the selection model based on its structure
                            let selectedIDs: string[] = [];

                            if (newSelectionModel && typeof newSelectionModel === "object") {
                                if (
                                    "ids" in newSelectionModel &&
                                    newSelectionModel.ids instanceof Set
                                ) {
                                    // Extract IDs from Set and convert to strings
                                    selectedIDs = Array.from(newSelectionModel.ids).map((id) =>
                                        String(id)
                                    );
                                } else if (Array.isArray(newSelectionModel)) {
                                    // Fallback for array format (older versions)
                                    selectedIDs = newSelectionModel.map((id) => String(id));
                                }
                            }

                            setSelectedRows(selectedIDs);
                        }}
                        density={density}
                        disableColumnResize={false}
                        disableColumnMenu={false}
                        pageSizeOptions={[25, 50, 100, 250]}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 100, page: 0 },
                            },
                        }}
                        scrollbarSize={12}
                        rowHeight={density === "comfortable" ? 52 : density === "standard" ? 42 : 36}
                        columnHeaderHeight={density === "comfortable" ? 64 : density === "standard" ? 56 : 48}
                        localeText={{
                            // Footer pagination
                            footerRowSelected: (count) =>
                                count !== 1
                                    ? `${count.toLocaleString()} ${t("grid_view.selected") || "ausgewählt"}`
                                    : `${count.toLocaleString()} ${t("grid_view.selected") || "ausgewählt"}`,
                        }}
                        sx={{
                            height: "100%",
                            width: "100%",
                            flexGrow: 1,
                            border: "none",
                            "& .MuiDataGrid-virtualScroller": {
                                overflow: "auto",
                                "&::-webkit-scrollbar": {
                                    width: "12px",
                                    height: "12px",
                                },
                                "&::-webkit-scrollbar-thumb": {
                                    backgroundColor: "rgba(0,0,0,0.3)",
                                    borderRadius: "6px",
                                    "&:hover": {
                                        backgroundColor: "rgba(0,0,0,0.4)",
                                    },
                                },
                                "&::-webkit-scrollbar-track": {
                                    backgroundColor: "rgba(0,0,0,0.1)",
                                    borderRadius: "6px",
                                },
                            },
                            "& .MuiDataGrid-cell": {
                                padding: density === "comfortable" ? "12px 16px" : density === "standard" ? "6px 8px" : "4px 6px",
                                borderRight: "1px solid #e0e0e0",
                            },
                            "& .MuiDataGrid-columnHeaders": {
                                backgroundColor: "#f5f5f5",
                                borderBottom: "2px solid #e0e0e0",
                            },
                            "& .MuiDataGrid-row": {
                                "&:nth-of-type(odd)": {
                                    backgroundColor: "#fafafa",
                                },
                                "&:hover": {
                                    backgroundColor: "#f0f0f0",
                                },
                            },
                            "& .MuiDataGrid-main": {
                                overflow: "hidden",
                                flexGrow: 1,
                            },
                            "& .MuiDataGrid-footerContainer": {
                                borderTop: "2px solid #e0e0e0",
                                backgroundColor: "#f5f5f5",
                                minHeight: "52px",
                                position: "relative",
                                zIndex: 1,
                                justifyContent: "flex-start", // Verschiebe Pagination nach links
                                overflow: "hidden", // Entferne Scrollbar
                                "& .MuiTablePagination-root": {
                                    marginLeft: 0, // Entferne rechten Abstand
                                    overflow: "visible", // Keine Scrollbar in Pagination
                                    width: "100%", // Vollständige Breite nutzen
                                },
                                "& .MuiTablePagination-toolbar": {
                                    justifyContent: "flex-start", // Ausrichtung links
                                    paddingLeft: "16px",
                                    paddingRight: "16px",
                                    overflow: "hidden", // Entferne Scrollbar
                                    minHeight: "52px",
                                    flexWrap: "nowrap", // Verhindere Umbrüche
                                    width: "100%",
                                },
                                "& .MuiTablePagination-spacer": {
                                    display: "none", // Entferne Spacer der normalerweise rechtsbündig macht
                                },
                                "& .MuiTablePagination-selectLabel": {
                                    marginRight: "8px",
                                    whiteSpace: "nowrap",
                                },
                                "& .MuiTablePagination-displayedRows": {
                                    marginLeft: "16px",
                                    marginRight: "16px",
                                    whiteSpace: "nowrap",
                                },
                            },
                            "& .MuiDataGrid-selectedRowCount": {
                                visibility: "visible",
                            },
                        }}
                        slots={{
                            toolbar: () => null, // We use our custom toolbar above
                        }}
                        slotProps={{
                            pagination: {
                                showFirstButton: true,
                                showLastButton: true,
                                labelRowsPerPage: t("grid_view.rows_per_page") || "Zeilen pro Seite:",
                                labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
                                    `${from}–${to} ${t("grid_view.of") || "von"} ${count !== -1 ? count : `${t("grid_view.more_than") || "mehr als"} ${to}`}`,
                            },
                        }}
                    />

                    {/* Auswahlhilfe außerhalb der DataGrid */}
                    {selectedRows.length > 0 && (
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: "8px",
                                left: "16px",
                                zIndex: 10,
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "1px solid #e0e0e0",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    fontStyle: "italic",
                                    fontSize: "0.75rem",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                💡 {t("grid_view.selection_help") || "Auswahlhilfe:"}
                                <strong> Strg + {t("grid_view.for_multiple") || "für Mehrfachauswahl"}</strong>
                            </Typography>
                        </Box>
                    )}
                </Box>
            </TableContainer>
        </MainContainer>
    );
};

export default memo(GridViewView);
