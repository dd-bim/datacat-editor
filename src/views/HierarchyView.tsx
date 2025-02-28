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
    leftContent = <p>Beim Aufrufen des Merkmalsbaums ist ein Fehler aufgetreten.</p>;
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
        Konzept in der Baumansicht auswählen, um Eigenschaften anzuzeigen.
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
              <DomainGroupIcon /> Gruppe bearbeiten
            </Typography>
            <DomainGroupForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
        break;
      case ClassEntity.path:
        rightContent = (
          <>
            <Typography variant="h5">
              <DomainClassIcon /> Klasse bearbeiten
            </Typography>
            <DomainClassForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
        break;
      case PropertyEntity.path:
        rightContent = (
          <>
            <Typography variant="h5">
              <PropertyIcon /> Merkmal bearbeiten
            </Typography>
            <PropertyForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
        break;
      case MeasureEntity.path:
        rightContent = (
          <>
            <Typography variant="h5">
              <MeasureIcon /> Größe bearbeiten
            </Typography>
            <MeasureForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
        break;
      case UnitEntity.path:
        rightContent = (
          <>
            <Typography variant="h5">
              <UnitIcon /> Einheit bearbeiten
            </Typography>
            <UnitForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
        break;
      case ValueEntity.path:
        rightContent = (
          <>
            <Typography variant="h5">
              <ValueIcon /> Wert bearbeiten
            </Typography>
            <ValueForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
        break;
      default:
        rightContent = (
          <>
            <Typography variant="h5">
              <DomainModelIcon /> Fachmodell bearbeiten
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
          <Typography variant="h5">Katalog durchsuchen</Typography>
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
