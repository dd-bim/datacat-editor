import React, { FC, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import LinearProgress from "@mui/material/LinearProgress";
import { Button, Paper, Typography, Grid } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import DomainModelForm from "./forms/DomainModelForm";
import DomainGroupForm from "./forms/DomainGroupForm";
import DomainClassForm from "./forms/DomainClassForm";
import PropertyGroupForm from "./forms/PropertyGroupForm";
import PropertyForm from "./forms/PropertyForm";
import MeasureForm from "./forms/MeasureForm";
import UnitForm from "./forms/UnitForm";
import ValueForm from "./forms/ValueForm";
import ButtonGroup from "@mui/material/ButtonGroup";
import {
  FindPropGroupWithoutProp,
  FindPropWithoutSubjectOrPropGroup,
  FindModelWithoutGroup,
  FindGroupWithoutSubject,
  FindSubjectWithoutProp,
  FindMeasureWithoutProp,
  FindUnitWithoutMeasure,
  FindValueWithoutMeasure,
  FindMissingEnglishName,
  FindMultipleIDs,
  FindMissingDescription,
  FindMissingEnglishDescription,
  FindMultipleNames,
  FindMultipleNamesAcrossClasses,
} from "../components/Verification";
import {
  ConceptPropsFragment,
  useFindPropGroupWithoutPropTreeQuery,
  useFindPropWithoutSubjectOrPropGroupTreeQuery,
  useFindModelWithoutGroupTreeQuery,
  useFindGroupWithoutSubjectTreeQuery,
  useFindSubjectWithoutPropTreeQuery,
  useFindMeasureWithoutPropTreeQuery,
  useFindUnitWithoutMeasureTreeQuery,
  useFindValueWithoutMeasureTreeQuery,
  useFindMissingEnglishNameTreeQuery,
  useFindMultipleIDsTreeQuery,
  useFindMissingDescriptionTreeQuery,
  useFindMissingEnglishDescriptionTreeQuery,
  useFindMultipleNamesTreeQuery,
  useFindMultipleNamesAcrossClassesTreeQuery,
} from "../generated/types";
import {
  ClassEntity,
  DomainClassIcon,
  DomainGroupIcon,
  DomainModelIcon,
  getEntityType,
  GroupEntity,
  MeasureEntity,
  MeasureIcon,
  ModelEntity,
  PropertyEntity,
  PropertyGroupEntity,
  PropertyGroupIcon,
  PropertyIcon,
  UnitEntity,
  UnitIcon,
  ValueEntity,
  ValueIcon,
} from "../domain";
import ButtonComponent from "@mui/material/Button";
import { T } from "@tolgee/react";

const useStyles = makeStyles((theme: any) => ({
  paper: {
    padding: theme.spacing(2),
  },
  treeContainer: {
    // links: TreeView
    padding: theme.spacing(1),
  },
  form: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(1),
    borderLeft: `${theme.spacing(0.5)}px solid ${theme.palette.primary.light}`,
    borderRadius: theme.shape.borderRadius,
  },
  hint: {
    flexGrow: 1,
    textAlign: "center",
    color: theme.palette.grey[600],
    padding: theme.spacing(5),
  },
  headline: {
    marginBottom: 5,
    marginTop: 5,
  },
  buttonContainer: {
    marginBottom: theme.spacing(2),
  },
}));

// Haupt-View: Drei Spalten: Links (Kriterien), Mitte (Ergebnisse), Rechts (Detailansicht)
export function VerificationView() {
  const location = useLocation();
  const path = location.pathname; // z. B. "/search"
  const classes = useStyles();
  const [selectButton, setSelectButton] = useState("");
  const [selectCategory, setSelectCategory] = useState("");
  const [selectedConcept, setSelectedConcept] = useState<ConceptPropsFragment | null>(null);
  const [title, setTitle] = useState<React.ReactNode>(""); // <-- Hier die Variable `title` definieren

  // Statt navigate() nutzen wir hier den State:
  const handleOnSelect = (concept: ConceptPropsFragment) => {
    setSelectedConcept(concept);
  };

  const handleOnDelete = () => {
    setSelectedConcept(null);
  };

  // Linke Spalte: Auswahl der Prüfkriterien
  const renderCriteriaButtons = () => (
    <Paper className={classes.paper}>
      <T keyName="verification.title">Prüfkriterium</T>
      <Grid container direction="column" alignItems="stretch">
        <Grid item>
          <ButtonComponent onClick={() => setSelectButton("Integrität")}>
            <T keyName="verification.criteria.integrity">Integrität</T>
          </ButtonComponent>
        </Grid>
        <Grid item>
          <ButtonComponent onClick={() => setSelectButton("Eindeutigkeit")}>
            <T keyName="verification.criteria.uniqueness">Eindeutigkeit</T>
          </ButtonComponent>
        </Grid>
        <Grid item>
          <ButtonComponent onClick={() => setSelectButton("Sprache")}>
            <T keyName="verification.criteria.language">Sprache</T>
          </ButtonComponent>
        </Grid>
      </Grid>
      <div style={{ marginTop: 16 }}>
        {renderCategoryButtons()}
      </div>
    </Paper>
  );

  // Kategorie-Buttons (abhängig vom ausgewählten Prüfkriterium)
  const renderCategoryButtons = () => {
    switch (selectButton) {
      case "Integrität":
        return (
          <Grid container direction="column" alignItems="stretch">
            <Grid item>
              <ButtonComponent onClick={() => setSelectCategory("Fachmodelle ohne Gruppe")}>
                <T keyName="verification.category.no_model_group">Fachmodelle ohne Gruppe</T>
              </ButtonComponent>
            </Grid>
            <Grid item>
              <ButtonComponent onClick={() => setSelectCategory("Gruppen ohne Klasse")}>
                <T keyName="verification.category.no_group_class">Gruppen ohne Klasse</T>
              </ButtonComponent>
            </Grid>
            <Grid item>
              <ButtonComponent onClick={() => setSelectCategory("Klassen ohne Merkmale/Merkmalsgruppen")}>
                <T keyName="verification.category.no_class_properties">Klassen ohne Merkmale/Merkmalsgruppen</T>
              </ButtonComponent>
            </Grid>
            <Grid item>
              <ButtonComponent onClick={() => setSelectCategory("Merkmalsgruppen ohne Merkmale")}>
                <T keyName="verification.category.no_property_group">Merkmalsgruppen ohne Merkmale</T>
              </ButtonComponent>
            </Grid>
            <Grid item>
              <ButtonComponent onClick={() => setSelectCategory("Merkmale ohne Klasse oder Merkmalsgruppe")}>
                <T keyName="verification.category.no_property">Merkmale ohne Klasse oder Merkmalsgruppe</T>
              </ButtonComponent>
            </Grid>
            <Grid item>
              <ButtonComponent onClick={() => setSelectCategory("Größen die keinem Merkmal zugeordnet sind")}>
                <T keyName="verification.category.no_measure">Größen ohne Merkmal</T>
              </ButtonComponent>
            </Grid>
            <Grid item>
              <ButtonComponent onClick={() => setSelectCategory("Einheiten ohne Größe")}>
                <T keyName="verification.category.no_unit">Einheiten ohne Größe</T>
              </ButtonComponent>
            </Grid>
            <Grid item>
              <ButtonComponent onClick={() => setSelectCategory("Werte ohne Größe")}>
                <T keyName="verification.category.no_value">Werte ohne Größe</T>
              </ButtonComponent>
            </Grid>
          </Grid>
        );
      case "Eindeutigkeit":
        return (
          <Grid container direction="column" alignItems="stretch">
            <Grid item>
              <ButtonComponent onClick={() => setSelectCategory("ID-Duplikate")}>
                <T keyName="verification.category.duplicate_id">ID-Duplikate</T>
              </ButtonComponent>
            </Grid>
            <Grid item>
              <ButtonComponent onClick={() => setSelectCategory("Namen-Duplikate (innerhalb eines Types)")}>
                <T keyName="verification.category.duplicate_name_type">Namen-Duplikate (innerhalb eines Types)</T>
              </ButtonComponent>
            </Grid>
            <Grid item>
              <ButtonComponent onClick={() => setSelectCategory("Namen-Duplikate (gesamter Datenbestand)")}>
                <T keyName="verification.category.duplicate_name_all">Namen-Duplikate (gesamter Datenbestand)</T>
              </ButtonComponent>
            </Grid>
          </Grid>
        );
      case "Sprache":
        return (
          <Grid container direction="column" alignItems="stretch">
            <Grid item>
              <ButtonComponent onClick={() => setSelectCategory("Fehlende Beschreibung")}>
                <T keyName="verification.category.missing_description">Fehlende Beschreibung</T>
              </ButtonComponent>
            </Grid>
            <Grid item>
              <ButtonComponent onClick={() => setSelectCategory("Fehlende Beschreibung (englisch)")}>
                <T keyName="verification.category.missing_description_en">Fehlende Beschreibung (englisch)</T>
              </ButtonComponent>
            </Grid>
            <Grid item>
              <ButtonComponent onClick={() => setSelectCategory("Fehlende Namens-Übersetzung (englisch)")}>
                <T keyName="verification.category.missing_translation_en">Fehlende Namens-Übersetzung (englisch)</T>
              </ButtonComponent>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    switch (selectCategory) {
      case "Fachmodelle ohne Gruppe":
        setTitle(<T keyName="verification.category.no_model_group">Fachmodelle ohne Gruppe</T>);
        break;
      case "Gruppen ohne Klasse":
        setTitle(<T keyName="verification.category.no_group_class">Gruppen ohne Klasse</T>);
        break;
      case "Klassen ohne Merkmale/Merkmalsgruppen":
        setTitle(<T keyName="verification.category.no_class_properties">Klassen ohne Merkmale/Merkmalsgruppen</T>);
        break;
      case "Merkmalsgruppen ohne Merkmale":
        setTitle(<T keyName="verification.category.no_property_group">Merkmalsgruppen ohne Merkmale</T>);
        break;
      case "Merkmale ohne Klasse oder Merkmalsgruppe":
        setTitle(<T keyName="verification.category.no_property">Merkmale ohne Klasse oder Merkmalsgruppe</T>);
        break;
      case "Größen die keinem Merkmal zugeordnet sind":
        setTitle(<T keyName="verification.category.no_measure">Größen ohne Merkmal</T>);
        break;
      case "Einheiten ohne Größe":
        setTitle(<T keyName="verification.category.no_unit">Einheiten ohne Größe</T>);
        break;
      case "Werte ohne Größe":
        setTitle(<T keyName="verification.category.no_value">Werte ohne Größe</T>);
        break;
      case "ID-Duplikate":
        setTitle(<T keyName="verification.category.duplicate_id">ID-Duplikate</T>);
        break;
      case "Namen-Duplikate (innerhalb eines Types)":
        setTitle(<T keyName="verification.category.duplicate_name_type">Namen-Duplikate (innerhalb eines Types)</T>);
        break;
      case "Namen-Duplikate (gesamter Datenbestand)":
        setTitle(<T keyName="verification.category.duplicate_name_all">Namen-Duplikate (gesamter Datenbestand)</T>);
        break;
      case "Fehlende Beschreibung":
        setTitle(<T keyName="verification.category.missing_description">Fehlende Beschreibung</T>);
        break;
      case "Fehlende Beschreibung (englisch)":
        setTitle(<T keyName="verification.category.missing_description_en">Fehlende Beschreibung (englisch)</T>);
        break;
      case "Fehlende Namens-Übersetzung (englisch)":
        setTitle(<T keyName="verification.category.missing_translation_en">Fehlende Namens-Übersetzung (englisch)</T>);
        break;
      default:
        setTitle("");
        break;
    }
  }, [selectCategory]);

  // Mittlere Spalte: Ergebnisliste der gewählten Kategorie
  // Hier rendern wir unterschiedliche Komponenten, die jeweils einen TreeView anzeigen.
  // Diese Komponenten erhalten als onSelect den Callback, der den ausgewählten Eintrag in den State schreibt.
  const renderResultList = () => {
    switch (selectCategory) {
      case "Fachmodelle ohne Gruppe":
        return <ThisFindModelWithoutGroup />;
      case "Gruppen ohne Klasse":
        return <ThisFindGroupWithoutSubject />;
      case "Klassen ohne Merkmale/Merkmalsgruppen":
        return <ThisFindSubjectWithoutProp />;
      case "Merkmalsgruppen ohne Merkmale":
        return <ThisFindPropGroupWithoutProp />;
      case "Merkmale ohne Klasse oder Merkmalsgruppe":
        return <ThisFindPropWithoutSubjectOrPropGroup />;
      case "Größen die keinem Merkmal zugeordnet sind":
        return <ThisFindMeasureWithoutProp />;
      case "Einheiten ohne Größe":
        return <ThisFindUnitWithoutMeasure />;
      case "Werte ohne Größe":
        return <ThisFindValueWithoutMeasure />;
      case "ID-Duplikate":
        return <ThisFindMultipleIDs />;
      case "Namen-Duplikate (innerhalb eines Types)":
        return <ThisFindMultipleNames />;
      case "Namen-Duplikate (gesamter Datenbestand)":
        return <ThisFindMultipleNamesAcrossClasses />;
      case "Fehlende Beschreibung":
        return <ThisFindMissingDescription />;
      case "Fehlende Beschreibung (englisch)":
        return <ThisFindMissingEnglishDescription />;
      case "Fehlende Namens-Übersetzung (englisch)":
        return <ThisFindMissingEnglishName />;
      default:
        return (
          <Paper className={classes.paper}>
            <Typography className={classes.hint} variant="body1">
              <T keyName="verification.result.select_criteria">Prüfkriterium und Kategorie auswählen.</T>
            </Typography>
          </Paper>
        );
    }
  };

  // Rechte Spalte: Detailansicht des ausgewählten Eintrags (statt Navigation)
  const renderDetailView = () => {
    if (!selectedConcept) {
      return (
        <Typography className={classes.hint} variant="body1">
          <T keyName="verification.result.select_entry">Prüfergebnis in der Listenansicht auswählen um Eigenschaften anzuzeigen.</T>
        </Typography>
      );
    }
    const { id, recordType, tags } = selectedConcept;
    const entityType = getEntityType(recordType, tags.map((x) => x.id));
    switch (entityType?.path) {
      case GroupEntity.path:
        return (
          <>
            <Typography variant="h5">
              <DomainGroupIcon /> Gruppe bearbeiten
            </Typography>
            <DomainGroupForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
      case ClassEntity.path:
        return (
          <>
            <Typography variant="h5">
              <DomainClassIcon /> Klasse bearbeiten
            </Typography>
            <DomainClassForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
      case PropertyEntity.path:
        return (
          <>
            <Typography variant="h5">
              <PropertyIcon /> Merkmal bearbeiten
            </Typography>
            <PropertyForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
      case MeasureEntity.path:
        return (
          <>
            <Typography variant="h5">
              <MeasureIcon /> Größe bearbeiten
            </Typography>
            <MeasureForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
      case UnitEntity.path:
        return (
          <>
            <Typography variant="h5">
              <UnitIcon /> Einheit bearbeiten
            </Typography>
            <UnitForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
      case ValueEntity.path:
        return (
          <>
            <Typography variant="h5">
              <ValueIcon /> Wert bearbeiten
            </Typography>
            <ValueForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
      default:
        return (
          <>
            <Typography variant="h5">
              <DomainModelIcon /> Fachmodell bearbeiten
            </Typography>
            <DomainModelForm id={id} onDelete={() => setSelectedConcept(null)} />
          </>
        );
    }
  };

  // Die "ThisFind..."-Komponenten: Sie nutzen jeweils die entsprechenden TreeQuery-Hooks
  // und rendern die jeweilige Prüfroutine, wobei onSelect={handleOnSelect} übergeben wird.
  function ThisFindPropGroupWithoutProp() {
    const { loading, error, data } = useFindPropGroupWithoutPropTreeQuery({});
    if (loading) return <LinearProgress />;
    if (error) return <p>Fehler beim Aufrufen der Prüfroutine.</p>;
    return (
      <FindPropGroupWithoutProp
        leaves={data!.findPropGroupWithoutProp.nodes}
        paths={data!.findPropGroupWithoutProp.paths}
        onSelect={handleOnSelect}
      />
    );
  }

  function ThisFindPropWithoutSubjectOrPropGroup() {
    const { loading, error, data } = useFindPropWithoutSubjectOrPropGroupTreeQuery({});
    if (loading) return <LinearProgress />;
    if (error) return <p>Fehler beim Aufrufen der Prüfroutine.</p>;
    return (
      <FindPropWithoutSubjectOrPropGroup
        leaves={data!.findPropWithoutSubjectOrPropGroup.nodes}
        paths={data!.findPropWithoutSubjectOrPropGroup.paths}
        onSelect={handleOnSelect}
      />
    );
  }

  function ThisFindModelWithoutGroup() {
    const { loading, error, data } = useFindModelWithoutGroupTreeQuery({});
    if (loading) return <LinearProgress />;
    if (error) return <p>Fehler beim Aufrufen der Prüfroutine.</p>;
    return (
      <FindModelWithoutGroup
        leaves={data!.findModelWithoutGroup.nodes}
        paths={data!.findModelWithoutGroup.paths}
        onSelect={handleOnSelect}
      />
    );
  }

  function ThisFindGroupWithoutSubject() {
    const { loading, error, data } = useFindGroupWithoutSubjectTreeQuery({});
    if (loading) return <LinearProgress />;
    if (error) return <p>Fehler beim Aufrufen der Prüfroutine.</p>;
    return (
      <FindGroupWithoutSubject
        leaves={data!.findGroupWithoutSubject.nodes}
        paths={data!.findGroupWithoutSubject.paths}
        onSelect={handleOnSelect}
      />
    );
  }

  function ThisFindSubjectWithoutProp() {
    const { loading, error, data } = useFindSubjectWithoutPropTreeQuery({});
    if (loading) return <LinearProgress />;
    if (error) return <p>Fehler beim Aufrufen der Prüfroutine.</p>;
    return (
      <FindSubjectWithoutProp
        leaves={data!.findSubjectWithoutProp.nodes}
        paths={data!.findSubjectWithoutProp.paths}
        onSelect={handleOnSelect}
      />
    );
  }

  function ThisFindMeasureWithoutProp() {
    const { loading, error, data } = useFindMeasureWithoutPropTreeQuery({});
    if (loading) return <LinearProgress />;
    if (error) return <p>Fehler beim Aufrufen der Prüfroutine.</p>;
    return (
      <FindMeasureWithoutProp
        leaves={data!.findMeasureWithoutProp.nodes}
        paths={data!.findMeasureWithoutProp.paths}
        onSelect={handleOnSelect}
      />
    );
  }

  function ThisFindUnitWithoutMeasure() {
    const { loading, error, data } = useFindUnitWithoutMeasureTreeQuery({});
    if (loading) return <LinearProgress />;
    if (error) return <p>Fehler beim Aufrufen der Prüfroutine.</p>;
    return (
      <FindUnitWithoutMeasure
        leaves={data!.findUnitWithoutMeasure.nodes}
        paths={data!.findUnitWithoutMeasure.paths}
        onSelect={handleOnSelect}
      />
    );
  }

  function ThisFindValueWithoutMeasure() {
    const { loading, error, data } = useFindValueWithoutMeasureTreeQuery({});
    if (loading) return <LinearProgress />;
    if (error) return <p>Fehler beim Aufrufen der Prüfroutine.</p>;
    return (
      <FindValueWithoutMeasure
        leaves={data!.findValueWithoutMeasure.nodes}
        paths={data!.findValueWithoutMeasure.paths}
        onSelect={handleOnSelect}
      />
    );
  }

  function ThisFindMissingEnglishName() {
    const { loading, error, data } = useFindMissingEnglishNameTreeQuery({});
    if (loading) return <LinearProgress />;
    if (error) return <p>Fehler beim Aufrufen der Prüfroutine.</p>;
    return (
      <FindMissingEnglishName
        leaves={data!.findMissingEnglishName.nodes}
        paths={data!.findMissingEnglishName.paths}
        onSelect={handleOnSelect}
      />
    );
  }

  function ThisFindMultipleIDs() {
    const { loading, error, data } = useFindMultipleIDsTreeQuery({});
    if (loading) return <LinearProgress />;
    if (error) return <p>Fehler beim Aufrufen der Prüfroutine.</p>;
    return (
      <FindMultipleIDs
        leaves={data!.findMultipleIDs.nodes}
        paths={data!.findMultipleIDs.paths}
        onSelect={handleOnSelect}
      />
    );
  }

  function ThisFindMissingDescription() {
    const { loading, error, data } = useFindMissingDescriptionTreeQuery({});
    if (loading) return <LinearProgress />;
    if (error) return <p>Fehler beim Aufrufen der Prüfroutine.</p>;
    return (
      <FindMissingDescription
        leaves={data!.findMissingDescription.nodes}
        paths={data!.findMissingDescription.paths}
        onSelect={handleOnSelect}
      />
    );
  }

  function ThisFindMissingEnglishDescription() {
    const { loading, error, data } = useFindMissingEnglishDescriptionTreeQuery({});
    if (loading) return <LinearProgress />;
    if (error) {
      console.error(error.message);
      return <p>Fehler beim Aufrufen der Prüfroutine.</p>;
    }
    return (
      <FindMissingEnglishDescription
        leaves={data!.findMissingEnglishDescription.nodes}
        paths={data!.findMissingEnglishDescription.paths}
        onSelect={handleOnSelect}
      />
    );
  }

  function ThisFindMultipleNames() {
    const { loading, error, data } = useFindMultipleNamesTreeQuery({});
    if (loading) return <LinearProgress />;
    if (error) return <p>Fehler beim Aufrufen der Prüfroutine.</p>;
    return (
      <FindMultipleNames
        leaves={data!.findMultipleNames.nodes}
        paths={data!.findMultipleNames.paths}
        onSelect={handleOnSelect}
      />
    );
  }

  function ThisFindMultipleNamesAcrossClasses() {
    const { loading, error, data } = useFindMultipleNamesAcrossClassesTreeQuery({});
    if (loading) return <LinearProgress />;
    if (error) return <p>Fehler beim Aufrufen der Prüfroutine.</p>;
    return (
      <FindMultipleNamesAcrossClasses
        leaves={data!.findMultipleNamesAcrossClasses.nodes}
        paths={data!.findMultipleNamesAcrossClasses.paths}
        onSelect={handleOnSelect}
      />
    );
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={2}>
        {renderCriteriaButtons()}
      </Grid>
      <Grid item xs={3}>
        <Paper className={classes.paper}>
          <Typography variant="h6">{title}</Typography>
          {renderResultList()}
        </Paper>
      </Grid>
      <Grid item xs={7}>
        <Paper className={classes.paper}>
          {renderDetailView()}
        </Paper>
      </Grid>
    </Grid>
  );
}

export default VerificationView;
