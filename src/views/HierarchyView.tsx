import React, { useState, useMemo, useCallback } from "react";
import { Paper, Typography, Stack, Box, Skeleton, Alert } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import { Hierarchy } from "../components/Hierarchy";
import { useQuery } from "@apollo/client/react";
import { ObjectPropsFragment, ItemPropsFragment, PropertyTreeDocument } from "../generated/graphql";
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
  const { loading, error, data, refetch } = useQuery(PropertyTreeDocument, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
    notifyOnNetworkStatusChange: false,
    returnPartialData: true,
    // Performance-Optimierungen
    pollInterval: 0, // Kein automatisches Polling
    // Aggressive Caching - Daten 10 Minuten im Cache behalten
    nextFetchPolicy: "cache-first",
  });
  
  // State for the currently selected concept:
  const [selectedConcept, setSelectedConcept] = useState<ObjectPropsFragment | null>(null);

  // Filter redundant theme root paths while keeping all nodes
  const { allNodes, filteredPaths } = useMemo(() => {
    if (!data?.hierarchy?.nodes || !data?.hierarchy?.paths) {
      return { allNodes: [], filteredPaths: [] };
    }
    
    const nodes = data.hierarchy.nodes;
    const paths = data.hierarchy.paths;
    
    // 1. Find all theme nodes (tagged with theme tag)
    const themeTag = "5997da9b-a716-45ae-84a9-e2a7d186bcf9";
    const themeNodeIds = new Set(
      nodes
        .filter(node => node.tags?.some(tag => tag.id === themeTag))
        .map(node => node.id)
    );
    
    // 2. Identify child themes (themes that appear in position > 0 in any path)
    const childThemeIds = new Set<string>();
    paths.forEach(path => {
      path.slice(1).forEach(nodeId => {
        if (themeNodeIds.has(nodeId)) {
          childThemeIds.add(nodeId); // This is a sub-theme
        }
      });
    });
    
    // 3. Filter paths: Remove paths that start with child themes
    const validPaths = paths.filter(path => {
      const rootNodeId = path[0];
      // Keep path if root is NOT a child theme
      return !childThemeIds.has(rootNodeId);
    });
    
    return { 
      allNodes: nodes,        // Keep ALL nodes for lookup
      filteredPaths: validPaths  // Only filter paths to remove redundant roots
    };
  }, [data?.hierarchy?.nodes, data?.hierarchy?.paths]);

  // Debounced selection handling to prevent rapid re-renders
  const debouncedSetSelection = useMemo(() => {
    const debounce = (func: Function, wait: number) => {
      let timeout: NodeJS.Timeout;
      return function(this: any, ...args: any[]) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    };
    return debounce((concept: ObjectPropsFragment) => setSelectedConcept(concept), 150);
  }, []);

  // Memoize the callback to prevent unnecessary re-renders
  const handleOnSelect = useCallback((concept: ObjectPropsFragment) => {
    debouncedSetSelection(concept);
  }, [debouncedSetSelection]);

  // Memoize the handler for clearing selected concept
  const handleDelete = useCallback(() => setSelectedConcept(null), []);

  // Memoize the left content to prevent re-renders
  const leftContent = useMemo(() => {
    // Progressive Loading: Zeige erste Daten sofort
    if (loading && !allNodes.length) {
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
    
    if (error && !allNodes.length) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          <T keyName="hierarchy.error">Beim Aufrufen des Merkmalsbaums ist ein Fehler aufgetreten.</T>
        </Alert>
      );
    } 
    
    // Render with filtered data - removes redundant theme roots
    if (allNodes.length) {
      return (
        <Hierarchy
          leaves={allNodes as ItemPropsFragment[]}
          paths={filteredPaths}
          onSelect={handleOnSelect}
          defaultCollapsed={true} // Bessere Performance durch collapsed state
        />
      );
    }
    
    return null;
  }, [loading, error, allNodes, filteredPaths, handleOnSelect]);

  // Memoize the right content to prevent re-renders
  const rightContent = useMemo(() => {
    if (!selectedConcept) {
      return (
        <HintTypography variant="body1">
          <T keyName="hierarchy.select_concept">Konzept in der Baumansicht auswählen, um Eigenschaften anzuzeigen.</T>
        </HintTypography>
      );
    }

    // Determine the entity type based on recordType and tags:
    const { id, recordType, tags } = selectedConcept;
    const entityType = getEntityType(recordType, tags.map(x => x.id));
    
    // Lazy loading für Forms - rendern erst bei Bedarf
    const FormComponent = React.lazy(() => {
      switch(entityType?.path) {
        case ThemeEntity.path:
          return import("./forms/ThemeForm").then(module => ({ default: module.default }));
        case ClassEntity.path:
          return import("./forms/DomainClassForm").then(module => ({ default: module.default }));
        case PropertyEntity.path:
          return import("./forms/PropertyForm").then(module => ({ default: module.default }));
        case ValueListEntity.path:
          return import("./forms/ValueListForm").then(module => ({ default: module.default }));
        case UnitEntity.path:
          return import("./forms/UnitForm").then(module => ({ default: module.default }));
        case ValueEntity.path:
          return import("./forms/ValueForm").then(module => ({ default: module.default }));
        case PropertyGroupEntity.path:
          return import("./forms/PropertyGroupForm").then(module => ({ default: module.default }));
        default:
          return import("./forms/DomainClassForm").then(module => ({ default: module.default }));
      }
    });
    
    const getIcon = () => {
      switch(entityType?.path) {
        case ThemeEntity.path: return <ThemeIcon />;
        case ClassEntity.path: return <DomainClassIcon />;
        case PropertyEntity.path: return <PropertyIcon />;
        case ValueListEntity.path: return <MeasureIcon />;
        case UnitEntity.path: return <UnitIcon />;
        case ValueEntity.path: return <ValueIcon />;
        case PropertyGroupEntity.path: return <PropertyGroupIcon />;
        default: return <DomainClassIcon />;
      }
    };
    
    const getTitle = () => {
      switch(entityType?.path) {
        case ThemeEntity.path: return <T keyName="theme.edit"/>;
        case ClassEntity.path: return <T keyName="class.edit"/>;
        case PropertyEntity.path: return <T keyName="property.edit"/>;
        case ValueListEntity.path: return <T keyName="valuelist.edit"/>;
        case UnitEntity.path: return <T keyName="unit.edit"/>;
        case ValueEntity.path: return <T keyName="value.edit"/>;
        case PropertyGroupEntity.path: return <T keyName="propertyGroup.edit"/>;
        default: return <T keyName="class.edit"/>;
      }
    };

    return (
      <React.Suspense fallback={<FormSkeleton />}>
        <Typography variant="h5">
          {getIcon()} {getTitle()}
        </Typography>
        <FormComponent id={id} onDelete={handleDelete} />
      </React.Suspense>
    );
  }, [selectedConcept, handleDelete]);

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
