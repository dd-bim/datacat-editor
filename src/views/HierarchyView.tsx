import React, { FC, useState } from "react";
import { Paper, Typography, Grid } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material/styles";
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

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    padding: theme.spacing(2),
  },
  hint: {
    flexGrow: 1,
    textAlign: "center",
    color: theme.palette.grey[600],
    padding: theme.spacing(5),
  },
}));

const HierarchyView: FC = () => {
  const classes = useStyles();
  const { loading, error, data } = usePropertyTreeQuery({});
  // State für das aktuell ausgewählte Konzept:
  const [selectedConcept, setSelectedConcept] = useState<ConceptPropsFragment | null>(null);

  // Dieser Callback wird an die Hierarchy-Komponente (TreeView) übergeben.
  // Statt zu navigieren, wird das ausgewählte Konzept in den State gesetzt.
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

  // Je nach ausgewähltem Konzept wird der rechte Bereich gerendert:
  let rightContent;
  if (!selectedConcept) {
    rightContent = (
      <Typography className={classes.hint} variant="body1">
        <T keyName="hierarchy.select_concept">Konzept in der Baumansicht auswählen, um Eigenschaften anzuzeigen.</T>
      </Typography>
    );
  } else {
    // Bestimme den Entity-Typ anhand der recordType und tags:
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
    <Grid container spacing={1}>
      <Grid item xs={5}>
        <Paper className={classes.paper}>
          <Typography variant="h5"><T keyName="hierarchy.search_catalog">Katalog durchsuchen</T></Typography>
          {leftContent}
        </Paper>
      </Grid>
      <Grid item xs={7}>
        <Paper className={classes.paper}>
          {rightContent}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default HierarchyView;
