import React, { useState, useMemo, useCallback } from "react";
import { Paper, Typography, Stack, Box, Skeleton, Alert } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import { Hierarchy } from "../components/Hierarchy";
import { ObjectPropsFragment, usePropertyTreeQuery } from "../generated/types";
import ThemeForm from "./forms/ThemeForm";
import DomainClassForm from "./forms/DomainClassForm";
import PropertyGroupForm from "./forms/PropertyGroupForm";
import PropertyForm from "./forms/PropertyForm";
import ValueListForm from "./forms/ValueListForm";
import UnitForm from "./forms/UnitForm";
import ValueForm from "./forms/ValueForm";
import {
  ThemeIcon,
  DomainClassIcon,
  PropertyGroupIcon,
  DictionaryIcon,
  PropertyIcon,
  MeasureIcon,
  UnitIcon,
  ValueIcon,
  ThemeEntity,
  ClassEntity,
  PropertyEntity,
  ValueListEntity,
  UnitEntity,
  ValueEntity,
  PropertyGroupEntity,
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
  const { loading, error, data, refetch } = usePropertyTreeQuery({
    fetchPolicy: "cache-first",
    errorPolicy: "all",
    notifyOnNetworkStatusChange: false,
    returnPartialData: true,
    // Performance-Optimierungen
    pollInterval: 0, // Kein automatisches Polling
  });
  
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
    // Progressive Loading: Zeige erste Daten sofort
    if (loading && !data?.hierarchy?.nodes?.length) {
      return (
        <>
          <LinearProgress />
          <Box sx={{ mt: 2 }}>
            {[...Array(8)].map((_, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Skeleton variant="circular" width={20} height={20} sx={{ mr: 1 }} />
                <Skeleton variant="text" width={`${50 + Math.random() * 30}%`} />
              </Box>
            ))}
          </Box>
        </>
      );
    } 
    
    if (error && !data?.hierarchy?.nodes?.length) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          <T keyName="hierarchy.error">Beim Aufrufen des Merkmalsbaums ist ein Fehler aufgetreten.</T>
        </Alert>
      );
    } 
    
    // Render mit partiellen Daten falls verfügbar
    if (data?.hierarchy?.nodes?.length) {
      return (
        <Hierarchy
          leaves={data.hierarchy.nodes}
          paths={data.hierarchy.paths}
          onSelect={handleOnSelect}
          defaultCollapsed={true} // Bessere Performance durch collapsed state
        />
      );
    }
    
    return null;
  }, [loading, error, data?.hierarchy, handleOnSelect]);

  // Memoize the right content to prevent re-renders
  const rightContent = useMemo(() => {
    if (!selectedConcept) {
      return (
        <HintTypography variant="body1">
          <T keyName="hierarchy.select_concept">Konzept in der Baumansicht auswählen, um Eigenschaften anzuzeigen.</T>
        </HintTypography>
      );
    }

    // Kein Loading-Skeleton für Forms - data ist bereits verfügbar
    // if (loading && !data) {
    //   return <FormSkeleton />;
    // }

    // Determine the entity type based on recordType and tags:
    const { id, recordType, tags } = selectedConcept;
    const entityType = getEntityType(recordType, tags.map(x => x.id));
    
    switch(entityType?.path) {
      case ThemeEntity.path:
        return (
          <>
            <Typography variant="h5">
              <ThemeIcon /> <T keyName="theme.edit"/>
            </Typography>
            <ThemeForm id={id} onDelete={handleDelete} />
          </>
        );
      case ClassEntity.path:
        return (
          <>
            <Typography variant="h5">
              <DomainClassIcon /> <T keyName="class.edit"/>
            </Typography>
            <DomainClassForm id={id} onDelete={handleDelete} />
          </>
        );
      case PropertyEntity.path:
        return (
          <>
            <Typography variant="h5">
              <PropertyIcon /> <T keyName="property.edit"/>
            </Typography>
            <PropertyForm id={id} onDelete={handleDelete} />
          </>
        );
      case ValueListEntity.path:
        return (
          <>
            <Typography variant="h5">
              <MeasureIcon /> <T keyName="valuelist.edit"/>
            </Typography>
            <ValueListForm id={id} onDelete={handleDelete} />
          </>
        );
      case UnitEntity.path:
        return (
          <>
            <Typography variant="h5">
              <UnitIcon /> <T keyName="unit.edit"/>
            </Typography>
            <UnitForm id={id} onDelete={handleDelete} />
          </>
        );
      case ValueEntity.path:
        return (
          <>
            <Typography variant="h5">
              <ValueIcon /> <T keyName="value.edit"/>
            </Typography>
            <ValueForm id={id} onDelete={handleDelete} />
          </>
        );
      case PropertyGroupEntity.path:
        return (
          <>
            <Typography variant="h5">
              <PropertyGroupIcon /> <T keyName="propertyGroup.edit"/>
            </Typography>
            <PropertyGroupForm id={id} onDelete={handleDelete} />
          </>
        );
      default:
        return (
          <>
            <Typography variant="h5">
              <DomainClassIcon /> <T keyName="class.edit"/>
            </Typography>
            <DomainClassForm id={id} onDelete={handleDelete} />
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              <T keyName="hierarchy.search_catalog">Katalog durchsuchen</T>
            </Typography>
            {/* Refresh Button falls Cache Probleme macht */}
            {error && (
              <button 
                onClick={() => refetch()} 
                style={{ 
                  padding: '4px 8px', 
                  fontSize: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  background: '#f5f5f5',
                  cursor: 'pointer'
                }}
              >
                ↻ Neu laden
              </button>
            )}
          </Box>
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
