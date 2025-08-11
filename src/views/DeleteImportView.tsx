import {
  Button,
  Typography,
  Grid,
  TextField,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import View from "./View";
import { useState, ChangeEvent, useEffect } from "react";
import {
  SearchResultPropsFragment,
  useDeleteEntryMutation,
  useFindItemQuery,
  useFindTagsQuery,
} from "../generated/types";
import { Domain } from "../domain";
import { useSnackbar } from "notistack";
import { T } from "@tolgee/react";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
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
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set<string>(),
  });
  const [progress, setProgress] = useState(0);

  const { enqueueSnackbar } = useSnackbar();

  // Get all tags in database
  const { data: tagsData, loading: tagsLoading } = useFindTagsQuery({
    variables: {
      pageSize: 100,
    },
  });

  // Search entries with properties
  const { refetch, loading: searchLoading, error } = useFindItemQuery({
    variables: {
      input: {
        tagged: [tagId],
      },
      pageSize: 10000,
    },
    fetchPolicy: "no-cache"
  });
  const tagList = tagsData?.findTags.nodes ?? [];

  // Search if tag exists, if yes, find all entries tagged with it
  const handleSearch = async () => {
    setIsFetching(true);

    try {
      const result = await refetch({
        input: {
          tagged: [tagId],
        },
        pageSize: 10000,
      });

      const foundRecords = (result.data.search.nodes || []).map((record: any) => {
        if (record.recordType === "Dictionary" && record.dname?.texts?.length > 0) {
          return {
            ...record,
            name: record.dname.texts[0].text,
          };
        }
        return record;
      });
      setRecords(foundRecords);

      setSelectedRows({
        type: "include",
        ids: new Set(foundRecords.map((record) => record.id)),
      });

      if (foundRecords.length === 0) {
        setOutput(
          <Alert severity="info">
            <T keyName="delete_import_view.no_entries_found" />
          </Alert>
        );
      } else {
        setOutput("");
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

    if (selectedRows.ids.size === 0) {
      enqueueSnackbar("Keine Einträge zum Löschen ausgewählt.", {
        variant: "info",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      let successCount = 0;
      let errorCount = 0;

      // Create a map of records by ID for efficient lookup
      const recordsById = Object.fromEntries(
        records.map((record) => [record.id, record])
      );

      for (let i = 0; i < selectedRows.ids.size; i++) {
        const recordId = Array.from(selectedRows.ids)[i];
        const record = recordsById[recordId];

        if (!record) continue;

        try {
          await deleteEntry({
            variables: { id: String(recordId) },
          });
          successCount++;
          enqueueSnackbar(
            <T
              keyName="delete_import_view.delete_success"
            />,
            { variant: "success" }
          );
        } catch (error) {
          errorCount++;
          console.error(`Error deleting entry: `, error);
        }

        // Update progress
        setProgress(Math.round(((i + 1) / selectedRows.ids.size) * 100));
      }

      // Final summary notification
      if (successCount > 0) {
        enqueueSnackbar(
          <T
            keyName="delete_import_view.delete_summary"
            params={{ count: successCount, total: selectedRows.ids.size }}
          />,
          { variant: "success" }
        );

        // Remove deleted records from the list
        setRecords(
          records.filter((record) => !selectedRows.ids.has(record.id))
        );
        setSelectedRows({ type: "include", ids: new Set<string>() });
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
  const handleEntityClick = (tags: any[], id: string) => {
    let entityPath = "import";
    const recordTags: string[] = tags.map(tag => tag.id);
    for (const entity of Domain) {
      if (entity.tags && entity.tags.some(entityTag => recordTags.includes(entityTag))) {
        entityPath = entity.path;
      }
    }
    navigate(`/${entityPath}/${id}`);
    window.location.reload();
  };

  // DataGrid columns configuration
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 2,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            cursor: "pointer",
            color: "primary.main",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() =>
            handleEntityClick(params.row.tags, params.row.id)
          }
        >
          {params.value}
        </Box>
      ),
    },
    { field: "recordType", headerName: "Type", flex: 1 },
    {
      field: "tags",
      headerName: "Tags",
      flex: 2,
      renderCell: (params: GridRenderCellParams) => {
        const tags = params.row.tags;
        if (!tags) return <span style={{ color: "gray" }}>No tags</span>;

        const tagArray = Array.isArray(tags) ? tags : [tags];
        const tagNames = tagArray.map((tag: any) => tag.name);

        return tagNames.length > 0
          ? <span>{tagNames.join(", ")}</span>
          : <span style={{ color: "gray" }}>No tags</span>;
      },
    },
  ];

  return (
    <View heading={<T keyName="delete_import_view.heading" />}>
      <Typography variant="body1" component="p">
        <T keyName="delete_import_view.description" />
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid>
            <FormControl fullWidth sx={{ minWidth: 240 }}>
              <InputLabel id="importTag-label">
                <T keyName="delete_import_view.tag_label" />
              </InputLabel>
              <Select
                labelId="importTag-label"
                id="importTag"
                value={tag}
                label={<T keyName="delete_import_view.tag_label" />}
                onChange={(e) => {
                  const selectedTagName = e.target.value;
                  setTag(selectedTagName);
                  setOutput("");
                  const tagObj = tagList.find((t) => t.name === selectedTagName);
                  setTagId(tagObj ? tagObj.id : "");
                }}
              >
                {tagList.map((tagObj) => (
                  <MenuItem key={tagObj.id} value={tagObj.name}>
                    {tagObj.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid>
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
          <Box sx={{ width: "100%", mt: 2 }}>
            <LinearProgress
              variant={isLoading ? "determinate" : "indeterminate"}
              value={progress}
            />
          </Box>
        )}

        {output && <Box mt={2}>{output}</Box>}

        {records.length > 0 && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              <T keyName="delete_import_view.entries_to_delete" />
              {` (${records.length})`}
            </Typography>

            <Box sx={{ height: 400, width: "100%" }}>
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
                onRowSelectionModelChange={(newModel) => {
                  setSelectedRows(newModel);
                }}
                rowSelectionModel={selectedRows}
                pageSizeOptions={[10, 25, 50, 100]}
                getRowId={(row) => row.id}
                sx={{
                  "& .MuiDataGrid-cell": {
                    padding: "8px 16px",
                  },
                  "& .MuiDataGrid-row:nth-of-type(odd)": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              />
            </Box>

            <Box mt={2} display="flex" justifyContent="space-between">
              <Button
                variant="outlined"
                onClick={() =>
                  setSelectedRows({
                    type: "include",
                    ids: new Set(records.map((record) => record.id)),
                  })
                }
              >
                Select All
              </Button>
              <Button
                variant="outlined"
                onClick={() =>
                  setSelectedRows({ type: "include", ids: new Set<string>() })
                }
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
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          <WarningIcon color="warning" sx={{ mr: 1 }} />
          <T keyName="delete_import_view.confirm_delete_title" />
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <T
              keyName="delete_import_view.confirm_delete_message"
              params={{ tag, count: selectedRows.ids.size }}
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
            disabled={selectedRows.ids.size === 0}
          >
            <T keyName="delete_import_view.confirm_delete" />
          </Button>
        </DialogActions>
      </Dialog>
    </View>
  );
}
