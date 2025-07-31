import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
    usePropertyTreeQuery,
    useAddTagMutation,
    useGetSubjectEntryLazyQuery,
    useFindTagsQuery,
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
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridRowSelectionModel,
} from "@mui/x-data-grid";
import { T, useTranslate } from "@tolgee/react";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { DictionaryEntity, DocumentEntity, ClassEntity, PropertyEntity, PropertyGroupEntity, ValueEntity, ValueListEntity, ThemeEntity } from "../domain";

// Replace makeStyles with styled components
const TableContainer = styled(Paper)(({ theme }) => ({
    border: "2px solid #ccc",
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    margin: theme.spacing(2),
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    // Increase height to make sure we have enough space
    height: "calc(100vh - 100px)",
    display: "flex",
    flexDirection: "column",
}));

const FixedContainer = styled(Box)(({ theme }) => ({
    position: "sticky",
    top: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: 3,
    padding: theme.spacing(2),
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: theme.spacing(2),
}));

const TagButtonContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexWrap: "wrap",
    marginBottom: theme.spacing(2),
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
const TagFilterSection = ({
    allTags,
    selectedTag,
    handleTagFilter,
    newTag,
    handleTagChange,
    handleAddTag,
}: {
    allTags: string[];
    selectedTag: string | null;
    handleTagFilter: (tag: string | null) => void;
    newTag: string;
    handleTagChange: (event: SelectChangeEvent<string>) => void;
    handleAddTag: () => void;
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
);

// Main component
const GridViewView = () => {
    const navigate = useNavigate();
    const {
        loading: propertyTreeLoading,
        error: propertyTreeError,
        data: propertyTreeData,
    } = usePropertyTreeQuery({});
    const [getSubject, { error: subjectError }] = useGetSubjectEntryLazyQuery();
    const [addTag] = useAddTagMutation();

    const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
        // dictionary: true,
        // document: true,
        theme: true,
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
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const { data, refetch } = useFindTagsQuery({ variables: { pageSize: 100 } });
    const [tags, setTags] = useState<string[]>([]);
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslate();

    const nodes = propertyTreeData?.hierarchy?.nodes || [];
    const paths = propertyTreeData?.hierarchy?.paths || [];

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
        setEntityCount(null);
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
        setEntityCount(null);
    }, []);

    // Row mapping functions
    const mapRecordTypeToColumn = (node: any, column: string) => {
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
                for  (const tag of tags) {
                    if (PropertyGroupEntity.tags!.includes(tag.id)) {
                        return node.name || "";
                    }
                }
                return "";
            default:
                return "";
        }
    };

    // Navigation handler
    const handleOnSelect = (id: string, column: string) => {
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
    };

    // Build data rows
    const buildRows = () => {
        const rows: any[] = [];
        const seenCombinations = new Set();

        paths.forEach((path, index) => {
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
                uniqueId: index,
            };

            path.forEach((id: string) => {
                const node = nodes.find((node) => node.id === id);
                if (node) {
                    [
                        // "dictionary",
                        // "document",
                        "theme",
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

            const combinationKey = `${row.theme}-${row.class}-${row.property}-${row.propertyGroup}`; // ${row.dictionary}-${row.document}-
            if (!seenCombinations.has(combinationKey)) {
                seenCombinations.add(combinationKey);
                rows.push(row);
            }
        });

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
    };

    // Tag filtering
    const handleTagFilter = (tag: string | null) => {
        setSelectedTag(tag);
    };

    // Add state for tagging operation status
    const [isTagging, setIsTagging] = useState(false);

    // Enhanced tag adding functionality with improved tag checking
    const handleAddTag = async () => {
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
            await refetch();
        } catch {
            enqueueSnackbar(<T keyName="grid_view.error_fetching_latest_tags" />, {
                variant: "warning",
            });
        }

        // Tag-ID ermitteln
        const selectedTagObj = data?.findTags.nodes.find(
            (tag) => tag.name === newTag
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

        // Map für eindeutige Katalog-Einträge
        const catalogMap = new Map<string, { already: boolean }>();

        // Prüfen, ob jeder Eintrag das Tag schon besitzt
        entries.forEach((row) => {
            Object.values(row.ids).forEach((entryId: any) => {
                if (!entryId) return;
                if (!catalogMap.has(entryId)) {
                    const hasTag =
                        Array.isArray(row.tags) &&
                        row.tags.some((tg: any) => tg.id === tagId);
                    catalogMap.set(entryId, { already: hasTag });
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

        // Tags hinzufügen
        let added = 0,
            failed = 0;
        for (const [entryId, status] of catalogMap.entries()) {
            if (status.already) continue;
            try {
                await addTag({
                    variables: { input: { catalogEntryId: entryId, tagId } },
                });
                added++;

                // Zeilen-Tags lokal aktualisieren
                entries.forEach((row) => {
                    Object.values(row.ids).forEach((id: any) => {
                        if (id === entryId) {
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
                        }
                    });
                });
            } catch {
                failed++;
            }
        }

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
        } else if (failed > 0) {
            enqueueSnackbar(<T keyName="grid_view.tags_adding_failed" />, { variant: "error" });
        }

        setIsTagging(false);
    };

    const handleTagChange = (event: SelectChangeEvent<string>) => {
        setNewTag(event.target.value as string);
    };

    // Data processing
    useMemo(() => {
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

            setEntityCount(uniqueValues.size); // Anzahl der eindeutigen Werte setzen
        } else {
            setEntityCount(null);
        }

        setFilteredRows(rows); // Aktualisiere die gefilterten Zeilen
    }, [visibleColumns, propertyTreeData, selectedTag]);

    // Effects for document loading and tag management
    useEffect(() => {
        const modelIds = Array.from(
            new Set(
                filteredRows.map((row) => row.ids.model).filter((id: string) => id)
            )
        );
        setModelIds(modelIds);
    }, [filteredRows]);

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
                        const response = await getSubject({ variables: { id } });
                        const documentNodes = response.data?.node?.referenceDocuments || [];
                        console.log(`Lade Referenzdokumente für ID ${id}:`, documentNodes);
                        documentNodes.forEach((doc: any) => {
                            if (doc?.id) {
                                newDocumentData[doc.id] = {
                                    name: doc.name || null,
                                    id: doc.id || null,
                                };
                            }
                        });
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
    }, [modelIds, getSubject]);

    useEffect(() => {
        if (data) {
            setTags(data.findTags.nodes.map((tag) => tag.name));
        }
    }, [data]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    // Tag filtering
    const excludedTags = [
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
    ];

    const filterTags = (tags: string[]) =>
        tags.filter((tag) => !excludedTags.includes(tag));

    const allTags = filterTags(tags).sort();

    const isAnyColumnHidden = Object.values(visibleColumns).some(
        (value) => !value
    );

    // DataGrid column definitions
    const columns: GridColDef[] = [
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
    ];

    if (propertyTreeLoading)
        return <Typography>{<T keyName="grid_view.loading" />}</Typography>;
    if (propertyTreeError)
        return <Typography>Error: {propertyTreeError.message}</Typography>;
    if (subjectError) return <Typography>Error: {subjectError.message}</Typography>;


    return (
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
                        >
                            {<T keyName="grid_view.show_only_themes" />}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleShowOnlyColumn("class")}
                        >
                            {<T keyName="grid_view.show_only_classes" />}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleShowOnlyColumn("propertyGroup")}
                        >
                            {<T keyName="grid_view.show_only_property_groups" />}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleShowOnlyColumn("property")}
                        >
                            {<T keyName="grid_view.show_only_properties" />}
                        </Button>
                        {isAnyColumnHidden && (
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleShowAllColumns}
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
                }}
            >
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
                    density="standard"
                    disableRowSelectionOnClick
                    // Updated pagination configuration for v8
                    pageSizeOptions={[25, 50, 100]}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 100, page: 0 },
                        },
                    }}
                    // Remove deprecated props
                    autoHeight={false}
                    // Keep important styling
                    scrollbarSize={10}
                    sx={{
                        height: "100%",
                        width: "100%",
                        flexGrow: 1,
                        border: "none",

                        "& .MuiDataGrid-virtualScroller": {
                            overflow: "auto",
                            "&::-webkit-scrollbar": {
                                width: "10px",
                                height: "10px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "rgba(0,0,0,0.2)",
                                borderRadius: "4px",
                            },
                        },

                        "& .MuiDataGrid-cell": {
                            padding: "8px",
                        },
                        "& .MuiDataGrid-row:nth-of-type(odd)": {
                            backgroundColor: "#f9f9f9",
                        },

                        "& .MuiDataGrid-main": {
                            overflow: "hidden",
                            flexGrow: 1,
                        },
                    }}
                    showToolbar
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                            quickFilterProps: { debounceMs: 300 },
                            csvOptions: {
                                delimiter: ",",
                                fileName: `datacat-export_${new Date()
                                    .toISOString()
                                    .slice(0, 10)}`,
                                utf8WithBom: true,
                            },
                        },
                    }}
                />
            </Box>

            {/* Selection Help Instructions - Simplified */}
            <Box
                sx={{
                    p: 1,
                    borderTop: "1px solid rgba(224, 224, 224, 1)",
                    backgroundColor: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    fontSize: "0.75rem",
                    color: "rgba(0, 0, 0, 0.6)",
                }}
            >
                <Typography variant="caption" fontWeight="bold">
                    {<T keyName="grid_view.selection_help" />}
                </Typography>
                <Box
                    component="span"
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                    <b>Shift + Click</b>
                    <span>{<T keyName="grid_view.for_range" />}</span>
                </Box>
            </Box>
        </TableContainer>
    );
};

export default memo(GridViewView);
