import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  usePropertyTreeQuery,
  useGetBagLazyQuery,
  useAddTagMutation,
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
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from "@mui/x-data-grid";
import { T, useTranslate } from "@tolgee/react";
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

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
  document: boolean;
  model: boolean;
  group: boolean;
  class: boolean;
  property: boolean;
  propertyGroup: boolean;
}

// Extracted and memoized tag component for better performance
const MemoizedTagChip = memo(({ tag, selectedTag, onTagClick }: { 
  tag: string, 
  selectedTag: string | null, 
  onTagClick: (tag: string | null) => void 
}) => (
  <TagChip
    key={tag}
    label={tag}
    clickable
    color={selectedTag === tag ? "secondary" : "default"}
    onClick={() => onTagClick(tag)}
  />
));

// Extracted TagFilterSection component for better organization
const TagFilterSection = ({ 
  allTags, 
  selectedTag, 
  handleTagFilter, 
  newTag, 
  handleTagChange, 
  handleAddTag, 
  t 
}: {
  allTags: string[],
  selectedTag: string | null,
  handleTagFilter: (tag: string | null) => void,
  newTag: string,
  handleTagChange: (event: SelectChangeEvent<string>) => void,
  handleAddTag: () => void,
  t: any
}) => (
  <>
    <HeaderContainer>
      <Typography variant="h6">
        {t('grid_view.tag_filter_title')}
      </Typography>
      <TagControls>
        <StyledFormControl variant="outlined">
          <InputLabel id="importTag-label">{t('grid_view.tag_filter_placeholder')}</InputLabel>
          <Select
            labelId="importTag-label"
            id="importTag"
            label={t('grid_view.tag_filter_placeholder')}
            name="importTag"
            value={newTag}
            onChange={handleTagChange}
            style={{ minWidth: "200px" }}
          >
            <MenuItem value="">
              <em>{t('grid_view.select_tag')}</em>
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
          {t('grid_view.add_tag')}
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
        label={t('grid_view.show_all')}
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
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const { data, refetch } = useFindTagsQuery({ variables: { pageSize: 100 } });
  const [tags, setTags] = useState<string[]>([]);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();

  const nodes = propertyTreeData?.hierarchy?.nodes || [];
  const paths = propertyTreeData?.hierarchy?.paths || [];

  // Column visibility handlers
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

  // Row mapping functions
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

  // Navigation handler
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

  // Build data rows
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

  // Tag filtering
  const handleTagFilter = (tag: string | null) => {
    setSelectedTag(tag);
  };

  // Add state for tagging operation status
  const [isTagging, setIsTagging] = useState(false);

  // Enhanced tag adding functionality with loading state
  const handleAddTag = async () => {
    if (!newTag) {
      enqueueSnackbar(t('grid_view.please_select_tag'), { variant: "error" });
      return;
    }

    // Start tagging and show loading state
    setIsTagging(true);
    enqueueSnackbar(t('grid_view.adding_tags'), { variant: "info" });

    let tagAdded = false;

    // Find the tag ID for the selected tag name
    const selectedTagObject = data?.findTags.nodes.find(
      (tag) => tag.name === newTag
    );
    const tagId = selectedTagObject ? selectedTagObject.id : null;

    if (!tagId) {
      enqueueSnackbar("Tag ID nicht gefunden.", { variant: "error" });
      return;
    }

    // Convert selectedRows from array to a Set for faster lookups
    const selectedRowIds = new Set(selectedRows);
    
    // Process each selected row
    for (const row of filteredRows) {
      if (!selectedRowIds.has(row.uniqueId.toString())) {
        continue; // Skip rows that aren't selected
      }
      
      // Process each catalog entry ID in the row
      for (const [column, entryId] of Object.entries(row.ids)) {
        if (typeof entryId !== 'string' || !entryId.trim()) {
          continue; // Skip empty IDs
        }
        
        // Check if this tag already exists for this entry
        const hasTagAlready = row.tags && row.tags.some(
          (tag: any) => tag.name === newTag && 
                        (tag.entryId === entryId || tag.catalogEntryId === entryId)
        );
        
        if (hasTagAlready) {
          continue; // Skip if tag already exists
        }
        
        try {
          const result = await addTag({
            variables: {
              input: {
                catalogEntryId: entryId,
                tagId: tagId,
              },
            },
          });
          
          if (result.data) {
            tagAdded = true;
            
            // Create a properly structured tag object
            const newTagObj = { 
              id: tagId,
              name: newTag,
              catalogEntryId: entryId, 
              entryId: entryId // Include both for compatibility
            };
            
            // Create a new tags array with the new tag
            row.tags = Array.isArray(row.tags) 
              ? [...row.tags, newTagObj] 
              : [newTagObj];
              
            console.log(`Tag '${newTag}' added to entry ${entryId}`);
          }
        } catch (error) {
          console.error(
            `Fehler beim Hinzufügen des Tags zu Eintrag ${entryId}:`,
            error
          );
        }
      }
    }

    // Ensure we complete the operation and hide loading state
    try {
      if (tagAdded) {
        await refetch();
        setFilteredRows([...filteredRows]);
        enqueueSnackbar(t('grid_view.tags_added_success'), { variant: "success" });
      } else {
        enqueueSnackbar(t('grid_view.no_tags_added'), { variant: "info" });
      }
    } catch (error) {
      enqueueSnackbar(t('grid_view.error_updating_tags'), { variant: "error" });
      console.error("Error updating tags:", error);
    } finally {
      setIsTagging(false);
    }
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
        filteredRows
          .map((row) => row.ids.model)
          .filter((id: string) => id)
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

  // Tag filtering
  const excludedTags = [
    "Fachmodell", "Gruppe", "Klasse", "Merkmal", 
    "Masseinheit", "Grösse", "Wert", "Maßeinheit", "Größe",
  ];

  const filterTags = (tags: string[]) =>
    tags.filter((tag) => !excludedTags.includes(tag));

  const allTags = filterTags(tags).sort();
  
  const isAnyColumnHidden = Object.values(visibleColumns).some(
    (value) => !value
  );

  // DataGrid column definitions
  const columns: GridColDef[] = [
    ...(visibleColumns.document ? [{
      field: 'document',
      headerName: t('grid_view.reference_documents'),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const documentName = documentNames[params.row.ids.model]?.name || params.value;
        const documentId = documentNames[params.row.ids.model]?.id;
        
        return (
          <Box 
            sx={{ 
              cursor: documentId ? 'pointer' : 'default',
              width: '100%', 
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                textDecoration: documentId ? 'underline' : 'none',
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (documentId) {
                handleOnSelect(documentId, 'document');
              }
            }}
          >
            {documentName || '\u00A0'}
          </Box>
        );
      }
    }] : []),
    
    ...(visibleColumns.model ? [{
      field: 'model',
      headerName: t('grid_view.domain_models'),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box 
          sx={{ 
            cursor: params.value ? 'pointer' : 'default',
            width: '100%', 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              textDecoration: params.value ? 'underline' : 'none',
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (params.value) {
              handleOnSelect(params.row.ids.model, 'model');
            }
          }}
        >
          {params.value || '\u00A0'}
        </Box>
      )
    }] : []),
    
    ...(visibleColumns.group ? [{
      field: 'group',
      headerName: t('grid_view.groups'),
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box 
          sx={{ 
            cursor: params.value ? 'pointer' : 'default',
            width: '100%', 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              textDecoration: params.value ? 'underline' : 'none',
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (params.value) {
              handleOnSelect(params.row.ids.group, 'group');
            }
          }}
        >
          {params.value || '\u00A0'}
        </Box>
      )
    }] : []),
    
    ...(visibleColumns.class ? [{
      field: 'class',
      headerName: t('grid_view.classes'),
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box 
          sx={{ 
            cursor: params.value ? 'pointer' : 'default',
            width: '100%', 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              textDecoration: params.value ? 'underline' : 'none',
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (params.value) {
              handleOnSelect(params.row.ids.class, 'class');
            }
          }}
        >
          {params.value || '\u00A0'}
        </Box>
      )
    }] : []),
    
    ...(visibleColumns.propertyGroup ? [{
      field: 'propertyGroup',
      headerName: t('grid_view.property_groups'),
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box 
          sx={{ 
            cursor: params.value ? 'pointer' : 'default',
            width: '100%', 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              textDecoration: params.value ? 'underline' : 'none',
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (params.value) {
              handleOnSelect(params.row.ids.propertyGroup, 'propertyGroup');
            }
          }}
        >
          {params.value || '\u00A0'}
        </Box>
      )
    }] : []),
    
    ...(visibleColumns.property ? [{
      field: 'property',
      headerName: t('grid_view.properties'),
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box 
          sx={{ 
            cursor: params.value ? 'pointer' : 'default',
            width: '100%', 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              textDecoration: params.value ? 'underline' : 'none',
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (params.value) {
              handleOnSelect(params.row.ids.property, 'property');
            }
          }}
        >
          {params.value || '\u00A0'}
        </Box>
      )
    }] : []),
  ];

  if (propertyTreeLoading) return <Typography>{t('grid_view.loading')}</Typography>;
  if (propertyTreeError) return <Typography>Error: {propertyTreeError.message}</Typography>;
  if (bagError) return <Typography>Error: {bagError.message}</Typography>;

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
          t={t}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <ButtonContainer>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleShowOnlyColumn("document")}
            >
              {t('grid_view.show_only_documents')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleShowOnlyColumn("model")}
            >
              {t('grid_view.show_only_models')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleShowOnlyColumn("group")}
            >
              {t('grid_view.show_only_groups')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleShowOnlyColumn("class")}
            >
              {t('grid_view.show_only_classes')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleShowOnlyColumn("propertyGroup")}
            >
              {t('grid_view.show_only_property_groups')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleShowOnlyColumn("property")}
            >
              {t('grid_view.show_only_properties')}
            </Button>
            {isAnyColumnHidden && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleShowAllColumns}
              >
                {t('grid_view.show_all')}
              </Button>
            )}
          </ButtonContainer>
          
          {/* Show loading indicator when tagging */}
          {isTagging && (
            <Box sx={{ width: '100%', mt: 1, mb: 1 }}>
              <LinearProgress />
              <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                {t('grid_view.adding_tags_please_wait')}
              </Typography>
            </Box>
          )}
        </Box>
        
      </FixedContainer>
      
      {/* Adjust Box to take remaining space without causing overflow */}
      <Box sx={{ 
        flexGrow: 1, // Let the box grow to fill available space
        width: '100%',
        overflow: 'hidden', // Ensure no overflow from this container
        display: 'flex', // Use flexbox
        flexDirection: 'column' // Stack children vertically
      }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.uniqueId}
          checkboxSelection
          onRowSelectionModelChange={(newSelectionModel) => {
            setSelectedRows(newSelectionModel.map(id => String(id)));
          }}
          density="standard"
          disableRowSelectionOnClick
          
          // Simplified pagination configuration
          paginationMode="client"
          initialState={{
            pagination: {
              paginationModel: { pageSize: 100, page: 0 },
            },
          }}
          pageSizeOptions={[25, 50, 100]}
          
          // Remove problemmatic props
          autoHeight={false}
          
          // Keep important styling
          scrollbarSize={10}
          
          sx={{
            height: '100%',
            width: '100%',
            flexGrow: 1,
            border: 'none',
            
            '& .MuiDataGrid-virtualScroller': {
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '10px',
                height: '10px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '4px'
              }
            },
            
            '& .MuiDataGrid-cell': {
              padding: '8px',
            },
            '& .MuiDataGrid-row:nth-of-type(odd)': {
              backgroundColor: '#f9f9f9',
            },
            
            '& .MuiDataGrid-main': {
              overflow: 'hidden',
              flexGrow: 1
            }
          }}
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 300 },
              // Add CSV export options to ensure UTF-8 encoding
              csvOptions: {
                delimiter: ',',
                fileName: `datacat-export_${new Date().toISOString().slice(0, 10)}`,
                utf8WithBom: true, // This ensures proper UTF-8 encoding with BOM for Excel
              }
            },
          }}
        />
      </Box>
      
      {/* Selection Help Instructions - Simplified */}
      <Box sx={{ 
        p: 1, 
        borderTop: '1px solid rgba(224, 224, 224, 1)',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        fontSize: '0.75rem',
        color: 'rgba(0, 0, 0, 0.6)'
      }}>
        <Typography variant="caption" fontWeight="bold">
          {t('grid_view.selection_help')}
        </Typography>
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <b>Shift + Click</b>
          <span>{t('grid_view.for_range')}</span>
        </Box>
      </Box>
    </TableContainer>
  );
};

export default memo(GridViewView);
