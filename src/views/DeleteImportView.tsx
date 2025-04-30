import { Button, Typography, Grid, TextField, Paper, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, LinearProgress, Alert } from "@mui/material";
import View from "./View";
import { useState, ChangeEvent, useEffect } from "react";
import { SearchResultPropsFragment, useDeleteEntryMutation, useFindItemQuery, useFindTagsQuery } from "../generated/types";
import { Domain } from "../domain";
import { useSnackbar } from "notistack";
import { T } from "@tolgee/react";
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import { DataGrid, GridColDef, GridRenderCellParams, GridValidRowModel } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

export function DeleteImportView() {
  const navigate = useNavigate();
  const [tag, setTag] = useState<string>("");
  const [tagId, setTagId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [output, setOutput] = useState<React.ReactNode>("");
  const [deleteEntry] = useDeleteEntryMutation();
  const [records, setRecords] = useState<SearchResultPropsFragment[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const { enqueueSnackbar } = useSnackbar();

  // Handle tag text input with proper typing
  const handleTagChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTag(value);
    setOutput(""); // Clear previous messages when input changes
  };

  // Get all tags in database
  const { data: tagsData, loading: tagsLoading } = useFindTagsQuery({
    variables: {
      pageSize: 100,
    },
  });

  // Search entries with properties
  const { refetch, loading: searchLoading } = useFindItemQuery({
    variables: {
      input: {
        tagged: tagId ? [tagId] : [],
        entityTypeIn: Domain.map((x) => x.recordType),
      },
      pageSize: 10000,
    },
    fetchPolicy: "no-cache",
    skip: !tagId,
  });

  // Search if tag exists, if yes, find all entries tagged with it
  const handleSearch = async () => {
    if (!tag.trim()) {
      setRecords([]);
      return;
    }

    setIsFetching(true);
    
    try {
      const tagList = tagsData?.findTags.nodes ?? [];
      const tagObj = tagList.find((obj) => obj.name === tag);
      
      if (tagObj) {
        setTagId(tagObj.id);
        const result = await refetch({
          input: {
            tagged: [tagObj.id],
            entityTypeIn: Domain.map((x) => x.recordType),
          },
          pageSize: 10000,
        });
        
        const foundRecords = result.data.search.nodes || [];
        setRecords(foundRecords);
        
        // Set all rows as selected by default
        setSelectedRows(foundRecords.map(record => record.id));
        
        if (foundRecords.length === 0) {
          setOutput(
            <Alert severity="info">
              <T keyName="delete_import_view.no_entries_found" params={{ tag }} />
            </Alert>
          );
        }
      } else {
        setTagId("");
        setRecords([]);
        setOutput(
          <Alert severity="warning">
            <T keyName="delete_import_view.tag_not_exist" params={{ tag }} />
          </Alert>
        );
      }
    } catch (error) {
      console.error("Error searching for records:", error);
      setOutput(
        <Alert severity="error">
          <T keyName="delete_import_view.search_error" />
        </Alert>
      );
    } finally {
      setIsFetching(false);
    }
  };

  // Open confirmation dialog before deletion
  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  // Delete only selected entries with the given tag
  const handleDeleteEntries = async () => {
    setIsDeleteDialogOpen(false);
    
    if (selectedRows.length === 0) {
      enqueueSnackbar("Keine Einträge zum Löschen ausgewählt.", { variant: "info" });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      // Create a map of records by ID for efficient lookup
      const recordsById = Object.fromEntries(records.map(record => [record.id, record]));
      
      for (let i = 0; i < selectedRows.length; i++) {
        const recordId = selectedRows[i];
        const record = recordsById[recordId];
        
        if (!record) continue;
        
        try {
          await deleteEntry({
            variables: { id: recordId },
          });
          successCount++;
          enqueueSnackbar(
            <T keyName="delete_import_view.delete_success" params={{ name: record.name }} />, 
            { variant: "success" }
          );
        } catch (error) {
          errorCount++;
          console.error(`Error deleting entry ${record.name}:`, error);
        }
        
        // Update progress
        setProgress(Math.round(((i + 1) / selectedRows.length) * 100));
      }
      
      // Final summary notification
      if (successCount > 0) {
        enqueueSnackbar(
          <T 
            keyName="delete_import_view.delete_summary" 
            params={{ count: successCount, total: selectedRows.length }} 
          />, 
          { variant: "success" }
        );
        
        // Remove deleted records from the list
        setRecords(records.filter(record => !selectedRows.includes(record.id)));
        setSelectedRows([]);
      }
      
      if (errorCount > 0) {
        setOutput(
          <Alert severity="warning">
            <T 
              keyName="delete_import_view.delete_error_summary" 
              params={{ count: errorCount, total: records.length }} 
            />
          </Alert>
        );
      } else {
        setRecords([]);
        setTag("");
      }
    } catch (error) {
      console.error("Error in delete operation:", error);
      setOutput(
        <Alert severity="error">
          <T keyName="delete_import_view.error_occurred" />
        </Alert>
      );
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // Navigation handler for clicking on entries - updated to match GridViewView behavior
  const handleEntityClick = (entityType: string, id: string) => {
    let entityTypePath = "";
    
    // Map the entity type to the correct URL path
    switch (entityType) {
      case "Document":
        entityTypePath = "document";
        break;
      case "Bag":
        entityTypePath = "model";
        break;
      case "Group":
        entityTypePath = "group";
        break;
      case "Subject":
        entityTypePath = "class";
        break;
      case "Property":
        entityTypePath = "property";
        break;
      case "Nest":
        entityTypePath = "property-group";
        break;
      case "Value":
        entityTypePath = "value";
        break;
      case "Measure":
        entityTypePath = "measure";
        break;
      case "Unit":
        entityTypePath = "unit";
        break;
      default:
        console.warn(`Unknown entity type: ${entityType}`);
        return;
    }
    
    // Navigate to the entity page and reload to ensure data is fresh
    const newUrl = `/${entityTypePath}/${id}`;
    navigate(newUrl);
    window.location.reload();
  };

  // Debug records to understand tag structure when data is loaded
  useEffect(() => {
    if (records.length > 0) {
      console.log("Record structure:", records[0]);
    }
  }, [records]);

  // Process tags for display in the DataGrid
  const getFormattedTags = (record: SearchResultPropsFragment) => {
    if (!record.tags || !Array.isArray(record.tags)) {
      return "";
    }

    // Extract tag names, ensuring we handle different tag structures
    return record.tags
      .map((tag: any) => {
        if (typeof tag === "string") return tag;
        if (tag && typeof tag === "object") return tag.name || tag.label || tag.id;
        return null;
      })
      .filter(Boolean)
      .join(", ");
  };

  // DataGrid columns configuration
  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 2,
      renderCell: (params: GridRenderCellParams) => (
        <Box 
          sx={{ 
            cursor: 'pointer', 
            color: 'primary.main',
            '&:hover': { textDecoration: 'underline' }
          }}
          onClick={() => handleEntityClick(params.row.recordType, params.row.id)}
        >
          {params.value}
        </Box>
      )
    },
    { field: 'recordType', headerName: 'Type', flex: 1 },
    { 
      field: 'tags', // Use the actual field name from the data
      headerName: 'Tags',
      flex: 2,
      // Use renderCell instead of valueGetter for more control
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row;
        if (!row || !row.tags) return null;
        
        // Extract tag names from different possible structures
        let tagNames: string[] = [];
        
        try {
          if (Array.isArray(row.tags)) {
            tagNames = row.tags
              .map((tag: any) => {
                // Handle different tag structures
                if (typeof tag === 'string') return tag;
                if (tag && typeof tag === 'object') {
                  // Try different properties that might contain the tag name
                  return tag.name || tag.label || tag.id || JSON.stringify(tag);
                }
                return null;
              })
              .filter(Boolean);
          } else if (typeof row.tags === 'object') {
            // Handle case where tags might be a single object
            tagNames = [row.tags.name || row.tags.label || row.tags.id || JSON.stringify(row.tags)];
          }
        } catch (e) {
          console.error('Error processing tags:', e);
        }
        
        // If we found any tag names, join them
        if (tagNames.length > 0) {
          return <span>{tagNames.join(', ')}</span>;
        }
        
        // Fallback - show something to help debug
        return <span style={{ color: 'gray' }}>No tags</span>;
      }
    }
  ];

  return (
    <View heading={<T keyName="delete_import_view.heading" />}>
      <Typography variant="body1" component="p">
        <T keyName="delete_import_view.description" />
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid >
            <TextField 
              id="importTag" 
              label={<T keyName="delete_import_view.tag_label" />} 
              name="importTag" 
              variant="outlined" 
              fullWidth
              value={tag}
              onChange={handleTagChange}
              disabled={isLoading || isFetching}
            />
          </Grid>
          <Grid >
            <Box display="flex" gap={2}>
              <Button 
                variant="contained" 
                onClick={handleSearch}
                disabled={!tag.trim() || isLoading || isFetching}
              >
                <T keyName="delete_import_view.search_button" />
              </Button>
              
              <Button 
                variant="contained" 
                color="error" 
                startIcon={<DeleteIcon />}
                onClick={handleOpenDeleteDialog}
                disabled={records.length === 0 || isLoading || isFetching}
              >
                <T keyName="delete_import_view.delete_button" />
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {(isLoading || isFetching || tagsLoading || searchLoading) && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress variant={isLoading ? "determinate" : "indeterminate"} value={progress} />
          </Box>
        )}
        
        {output && <Box mt={2}>{output}</Box>}
        
        {records.length > 0 && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              <T keyName="delete_import_view.entries_to_delete" />
              {` (${records.length})`}
            </Typography>
            
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={records}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 25, page: 0 },
                  },
                }}
                checkboxSelection
                disableRowSelectionOnClick
                onRowSelectionModelChange={(newSelectionModel) => {
                  setSelectedRows(newSelectionModel.map(id => String(id)));
                }}
                rowSelectionModel={selectedRows}
                pageSizeOptions={[10, 25, 50, 100]}
                getRowId={(row) => row.id}
                sx={{
                  '& .MuiDataGrid-cell': { 
                    padding: '8px 16px',
                  },
                  '& .MuiDataGrid-row:nth-of-type(odd)': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              />
            </Box>
            
            <Box mt={2} display="flex" justifyContent="space-between">
              <Button
                variant="outlined"
                onClick={() => setSelectedRows(records.map(record => record.id))}
              >
                Select All
              </Button>
              <Button
                variant="outlined"
                onClick={() => setSelectedRows([])}
              >
                Deselect All
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="warning" sx={{ mr: 1 }} />
          <T keyName="delete_import_view.confirm_delete_title" />
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <T 
              keyName="delete_import_view.confirm_delete_message_simple" 
              params={{ tag, count: selectedRows.length }} 
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>
            <T keyName="delete_import_view.cancel" />
          </Button>
          <Button 
            color="error" 
            variant="contained"
            onClick={handleDeleteEntries}
            disabled={selectedRows.length === 0}
          >
            <T keyName="delete_import_view.confirm_delete" />
          </Button>
        </DialogActions>
      </Dialog>
    </View>
  );
}