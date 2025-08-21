import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { Paper, Typography, Button, Stack, Box } from "@mui/material";
import PlusIcon from "@mui/icons-material/Add";
import { Entity } from "../domain";
import CreateEntryButton from "../components/CreateEntryButton";
import SearchList from "../components/list/SearchList";
import { CatalogRecord } from "../types";
import { T } from "@tolgee/react";
import { AppContext } from "../context/AppContext";

// Updated styled components to better match list height
const SearchListPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  position: "sticky",
  top: "88px",
  display: 'flex',
  flexDirection: 'column',
  height: 'auto',
  minHeight: 'fit-content'
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
}));

const HintTypography = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  textAlign: "center",
  color: theme.palette.grey[600],
  padding: theme.spacing(5),
}));

type CompositeCatalogEntryViewProps = {
  entryType: Entity;
  renderForm(id: string): React.ReactNode;
};

const CompositeCatalogEntryView = (props: CompositeCatalogEntryViewProps) => {
  // Add context to force re-render on language change
  const { refreshCounter } = useContext(AppContext) || { refreshCounter: 0 };
  
  const {
    entryType: { tags, path, title, titlePlural, recordType },
    renderForm,
  } = props;
  
  // Force extracting these values when refreshCounter changes to ensure they update
  const currentTitle = title;
  const currentTitlePlural = titlePlural;
  
  const [height, setHeight] = useState(500);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDictionaryId, setSelectedDictionaryId] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const location = useLocation();
  
  // Reset height and search term when changing entity types
  useEffect(() => {
    setHeight(500);
    setSearchTerm("");
    setSelectedDictionaryId(null);
    setTotalCount(0);
  }, [path, recordType, refreshCounter]); // Add refreshCounter here

  const searchInput = useMemo(() => ({
    entityTypeIn: [recordType],
    tagged: tags,
  }), [recordType, tags]);

  // Bestimme ob Dictionary-Filter angezeigt werden soll
  // (für alle Entity-Typen außer Dictionary und Unit)
  const showDictionaryFilter = recordType !== "Dictionary" && recordType !== "Unit";
 
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const handleOnSelect = useCallback((value: CatalogRecord) => {
    navigate(`/${path}/${value.id}`);
  }, [navigate, path]);

  // Use the entryType directly instead of trying to compare translated titles
  const entryTypeName = props.entryType;

  const handleDictionaryFilterChange = useCallback((dictionaryId: string | null) => {
    setSelectedDictionaryId(dictionaryId);
  }, []);

  const handleSearchTermChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleTotalCountChange = useCallback((count: number) => {
    setTotalCount(count);
  }, []);

  return (
    <Stack 
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ 
        minHeight: 'calc(100vh - 140px)', // Changed from height to minHeight
        width: '100%',
        overflow: 'hidden'
      }}
      key={`entity-view-${path}-${refreshCounter}`}
    >
      {/* Left panel - Entity List */}
      <Box sx={{ 
        width: { xs: '100%', md: '450px' },  // Increased from 350px to 450px
        minWidth: { md: '400px' },           // Increased from 300px to 400px
        flexShrink: 0,
        height: 'fit-content', // Ensure it fits content exactly
        overflow: 'visible' // Changed from auto to visible
      }}>
        <SearchListPaper>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {currentTitlePlural} ({totalCount})
          </Typography>
          <Box sx={{ 
            width: '100%',
            display: 'flex', 
            flexDirection: 'column',
            mb: 0 // No bottom margin
          }}>
            <SearchList
              showRecordIcons={false}
              height={height}
              searchTerm={searchTerm}
              onSearch={handleSearchTermChange}
              searchInput={searchInput}
              disabledItems={id ? [id] : undefined}
              onSelect={handleOnSelect}
              showDictionaryFilter={showDictionaryFilter}
              selectedDictionaryId={selectedDictionaryId}
              onDictionaryFilterChange={handleDictionaryFilterChange}
              onTotalCountChange={handleTotalCountChange}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1}>
              <Button
                disabled={height >= 1500}
                onClick={() => setHeight(height + 250)}
                startIcon={<PlusIcon />}
                size="small"
              >
                <T keyName="composite_catalog_entry_view.more_results" />
              </Button>
              <CreateEntryButton EntryType={entryTypeName} />
            </Stack>
          </Box>
        </SearchListPaper>
      </Box>

      {/* Right panel - Form */}
      <Box sx={{ 
        flexGrow: 1,
        overflow: 'auto',
        height: { xs: 'auto', md: '100%' }
      }}>
        <StyledPaper>
          <Typography variant="h5" sx={{ mb: 2 }}>
            <T keyName="composite_catalog_entry_view.edit_entry" params={{ title: currentTitle }} />
          </Typography>
          {id ? (
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              {renderForm(id)}
            </Box>
          ) : (
            <HintTypography variant="body1">
              <T keyName="composite_catalog_entry_view.select_entry" params={{ title: currentTitle }} />
            </HintTypography>
          )}
        </StyledPaper>
      </Box>
    </Stack>
  );
};

export default CompositeCatalogEntryView;

