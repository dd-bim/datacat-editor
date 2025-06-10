import React, { useState, useMemo, useCallback } from "react";
import { Paper, Typography, Stack, Box, Skeleton, Alert } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import { Hierarchy } from "../components/Hierarchy";
import { ObjectPropsFragment, usePropertyTreeQuery } from "../generated/types";
import DomainModelForm from "./forms/DomainModelForm";
import DomainGroupForm from "./forms/DomainGroupForm";
import DomainClassForm from "./forms/DomainClassForm";
import PropertyGroupForm from "./forms/PropertyGroupForm";
import PropertyForm from "./forms/PropertyForm";
import ValueListForm from "./forms/ValueListForm";
import UnitForm from "./forms/UnitForm";
import ValueForm from "./forms/ValueForm";
import {
  DomainModelIcon,
  DomainGroupIcon,
  DomainClassIcon,
  PropertyGroupIcon,
  PropertyIcon,
  MeasureIcon,
  UnitIcon,
  ValueIcon,
  GroupEntity,
  ClassEntity,
  PropertyEntity,
  ValueListEntity,
  UnitEntity,
  ValueEntity,
  getEntityType,
} from "../domain";
import { T } from "@tolgee/react";

// Replace makeStyles with styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: 'auto', 
  display: 'flex',
  flexDirection: 'column',
}));

const HintTypography = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  textAlign: "center",
  color: theme.palette.grey[600],
  padding: theme.spacing(5),
}));

// Scrollable container for the tree view
const ScrollableTreeContainer = styled(Box)(({ theme }) => ({
  maxHeight: 'calc(100vh - 220px)', // Adjustable height
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.background.default,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[400],
    borderRadius: '4px',
  },
}));

// Loading skeleton for the form
const FormSkeleton = () => (
  <Box sx={{ mt: 2 }}>
    <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" height={100} />
  </Box>
);

const HierarchyView = () => {
  const { loading, error, data } = usePropertyTreeQuery({
    fetchPolicy: "cache-and-network" // Improve performance with caching
  });
  console.log("hierarchy", error);
  
  // State for the currently selected concept:
  const [selectedConcept, setSelectedConcept] = useState<ObjectPropsFragment | null>(null);

  // Memoize the callback to prevent unnecessary re-renders
  const handleOnSelect = useCallback((concept: ObjectPropsFragment) => {
    setSelectedConcept(concept);
  }, []);

  // Memoize the handler for clearing selected concept
  const handleDelete = useCallback(() => setSelectedConcept(null), []);

  // Memoize the left content to prevent re-renders
  const leftContent = useMemo(() => {
    if (loading && !data) {
      return (
        <>
          <LinearProgress />
          <Box sx={{ mt: 2 }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={30} sx={{ my: 1 }} />
            ))}
          </Box>
        </>
      );
    } 
    
    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          <T keyName="hierarchy.error">Beim Aufrufen des Merkmalsbaums ist ein Fehler aufgetreten.</T>
        </Alert>
      );
    } 
    
    return data && (
      <Hierarchy
        leaves={data.hierarchy.nodes}
        paths={data.hierarchy.paths}
        onSelect={handleOnSelect}
        defaultCollapsed={true} // Ensure tree is collapsed by default
      />
    );
  }, [loading, error, data, handleOnSelect]);

  // Memoize the right content to prevent re-renders
  const rightContent = useMemo(() => {
    if (!selectedConcept) {
      return (
        <HintTypography variant="body1">
          <T keyName="hierarchy.select_concept">Konzept in der Baumansicht auswählen, um Eigenschaften anzuzeigen.</T>
        </HintTypography>
      );
    }

    if (loading && !data) {
      return <FormSkeleton />;
    }

    // Determine the entity type based on recordType and tags:
    const { id, recordType, tags } = selectedConcept;
    const entityType = getEntityType(recordType, tags.map(x => x.id));
    
    switch(entityType?.path) {
      case GroupEntity.path:
        return (
          <>
            <Typography variant="h5">
              <DomainGroupIcon /> <T keyName="hierarchy.edit_theme">Thema bearbeiten</T>
            </Typography>
            <DomainGroupForm id={id} onDelete={handleDelete} />
          </>
        );
      case ClassEntity.path:
        return (
          <>
            <Typography variant="h5">
              <DomainClassIcon /> <T keyName="hierarchy.edit_class">Klasse bearbeiten</T>
            </Typography>
            <DomainClassForm id={id} onDelete={handleDelete} />
          </>
        );
      case PropertyEntity.path:
        return (
          <>
            <Typography variant="h5">
              <PropertyIcon /> <T keyName="hierarchy.edit_property">Merkmal bearbeiten</T>
            </Typography>
            <PropertyForm id={id} onDelete={handleDelete} />
          </>
        );
      case ValueListEntity.path:
        return (
          <>
            <Typography variant="h5">
              <MeasureIcon /> <T keyName="hierarchy.edit_measure">Größe bearbeiten</T>
            </Typography>
            <ValueListForm id={id} onDelete={handleDelete} />
          </>
        );
      case UnitEntity.path:
        return (
          <>
            <Typography variant="h5">
              <UnitIcon /> <T keyName="hierarchy.edit_unit">Einheit bearbeiten</T>
            </Typography>
            <UnitForm id={id} onDelete={handleDelete} />
          </>
        );
      case ValueEntity.path:
        return (
          <>
            <Typography variant="h5">
              <ValueIcon /> <T keyName="hierarchy.edit_value">Wert bearbeiten</T>
            </Typography>
            <ValueForm id={id} onDelete={handleDelete} />
          </>
        );
      default:
        return (
          <>
            <Typography variant="h5">
              <DomainModelIcon /> <T keyName="hierarchy.edit_model">Dictionary bearbeiten</T>
            </Typography>
            <DomainModelForm id={id} onDelete={handleDelete} />
          </>
        );
    }
  }, [selectedConcept, loading, data, handleDelete]);

  return (
    <Stack 
      direction={{ xs: 'column', md: 'row' }} 
      spacing={2} 
      sx={{ 
        minHeight: 'calc(100vh - 140px)',
        overflow: 'visible'
      }}
    >
      {/* Left panel - Tree View */}
      <Box sx={{ 
        flex: 1, 
        minWidth: { xs: '100%', md: '300px' }, 
        maxWidth: { md: '400px' }, 
        overflow: 'visible',
        height: 'fit-content'
      }}>
        <StyledPaper>
          <Typography variant="h5" sx={{ mb: 2 }}>
            <T keyName="hierarchy.search_catalog">Katalog durchsuchen</T>
          </Typography>
          <ScrollableTreeContainer>
            {leftContent}
          </ScrollableTreeContainer>
        </StyledPaper>
      </Box>
      
      {/* Right panel - Selected item details */}
      <Box sx={{ flex: 2, overflow: 'auto', width: { xs: '100%' } }}>
        <StyledPaper>
          {rightContent}
        </StyledPaper>
      </Box>
    </Stack>
  );
};

export default React.memo(HierarchyView);
