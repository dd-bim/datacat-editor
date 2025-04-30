import React, { useState } from "react";
import { Paper, Typography, Stack, Box } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import { Hierarchy } from "../components/Hierarchy";
import { ConceptPropsFragment, usePropertyTreeQuery } from "../generated/types";
import DomainModelForm from "./forms/DomainModelForm";
import DomainGroupForm from "./forms/DomainGroupForm";
import DomainClassForm from "./forms/DomainClassForm";
import PropertyGroupForm from "./forms/PropertyGroupForm";
import PropertyForm from "./forms/PropertyForm";
import MeasureForm from "./forms/MeasureForm";
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
  MeasureEntity,
  UnitEntity,
  ValueEntity,
  getEntityType,
} from "../domain";
import { T } from "@tolgee/react";

// Replace makeStyles with styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: 'auto', // Changed from 100% to auto
  display: 'flex',
  flexDirection: 'column',
}));

const HintTypography = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  textAlign: "center",
  color: theme.palette.grey[600],
  padding: theme.spacing(5),
}));

const HierarchyView = () => {
  const { loading, error, data } = usePropertyTreeQuery({});
  // State for the currently selected concept:
  const [selectedConcept, setSelectedConcept] = useState<ConceptPropsFragment | null>(null);

  // This callback is passed to the Hierarchy component (TreeView).
  // Instead of navigating, the selected concept is set in state.
  const handleOnSelect = (concept: ConceptPropsFragment) => {
    setSelectedConcept(concept);
  };

  let leftContent;
  if (loading) {
    leftContent = <LinearProgress />;
  } else if (error) {
    leftContent = <p><T keyName="hierarchy.error">Beim Aufrufen des Merkmalsbaums ist ein Fehler aufgetreten.</T></p>;
  } else {
    leftContent = (
      <Hierarchy
        leaves={data!.hierarchy.nodes}
        paths={data!.hierarchy.paths}
        onSelect={handleOnSelect}
      />
    );
  }

  // Depending on the selected concept, render the right area:
  let rightContent;
  if (!selectedConcept) {
    rightContent = (
      <HintTypography variant="body1">
        <T keyName="hierarchy.select_concept">Konzept in der Baumansicht auswählen, um Eigenschaften anzuzeigen.</T>
      </HintTypography>
    );
  } else {
    // Determine the entity type based on recordType and tags:
    const { id, recordType, tags } = selectedConcept;
    const entityType = getEntityType(recordType, tags.map(x => x.id));
    switch(entityType?.path) {
      case GroupEntity.path:
        rightContent = (
          <>
            <Typography variant="h5">
              <DomainGroupIcon /> <T keyName="hierarchy.edit_group">Gruppe bearbeiten</T>
            </Typography>
            <DomainGroupForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
        break;
      case ClassEntity.path:
        rightContent = (
          <>
            <Typography variant="h5">
              <DomainClassIcon /> <T keyName="hierarchy.edit_class">Klasse bearbeiten</T>
            </Typography>
            <DomainClassForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
        break;
      case PropertyEntity.path:
        rightContent = (
          <>
            <Typography variant="h5">
              <PropertyIcon /> <T keyName="hierarchy.edit_property">Merkmal bearbeiten</T>
            </Typography>
            <PropertyForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
        break;
      case MeasureEntity.path:
        rightContent = (
          <>
            <Typography variant="h5">
              <MeasureIcon /> <T keyName="hierarchy.edit_measure">Größe bearbeiten</T>
            </Typography>
            <MeasureForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
        break;
      case UnitEntity.path:
        rightContent = (
          <>
            <Typography variant="h5">
              <UnitIcon /> <T keyName="hierarchy.edit_unit">Einheit bearbeiten</T>
            </Typography>
            <UnitForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
        break;
      case ValueEntity.path:
        rightContent = (
          <>
            <Typography variant="h5">
              <ValueIcon /> <T keyName="hierarchy.edit_value">Wert bearbeiten</T>
            </Typography>
            <ValueForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
        break;
      default:
        rightContent = (
          <>
            <Typography variant="h5">
              <DomainModelIcon /> <T keyName="hierarchy.edit_model">Fachmodell bearbeiten</T>
            </Typography>
            <DomainModelForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
    }
  }

  return (
    <Stack 
      direction={{ xs: 'column', md: 'row' }} 
      spacing={2} 
      sx={{ 
        minHeight: 'calc(100vh - 140px)', // Changed from height to minHeight
        overflow: 'visible' // Changed from hidden to visible
      }}
    >
      {/* Left panel - Tree View */}
      <Box sx={{ 
        flex: 1, 
        minWidth: '300px', 
        maxWidth: { md: '400px' }, 
        overflow: 'visible', // Changed from auto to visible
        height: 'fit-content' // Added to make container fit content
      }}>
        <StyledPaper>
          <Typography variant="h5" sx={{ mb: 2 }}>
            <T keyName="hierarchy.search_catalog">Katalog durchsuchen</T>
          </Typography>
          <Box>
            {leftContent}
          </Box>
        </StyledPaper>
      </Box>
      
      {/* Right panel - Selected item details */}
      <Box sx={{ flex: 2, overflow: 'auto' }}>
        <StyledPaper>
          {rightContent}
        </StyledPaper>
      </Box>
    </Stack>
  );
};

export default HierarchyView;
