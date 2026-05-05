import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Autocomplete,
  Divider,
  FormGroup,
  Radio,
  RadioGroup,
  FormControlLabel,
  IconButton,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { T, useTranslate } from "@tolgee/react";
import { useQuery } from "@apollo/client/react";
import { 
  CatalogRecordType, 
  PropertyTreeDocument, 
  FindItemDocument, 
  FindTagsDocument, 
  FindDictionariesDocument, 
  FindPropertyGroupsDocument,
  FindSubjectsForIdsDocument,
  FindClassesForIdsDocument
} from "../generated/graphql";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { IDS_IFC_ENTITIES } from "../components/idsEntities";
import { convertToIDSXml } from "../components/idsXmlConverter";
import { useSnackbar } from "notistack";
import { validateWithXSDLibrary } from "../components/idsValidatorBrowser";
import { useProfile } from "../providers/ProfileProvider";
import { SaveLoadDialog } from "../components/SaveLoadDialog";
import { autoSaveIDSData, getAutoSavedIDSData } from "../utils/idsStorage";
import { createMinIOUploader } from "../utils/MinIOUploader";
import { CreatePropertySetDialog } from "../components/CreatePropertySetDialog";
import { InfoButton } from "../components/InfoButton";
import { ClassEntity, PropertyGroupEntity, ThemeEntity } from "../domain";
import { PropertyRequirement } from "../components/requirements/PropertyRequirement";
import { AttributeRequirement } from "../components/requirements/AttributeRequirement";
import { ClassificationRequirement } from "../components/requirements/ClassificationRequirement";
import { useIDSData } from "../hooks/useIDSData";
import { useIDSUtilities } from "../hooks/useIDSUtilities";
import { DATA_TYPE_OPTIONS } from "../constants/idsConstants";


const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
}));

export const IDSExportView: React.FC = () => {
  const { profile } = useProfile();
  const { t } = useTranslate();

  // Add error event listeners for debugging
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Don't prevent default to allow other handlers to work
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Typen für alle Requirement-Varianten
  type PropertyRequirement = {
    type: "property";
    propertySet?: string;
    baseNames?: string[]; // IDs der gewählten Merkmale
    valueMap?: Record<string, string[]>; // Merkmal-ID -> Value-IDs
    dataType?: string;
    uri?: string;
    cardinality?: string;
  };
  type Requirement =
    | {
        type: "classification";
        value: string; // ModelId
        modelName?: string;
        selectedThemes?: string[]; // IDs der gewählten Themen
        selectedSubThemes?: string[]; // IDs der gewählten Unterthemen
        selectedClasses?: string[]; // Optional: IDs der gewählten Klassen
        classNames?: string[]; // Optional: Namen der gewählten Klassen für die XML-Ausgabe
        valueNames?: string[]; // Für die XML-Ausgabe
        dataType?: string;
        cardinality?: string;
      }
    | {
        type: "attribute";
        value: string; // ModelId oder ClassId
        valueNames?: string; // Modellname oder Klassenname als Pattern
        dataType?: string;
        cardinality?: string;
      }
    | PropertyRequirement;

  const [specRows, setSpecRows] = useState<
    {
      id: number;
      name: string;
      applicabilityType: "type" | "classification";
      ifcVersions: string[]; // Changed to array for multiple versions
      requirements: Requirement[];
      ifcClasses?: string[]; // Changed to array for multiple classes
    }[]
  >([]);
  const [addRowMode, setAddRowMode] = useState(false);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [specName, setSpecName] = useState("");
  const [applicabilityType, setApplicabilityType] = useState<"type" | "classification">("type");
  const [ifcVersions, setIfcVersions] = useState<string[]>(["IFC4"]); // Changed to array
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [ifcClasses, setIfcClasses] = useState<string[]>([]); // Changed to array
  const [showIfcSuggestions, setShowIfcSuggestions] = useState(false);
  const [idsTitle, setIdsTitle] = useState("");
  const [idsVersion, setIdsVersion] = useState("1.0");
  const [isIdsGenerated, setIsIdsGenerated] = useState(false); 
  const [saveLoadDialogOpen, setSaveLoadDialogOpen] = useState(false);
  const [saveLoadMode, setSaveLoadMode] = useState<'ids' | 'specification'>('ids');
  const [hasShownAutoSaveNotification, setHasShownAutoSaveNotification] = useState(false);
  const [createPropertySetDialogOpen, setCreatePropertySetDialogOpen] = useState(false);
  const [newlyCreatedPropertySets, setNewlyCreatedPropertySets] = useState<Map<string, any[]>>(new Map());
  
  // Tag filtering state
  const [selectedTagForClasses, setSelectedTagForClasses] = useState<string | null>(null);
  const [selectedTagForProperties, setSelectedTagForProperties] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  const { enqueueSnackbar } = useSnackbar();

  // DataCat - Reduzierte pageSize für bessere Performance
  const { data, loading, error, refetch: refetchPropertyTree } = useQuery(PropertyTreeDocument, {
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  });

  // Query: Dictionaries - mit reduzierter pageSize
  const {
    data: dictionariesData,
    loading: dictionariesLoading,
    error: dictionariesError,
    refetch: refetchDictionaries,
  } = useQuery(FindDictionariesDocument, {
    variables: {
      input: {
        pageSize: 200, // Reduziert von 1000
      },
    },
    fetchPolicy: "cache-first",
    skip: loading, // Warte bis PropertyTree geladen ist
  });

  // Query: Classes - Zeitlich gestaffelt mit erhöhter pageSize für alle Klassen
  const {
    data: classesData,
    loading: classesLoading,
    error: classesError,
    refetch: refetchClasses,
  } = useQuery(FindClassesForIdsDocument, {
    variables: {
      input: {
        tagged: ClassEntity.tags, // nur Klassen
        pageSize: 1000,
      },
    },
    fetchPolicy: "cache-first",
    skip: loading || dictionariesLoading, // Warte bis vorherige Queries fertig sind
  });

  // Query: Property Groups - Zeitlich gestaffelt
  const {
    data: allItemsData,
    loading: allItemsLoading,
    error: allItemsError,
    refetch: refetchAllItems,
  } = useQuery(FindPropertyGroupsDocument, {
    variables: {
      input: {
        tagged: PropertyGroupEntity.tags, // PropertyGroup Tag verwenden
        pageSize: 200, // Reduziert von 1000
      },
    },
    fetchPolicy: "cache-first",
    errorPolicy: "all",
    skip: loading || dictionariesLoading || classesLoading, // Warte bis vorherige Queries fertig sind
  });

  // Tags Query für Filterung - kleine Query, kann früh laufen
  const { data: tagsData, refetch: refetchTags } = useQuery(FindTagsDocument, {
    variables: { pageSize: 100 },
    fetchPolicy: "cache-first",
  });

  // Query: Alle Subjects (Themen) - Zeitlich gestaffelt mit reduzierter pageSize
  const { 
    data: allSubjectsData, 
    loading: allSubjectsLoading,
    refetch: refetchAllSubjects 
  } = useQuery(FindSubjectsForIdsDocument, {
    variables: {
      input: {
        tagged: ThemeEntity.tags, // Thema-Tag
        pageSize: 200, // Reduziert von 1000
      },
    },
    fetchPolicy: "cache-first",
    skip: loading || dictionariesLoading || classesLoading || allItemsLoading, // Warte bis vorherige Queries fertig sind
  });

  // Error Handling für alle Queries
  useEffect(() => {
    if (allItemsError) {
      console.error('Error loading property groups:', allItemsError);
    }
    if (dictionariesError) {
      console.error('Error loading dictionaries:', dictionariesError);
    }
    if (classesError) {
      console.error('Error loading classes:', classesError);
    }
    if (error) {
      console.error('Error loading property tree:', error);
    }
  }, [allItemsError, dictionariesError, classesError, error]);

  // Snackbar-Benachrichtigung wenn Klassen erfolgreich geladen wurden
  useEffect(() => {
    if (!classesLoading && classesData?.findSubjects?.nodes) {
      const classesCount = classesData.findSubjects.nodes.length;
      if (classesCount > 0) {
        // Nur einmal beim initialen Laden benachrichtigen
        const hasNotified = sessionStorage.getItem('classesLoadedNotified');
        if (!hasNotified) {
          enqueueSnackbar(
            `${classesCount} Klassen erfolgreich geladen`,
            { variant: "success", autoHideDuration: 3000 }
          );
          sessionStorage.setItem('classesLoadedNotified', 'true');
        }
      }
    }
  }, [classesLoading, classesData, enqueueSnackbar]);

  // Custom Hooks für Datenverarbeitung
  const { propertyGroupOptions, dictionaryOptions, classOptions } = useIDSData(
    allItemsData?.findSubjects?.nodes || [],
    dictionariesData?.findDictionaries?.nodes || [],
    classesData?.findSubjects?.nodes || [],
    newlyCreatedPropertySets
  );

  // Helper-Funktionen für hierarchische Themen-/Klassen-Auswahl
  const getThemesForDictionary = useCallback((dictionaryId: string) => {
    if (!allSubjectsData?.findSubjects?.nodes || !dictionaryId) return [];
    
    return allSubjectsData.findSubjects.nodes
      .filter((subject: any) => {
        // Filtere nach Dictionary und Thema-Tag
        if (subject.dictionary?.id !== dictionaryId) return false;
        const hasThemeTag = subject.tags?.some((tag: any) => ThemeEntity.tags?.includes(tag.id));
        return hasThemeTag;
      })
      .map((subject: any) => ({
        id: subject.id,
        name: subject.name?.texts?.[0]?.text || subject.name || subject.id,
        dictionaryId: subject.dictionary?.id,
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [allSubjectsData]);

  const getSubThemesForTheme = useCallback((parentThemeId: string) => {
    // Unterthemen-Filterung deaktiviert wegen Backend-Performance
    // Gibt leeres Array zurück, da hierarchische Filterung ohne connectingSubjects nicht möglich
    return [];
  }, []);

  // Hole alle Klassen für ein ausgewähltes Thema oder Unterthema (vereinheitlicht)
  const getClassesForThemeOrSubTheme = useCallback((themeId: string) => {
    // Thema-spezifische Filterung deaktiviert wegen Backend-Performance
    // Gibt alle Klassen ohne Themen-Filter zurück
    if (!classesData?.findSubjects?.nodes) return [];
    
    return classesData.findSubjects.nodes
      .map((classNode: any) => ({
        id: classNode.id,
        name: classNode.name?.texts?.[0]?.text || classNode.name || classNode.id,
        themeId,
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [classesData]);

  // NEUE Funktion: Hole ALLE Klassen für ein Dictionary (ohne Themen-Filter)
  const getAllClassesForDictionary = useCallback((dictionaryId: string) => {
    if (!classesData?.findSubjects?.nodes || !dictionaryId) return [];
    
    return classesData.findSubjects.nodes
      .filter((classNode: any) => {
        // Filtere nur nach Dictionary
        return classNode.dictionary?.id === dictionaryId;
      })
      .map((classNode: any) => ({
        id: classNode.id,
        name: classNode.name?.texts?.[0]?.text || classNode.name || classNode.id,
        dictionaryId,
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [classesData]);

  // Neue Funktion: Prüfe ob ein Thema Unterthemen hat
  const hasSubThemes = useCallback((themeId: string) => {
    return getSubThemesForTheme(themeId).length > 0;
  }, [getSubThemesForTheme]);

  const {
    getPropertySetUri,
    getPropertiesForPropertySet,
    getValuesForProperty,
    getModelNameById,
    getClassNameById,
    getClassesForModel,
    getClassificationUri,
    getRequirementUri,
  } = useIDSUtilities(propertyGroupOptions, data, newlyCreatedPropertySets, dictionaryOptions, classOptions);

  useEffect(() => {
    setShowIfcSuggestions(false);
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only auto-save if there's meaningful content
      if (specRows.length > 0 || idsTitle.trim()) {
        autoSaveIDSData(idsTitle, specRows, newlyCreatedPropertySets, idsVersion);
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [idsTitle, idsVersion, specRows, newlyCreatedPropertySets]);

  // Check for auto-saved data on component mount
  useEffect(() => {
    if (!hasShownAutoSaveNotification) {
      const autoSaved = getAutoSavedIDSData();
      if (autoSaved && (autoSaved.data.specRows.length > 0 || autoSaved.data.idsTitle.trim())) {
        enqueueSnackbar(
          <T keyName="ids_export.success_messages.auto_save_found" />, 
          { 
          variant: "info",
          autoHideDuration: 8000, // Wird nach 8 Sekunden automatisch ausgeblendet
          action: (key) => (
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => {
                setSaveLoadMode('ids');
                setSaveLoadDialogOpen(true);
              }}
            >
              Öffnen
            </Button>
          )
        });
        setHasShownAutoSaveNotification(true);
      }
    }
  }, [enqueueSnackbar, hasShownAutoSaveNotification]);

  // Requirement hinzufügen
  const handleAddRequirement = () => {
    const newReq = applicabilityType === "classification"
      ? { type: "attribute" as const, value: "", dataType: "", cardinality: "required" }
      : { type: "property" as const, propertySet: "", baseNames: [], valueMap: {}, dataType: "", uri: "", cardinality: "required" };
    
    setRequirements((reqs) => [...reqs, newReq]);
  };

  // Requirement ändern
  const handleRequirementChange = (
    idx: number,
    value: any,
    modelId?: string
  ) => {
    setRequirements((reqs: any) =>
      reqs.map((r: any, i: number) => {
        if (i !== idx) return r;
        if (r.type === "property") {
          // propertySet geändert: reset baseNames und valueMap
          if (value.propertySet && value.propertySet !== r.propertySet) {
            return {
              ...r,
              ...value,
              baseNames: [],
              valueMap: {},
              uri: getPropertySetUri(value.propertySet),
              dataType: "", // zurücksetzen
            };
          }
          // baseNames geändert: reset valueMap für nicht mehr gewählte baseNames
          if (value.baseNames) {
            const newValueMap: Record<string, string[]> = {};
            (value.baseNames as string[]).forEach((baseId: string) => {
              newValueMap[baseId] = (r as PropertyRequirement).valueMap?.[baseId] || [];
            });
            return {
              ...r,
              ...value,
              valueMap: newValueMap,
            };
          }
          // valueMap geändert (Werte für ein Merkmal)
          if (value.valueMap) {
            return {
              ...r,
              valueMap: value.valueMap,
            };
          }
          // dataType explizit geändert
          if (typeof value.dataType === "string") {
            return {
              ...r,
              dataType: value.dataType,
            };
          }
          return { ...r, ...value };
        }
        // Für classification/attribute
        if (r.type === "classification") {
          // Wenn ein komplettes Objekt übergeben wird (z.B. bei dataType/cardinality Änderungen)
          if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            // Bei Classification: Wenn value (Dictionary/Modell) geändert wird, alles zurücksetzen
            if (value.value && value.value !== r.value) {
              return {
                ...r,
                ...value,
                selectedThemes: [],
                selectedSubThemes: [],
                selectedClasses: [],
                classNames: [],
              };
            }
            // Wenn selectedThemes geändert wird, SubThemes und Classes zurücksetzen
            if (value.selectedThemes && JSON.stringify(value.selectedThemes) !== JSON.stringify(r.selectedThemes)) {
              return {
                ...r,
                selectedThemes: value.selectedThemes,
                selectedSubThemes: [],
                selectedClasses: [],
                classNames: [],
              };
            }
            // Wenn selectedSubThemes geändert wird, Classes zurücksetzen
            if (value.selectedSubThemes && JSON.stringify(value.selectedSubThemes) !== JSON.stringify(r.selectedSubThemes)) {
              return {
                ...r,
                selectedSubThemes: value.selectedSubThemes,
                selectedClasses: [],
                classNames: [],
              };
            }
            // Wenn selectedClasses geändert wird
            if (value.selectedClasses) {
              const classNames = value.selectedClasses.map((classId: string) => getClassNameById(classId));
              return {
                ...r,
                ...value,
                classNames,
              };
            }
            // Für andere Eigenschaften wie dataType, cardinality
            return { ...r, ...value };
          }
          // String-Wert (Model-ID) - für Modell-Auswahl
          if (typeof value === "string" && value !== r.value) {
            return {
              ...r,
              value,
              selectedThemes: [],
              selectedSubThemes: [],
              selectedClasses: [],
              classNames: [],
            };
          }
          // Wenn selectedClasses als separates Objekt geändert wird
          if (value.selectedClasses) {
            const classNames = value.selectedClasses.map((classId: string) => getClassNameById(classId));
            return {
              ...r,
              selectedClasses: value.selectedClasses,
              classNames,
            };
          }
          // Fallback für String-Werte
          if (typeof value === "string") {
            return { ...r, value };
          }
          // Fallback für Objekte - nur die bekannten Properties übernehmen
          return { ...r, ...value };
        }
        // Für andere Requirement-Typen
        if (typeof value === "string") {
          return {
            ...r,
            value,
          };
        }
        // Für Objekt-Updates bei anderen Typen
        return { ...r, ...value };
      })
    );
  };

  // Requirement-Typ ändern
  const handleRequirementTypeChange = (
    idx: number,
    type: "classification" | "attribute" | "property"
  ) => {
    setRequirements((reqs: any) => {
      const newReqs = reqs.map((r: any, i: number) => {
        if (i !== idx) return r;
        if (type === "property") {
          return {
            type: "property",
            propertySet: "",
            baseNames: [],
            valueMap: {},
            dataType: "",
            uri: "",
            cardinality: "required",
          };
        } else if (type === "classification") {
          return {
            type: "classification",
            value: "",
            selectedThemes: [],
            selectedSubThemes: [],
            selectedClasses: [],
            classNames: [],
            dataType: "",
            cardinality: "required",
          };
        } else {
          return {
            type,
            value: "",
            dataType: "",
            cardinality: "required",
          };
        }
      });
      return newReqs;
    });
  };

  // Requirement entfernen
  const handleRemoveRequirement = (idx: number) => {
    setRequirements((reqs: any) => reqs.filter((_: any, i: number) => i !== idx));
  };

  // Specification für Bearbeitung laden
  const handleEditSpec = (id: number) => {
    const spec = specRows.find(row => row.id === id);
    if (!spec) return;
    
    setEditingRowId(id);
    setSpecName(spec.name);
    setApplicabilityType(spec.applicabilityType);
    setIfcVersions(spec.ifcVersions || ["IFC4"]); // Use array
    setIfcClasses(spec.ifcClasses || []); // Use array
    
    // Requirements zurück-konvertieren für die Bearbeitung
    const convertedRequirements = spec.requirements.map((req: any) => {
      if (req.type === "property") {
        // Property-Requirements zurück in das bearbeitbare Format konvertieren
        return {
          type: "property",
          propertySet: req.propertySet,
          baseNames: req.baseNames || [],
          valueMap: req.valueMap || {},
          dataType: req.dataType,
          uri: req.uri,
          cardinality: req.cardinality,
        };
      } else if (req.type === "classification") {
        // Classification-Requirements zurück-konvertieren
        return {
          type: "classification",
          value: req.value, // Model-ID
          selectedThemes: req.selectedThemes || [], // Falls vorhanden
          selectedSubThemes: req.selectedSubThemes || [], // Falls vorhanden
          selectedClasses: req.selectedClasses || [], // Falls vorhanden
          classNames: req.classNames || [], // Falls vorhanden
          dataType: req.dataType || "",
          cardinality: req.cardinality || "required",
        };
      } else if (req.type === "attribute") {
        // Attribute-Requirements zurück-konvertieren
        return {
          type: "attribute",
          value: req.value, // Model-ID oder Class-ID
          dataType: req.dataType || "",
          cardinality: req.cardinality || "required",
        };
      }
      return req;
    });
    
    setRequirements(convertedRequirements);
    setAddRowMode(true);
    setIsIdsGenerated(false);
  };

  // Tag filtering functionality
  const EXCLUDED_TAGS = [
    "Dictionary", "Thema", "Klasse", "Merkmal", "Masseinheit", "Werteliste",
    "Wert", "Maßeinheit", "Merkmalsgruppe", "Referenzdokument"
  ] as const;

  const filterTags = useCallback((tags: string[]) =>
    tags.filter((tag) => !EXCLUDED_TAGS.includes(tag as any)), []
  );

  // Tag handling for available tags
  useEffect(() => {
    if (tagsData) {
      const availableTags = tagsData.findTags.nodes.map((tag: any) => tag.name);
      setAllTags(filterTags(availableTags).sort());
    }
  }, [tagsData, filterTags]);

  // Tag filtering handlers
  const handleTagFilterForClasses = useCallback((tag: string | null) => {
    setSelectedTagForClasses(tag);
  }, []);

  const handleTagFilterForProperties = useCallback((tag: string | null) => {
    setSelectedTagForProperties(tag);
  }, []);

  // Helper function to add classes by tag
  const addClassesByTag = useCallback((modelId: string, tagName: string, requirementIndex: number) => {
    if (!modelId || !tagName) return;
    
    const classesForModel = getClassesForModel(modelId);
    const taggedClasses = classesForModel.filter((classOption: any) => {
      // Get node from hierarchy to check tags
      const node = data?.hierarchy?.nodes?.find((n: any) => n.id === classOption.id);
      if (!node?.tags) return false;
      
      return node.tags.some((tag: any) => tag.name === tagName || tag.id === tagName);
    });

    if (taggedClasses.length > 0) {
      handleRequirementChange(requirementIndex, {
        selectedClasses: taggedClasses.map((c: any) => c.id)
      });
      enqueueSnackbar(
        <T keyName="ids_export.notifications.classes_with_tag_added" params={{ count: taggedClasses.length, tag: tagName }} />, 
        { variant: "success" }
      );
    } else {
      enqueueSnackbar(
        <T keyName="ids_export.notifications.no_classes_with_tag" params={{ tag: tagName }} />, 
        { variant: "info" }
      );
    }
  }, [data?.hierarchy?.nodes, getClassesForModel, handleRequirementChange, enqueueSnackbar]);

  // Helper function to add properties by tag
  const addPropertiesByTag = useCallback((propertySetName: string, tagName: string, requirementIndex: number) => {
    if (!propertySetName || !tagName) return;
    
    const properties = getPropertiesForPropertySet(propertySetName);
    const taggedProperties = properties.filter((property: any) => {
      const node = data?.hierarchy?.nodes?.find((n: any) => n.id === property.id);
      if (!node?.tags) return false;
      
      return node.tags.some((tag: any) => tag.name === tagName || tag.id === tagName);
    });

    if (taggedProperties.length > 0) {
      setRequirements((reqs: any) =>
        reqs.map((r: any, i: number) => {
          if (i !== requirementIndex || r.type !== "property") return r;
          
          const newBaseNames = [...(r.baseNames || [])];
          taggedProperties.forEach((prop: any) => {
            if (!newBaseNames.includes(prop.id)) {
              newBaseNames.push(prop.id);
            }
          });
          
          return {
            ...r,
            baseNames: newBaseNames,
          };
        })
      );
      enqueueSnackbar(
        <T keyName="ids_export.notifications.properties_with_tag_added" params={{ count: taggedProperties.length, tag: tagName }} />, 
        { variant: "success" }
      );
    } else {
      enqueueSnackbar(
        <T keyName="ids_export.notifications.no_properties_with_tag" params={{ tag: tagName }} />, 
        { variant: "info" }
      );
    }
  }, [data?.hierarchy?.nodes, getPropertiesForPropertySet, enqueueSnackbar]);

  // Save/Load functionality
  const handleLoadIDS = (loadedIDSTitle: string, loadedSpecRows: any[], loadedLocalPropertySets?: Record<string, any[]>, loadedIDSVersion?: string) => {
    setIdsTitle(loadedIDSTitle);
    setSpecRows(loadedSpecRows);
    
    // Lade IDS Version wenn vorhanden, sonst verwende "1.0" als Standard
    if (loadedIDSVersion) {
      setIdsVersion(loadedIDSVersion);
    } else {
      setIdsVersion("1.0");
    }
    
    // Lade lokale PropertySets wenn vorhanden
    if (loadedLocalPropertySets) {
      setNewlyCreatedPropertySets(new Map(Object.entries(loadedLocalPropertySets)));
    } else {
      setNewlyCreatedPropertySets(new Map());
    }
    
    setIsIdsGenerated(false);
    setHasShownAutoSaveNotification(true); // Reset notification flag when data is loaded
    enqueueSnackbar(
      <T keyName="ids_export.success_messages.ids_data_loaded" />, 
      { variant: "success" }
    );
  };

  const handleLoadSpecification = (loadedSpec: any) => {
    // Close any open add/edit mode first
    setAddRowMode(false);
    setEditingRowId(null);
    
    // Load the specification data
    setSpecName(loadedSpec.name);
    setApplicabilityType(loadedSpec.applicabilityType);
    setIfcVersions(loadedSpec.ifcVersions || loadedSpec.ifcVersion ? [loadedSpec.ifcVersion] : ["IFC4"]); // Handle both formats
    setIfcClasses(loadedSpec.ifcClasses || loadedSpec.ifcClass ? [loadedSpec.ifcClass] : []); // Handle both formats
    setRequirements(loadedSpec.requirements || []);
    
    // Open add mode to show the loaded specification
    setAddRowMode(true);
    enqueueSnackbar(
      <T keyName="ids_export.success_messages.specification_loaded" />, 
      { variant: "success" }
    );
  };

  const getCurrentSpecificationData = () => {
    if (!addRowMode && !editingRowId) return null;
    
    return {
      name: specName,
      applicabilityType,
      ifcVersions,
      requirements,
      ifcClasses
    };
  };

  // Callback für neu erstellte PropertySets
  const handlePropertySetCreated = async (propertySetName: string, propertySetId: string, selectedProperties: any[], propertyValues?: Record<string, string[]>) => {
    // Speichere die Properties für die neue PropertySet lokal
    setNewlyCreatedPropertySets(prev => new Map(prev.set(propertySetName, selectedProperties)));
    
    enqueueSnackbar(
      <T keyName="ids_export.success_messages.property_set_created" params={{ name: propertySetName }} />, 
      { 
      variant: "success",
      autoHideDuration: 4000
    });
    
    // Optional: Direkt die neue PropertySet im aktuellen Requirement setzen
    setRequirements(prevReqs => 
      prevReqs.map(req => {
        if (req.type === "property" && !req.propertySet) {
          // Erstelle valueMap aus den propertyValues wenn vorhanden
          const valueMap: Record<string, string[]> = {};
          if (propertyValues) {
            selectedProperties.forEach((prop: any) => {
              if (propertyValues[prop.id]) {
                valueMap[prop.id] = propertyValues[prop.id];
              }
            });
          }
          
          return { 
            ...req, 
            propertySet: propertySetName, 
            uri: getPropertySetUri(propertySetName),
            baseNames: selectedProperties.map((p: any) => p.id),
            valueMap: valueMap
          };
        }
        return req;
      })
    );
  };

  // IDS Datei erzeugen
  const handleGenerateIds = () => {
    if (specRows.length === 0) {
      enqueueSnackbar(
        <T keyName="ids_export.error_messages.no_specifications" />, 
        { variant: "warning" }
      );
      return;
    }
    setIsIdsGenerated(true);
    enqueueSnackbar(
      <T keyName="ids_export.success_messages.ids_generated" />, 
      { variant: "success" }
    );
  };

  // IDS Datei herunterladen
  const handleDownloadIds = async () => {
    if (!profile?.email) {
      enqueueSnackbar(
        <T keyName="ids_export.error_messages.login_required" />, 
        { variant: "warning" }
      );
      return;
    }
    if (!isIdsGenerated) {
      enqueueSnackbar("Bitte erzeugen Sie zuerst die IDS-Datei.", { variant: "warning" });
      return;
    }

    try {
      const info = {
        title: idsTitle || "Meine IDS Datei",
        author: profile.email,
        version: idsVersion || "1.0",
        date: new Date().toISOString().split("T")[0],
      };
      
      const convertedSpecs = specRows.map((spec: any) => {
        // Ensure each spec has valid ifcVersions
        const validIfcVersions = (spec.ifcVersions && Array.isArray(spec.ifcVersions) && spec.ifcVersions.length > 0) 
          ? spec.ifcVersions 
          : ifcVersions && ifcVersions.length > 0 
            ? ifcVersions 
            : ["IFC4"];
        
        return {
          ...spec,
          applicabilityType: "type" as const,
          ifcClass: spec.applicabilityType === "classification" 
            ? "IFCCLASSIFICATION" 
            : (Array.isArray(spec.ifcClasses) && spec.ifcClasses.length > 0)
              ? spec.ifcClasses[0] // Use first class for now, may need enhancement
              : spec.ifcClass || "",
          // Ensure ifcVersions is properly set
          ifcVersions: validIfcVersions,
          // Keep arrays for potential future use
          ifcClasses: spec.ifcClasses,
        };
      });
      
      const xml = convertToIDSXml(convertedSpecs, info);

      // Validation
      const xsd = await fetchXsd();
      const result = await validateWithXSDLibrary(xml, xsd);

      if (!result.valid) {
        const errorMessage = "IDS-Datei ist nicht gültig:\n" + (result.errors?.join("\n") || "Unbekannter Validierungsfehler");
        enqueueSnackbar(errorMessage, { variant: "error" });
        return;
      }

      // File download - separate try-catch for download specific errors
      const blob = new Blob([xml], { type: "application/xml" });
      const url = window.URL.createObjectURL(blob);

      // Dateiname basierend auf IDS Name
      let filename = idsTitle.trim();
      if (!filename) {
        filename = "Meine IDS Datei"; // Fallback wenn kein IDS Name eingegeben
      }
      // Ungültige Zeichen für Dateinamen entfernen
      filename = filename.replace(/[^a-zA-Z0-9_\-äöüÄÖÜß ]+/g, ""); 
      filename = filename.replace(/\s+/g, "_");
      if (!filename) filename = "IDS_Datei"; // Sicherheits-Fallback
      filename += ".ids";

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      
      // Ensure the link is added to DOM for Firefox compatibility
      document.body.appendChild(link);
      link.click();
      
      // Clean up - use setTimeout to avoid race conditions
      setTimeout(() => {
        try {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (cleanupError) {
          // Ignore cleanup errors
          console.warn("Cleanup warning:", cleanupError);
        }
      }, 100);

      enqueueSnackbar(
        <T keyName="ids_export.success_messages.ids_downloaded" />, 
        { variant: "success" }
      );

    } catch (e: any) {
      console.error("Download process error:", e);
      enqueueSnackbar("Fehler beim Validieren oder Herunterladen: " + (e?.message || e), {
        variant: "error",
      });
    }
  };

  const fetchXsd = async (): Promise<string> => {
    try {
      const res = await fetch("/ids.xsd");
      if (!res.ok) {
        throw new Error(`XSD konnte nicht geladen werden: ${res.status} ${res.statusText}`);
      }
      return await res.text();
    } catch (error: any) {
      console.error("Error fetching XSD:", error);
      throw new Error(`XSD-Datei konnte nicht geladen werden: ${error.message}`);
    }
  };

  // IDS Datei in MinIO speichern (mit Fallback zu normalem Download)
  const handleSaveToMinIO = async () => {
    try {
      const info = {
        title: idsTitle || "Meine IDS Datei",
        author: profile.email,
        version: idsVersion || "1.0",
        date: new Date().toISOString().split("T")[0],
      };
      
      const convertedSpecs = specRows.map((spec: any) => {
        const validIfcVersions = (spec.ifcVersions && Array.isArray(spec.ifcVersions) && spec.ifcVersions.length > 0) 
          ? spec.ifcVersions 
          : ifcVersions && ifcVersions.length > 0 
            ? ifcVersions 
            : ["IFC4"];
        
        return {
          ...spec,
          applicabilityType: "type" as const,
          ifcClass: spec.applicabilityType === "classification" 
            ? "IFCCLASSIFICATION" 
            : (Array.isArray(spec.ifcClasses) && spec.ifcClasses.length > 0)
              ? spec.ifcClasses[0]
              : spec.ifcClass || "",
          ifcVersions: validIfcVersions,
          ifcClasses: spec.ifcClasses,
        };
      });
      
      const xml = convertToIDSXml(convertedSpecs, info);

      // Validation
      const xsd = await fetchXsd();
      const result = await validateWithXSDLibrary(xml, xsd);

      if (!result.valid) {
        const errorMessage = "IDS-Datei ist nicht gültig:\n" + (result.errors?.join("\n") || "Unbekannter Validierungsfehler");
        enqueueSnackbar(errorMessage, { variant: "error" });
        return;
      }

      // Dateiname generieren
      let filename = idsTitle.trim();
      if (!filename) {
        filename = "Meine IDS Datei";
      }
      filename = filename.replace(/[^a-zA-Z0-9_\-äöüÄÖÜß ]+/g, "");
      filename = filename.replace(/\s+/g, "_");
      if (!filename) filename = "IDS_Datei";
      filename += ".ids";

      // MinIO Upload
      try {
        const uploader = createMinIOUploader();
        await uploader.uploadIDSFile(filename, xml);
        
        enqueueSnackbar(`IDS-Datei erfolgreich zu MinIO hochgeladen: ${filename}`, { variant: "success" });
      } catch (configError) {
        console.error("❌ MinIO configuration or upload failed:", configError);
        enqueueSnackbar("MinIO Upload fehlgeschlagen: " + (configError instanceof Error ? configError.message : configError), { 
          variant: "error",
          autoHideDuration: 10000 
        });
      }

    } catch (e: any) {
      console.error("Save/Download process error:", e);
      enqueueSnackbar("Fehler beim Speichern/Herunterladen: " + (e?.message || e), {
        variant: "error",
      });
    }
  };

  // handleSaveSpec: Property-Requirements als Enumeration für mehrere Merkmale
  const handleSaveSpec = () => {
    const enrichedRequirements: Requirement[] = [];
    requirements.forEach((req) => {
      if (
        req.type === "property" &&
        req.propertySet &&
        Array.isArray(req.baseNames) &&
        req.baseNames.length > 0
      ) {
        // propertySet und baseNames sind garantiert gesetzt
        const propertySetName = req.propertySet!;
        const propertyList = getPropertiesForPropertySet(propertySetName);
        
        // Alle Merkmale als Enumeration in einem einzigen Property-Requirement
        const baseNamesList = req.baseNames.map((baseId: string) => {
          const propObj = propertyList.find((p: any) => p.id === baseId);
          return propObj?.name ?? baseId;
        });
        
        // Erstelle eine valueMap mit Merkmalsnamen -> Wertnamen (für XML-Generierung)
        const valueMapByName: Record<string, string[]> = {};
        req.baseNames.forEach((baseId: string) => {
          const propObj = propertyList.find((p: any) => p.id === baseId);
          const propName = propObj?.name ?? baseId;
          
          if (req.valueMap && req.valueMap[baseId] && req.valueMap[baseId].length > 0) {
            // Die Werte in valueMap sind bereits Namen (nicht IDs), da sie im Dialog als Namen gespeichert werden
            valueMapByName[propName] = req.valueMap[baseId];
          }
        });
        
        enrichedRequirements.push({
          type: "property",
          propertySet: propertySetName,
          baseNames: baseNamesList, // Liste der Merkmalsnamen für Enumeration
          valueMap: Object.keys(valueMapByName).length > 0 ? valueMapByName : undefined, // valueMap für individuelle Werte
          dataType: req.dataType,
          uri: getPropertySetUri(propertySetName),
          cardinality: req.cardinality,
        } as any);
      } else if (req.type === "classification") {
        // Classification: Dictionary Name als System verwenden
        const dictionaryName = getModelNameById(req.value as string);
        
        if (req.selectedClasses && req.selectedClasses.length > 0) {
          // Mit gewählten Klassen: Nur Dictionary und Klassen in IDS
          enrichedRequirements.push({
            type: "classification",
            value: req.value, // Dictionary ID (für interne Verwendung)
            selectedThemes: req.selectedThemes || [], // Nur für UI-State beim Laden
            selectedSubThemes: req.selectedSubThemes || [], // Nur für UI-State beim Laden
            selectedClasses: req.selectedClasses, // Nur für UI-State beim Laden
            classNames: req.classNames || [], // Klassennamen für IDS Value
            modelName: dictionaryName, // Dictionary-Name für IDS System
            valueNames: req.classNames || [], // Klassennamen als Enumeration für Value
            dataType: req.dataType || "",
            cardinality: req.cardinality || "required",
          });
        } else {
          // Nur Dictionary gewählt: Nur Dictionary-System in IDS
          enrichedRequirements.push({
            type: "classification",
            value: req.value, // Dictionary ID (für interne Verwendung)
            selectedThemes: req.selectedThemes || [], // Nur für UI-State beim Laden
            selectedSubThemes: req.selectedSubThemes || [], // Nur für UI-State beim Laden
            selectedClasses: [], // Leeres Array für Konsistenz
            classNames: [], // Leeres Array für Konsistenz
            modelName: dictionaryName, // Dictionary-Name für IDS System
            dataType: req.dataType || "",
            cardinality: req.cardinality || "required",
            // Keine valueNames = kein Value-Element in XML (alle Klassen des Dictionarys erlaubt)
          });
        }
      } else if (req.type === "attribute") {
        // Attribute: Abhängig von Applicability
        if (applicabilityType === "classification") {
          // Bei Classification Applicability: Nur Modellname als Pattern
          const modelName = getModelNameById(req.value as string);
          enrichedRequirements.push({
            type: "attribute",
            value: req.value,
            valueNames: modelName, // Als Pattern für Name Attribut
            dataType: req.dataType || "",
            cardinality: req.cardinality || "required",
          });
        } else {
          // Bei Type Applicability: Klassenname als Pattern
          const className = getClassNameById(req.value as string);
          enrichedRequirements.push({
            type: "attribute",
            value: req.value,
            valueNames: className, // Als Pattern für Name Attribut
            dataType: req.dataType || "",
            cardinality: req.cardinality || "required",
          });
        }
      }
    });

    const newSpec = {
      id: editingRowId || Date.now(), // Verwende die vorhandene ID beim Bearbeiten
      name: specName,
      applicabilityType,
      ifcVersions: ifcVersions,
      requirements: enrichedRequirements,
      ifcClasses:
        applicabilityType === "type"
          ? ifcClasses
          : applicabilityType === "classification"
          ? ["IFCCLASSIFICATION"]
          : [],
    };

    if (editingRowId) {
      // Bestehende Specification überschreiben
      setSpecRows((rows) => 
        rows.map(row => row.id === editingRowId ? newSpec : row)
      );
      setEditingRowId(null);
    } else {
      // Neue Specification hinzufügen
      setSpecRows((rows) => [...rows, newSpec]);
    }

    setSpecName("");
    setApplicabilityType("type");
    setIfcVersions(["IFC4"]);
    setRequirements([]);
    setIfcClasses([]);
    setAddRowMode(false);
    setIsIdsGenerated(false);
  };

  const handleRemoveSpec = (id: number) => {
    setSpecRows((rows: any) => rows.filter((r: any) => r.id !== id));
    // Falls die zu löschende Specification gerade bearbeitet wird, Bearbeitung beenden
    if (editingRowId === id) {
      setEditingRowId(null);
      setAddRowMode(false);
      setSpecName("");
      setApplicabilityType("type");
      setIfcVersions(["IFC4"]);
      setRequirements([]);
      setIfcClasses([]);
    }
    setIsIdsGenerated(false); // Reset beim Entfernen von Specs
  };

  return (
    <Container>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          <T keyName="ids_export.title">Information Delivery Specification</T>
        </Typography>
      </Box>
      
      {/* IDS Name (Titel) */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <T keyName="ids_export.labels.ids_name" />
          </Typography>
          <InfoButton 
            titleKey="info_dialogs.ids_name.title" 
            contentKey="info_dialogs.ids_name.content" 
          />
        </Box>
        <TextField
          value={idsTitle}
          onChange={(e) => setIdsTitle(e.target.value)}
          fullWidth
          placeholder={t("ids_export.placeholders.ids_name_example")}
        />
      </Box>

      {/* IDS Version */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <T keyName="ids_export.labels.ids_version" />
          </Typography>
          <InfoButton 
            titleKey="info_dialogs.ids_version.title" 
            contentKey="info_dialogs.ids_version.content" 
          />
        </Box>
        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
          <T keyName="ids_export.labels.ids_version_description" />
        </Typography>
        <TextField
          value={idsVersion}
          onChange={(e) => setIdsVersion(e.target.value)}
          fullWidth
          placeholder={t("ids_export.placeholders.ids_version_example")}
        />
      </Box>

      {/* IFC Versionen Auswahl (Mehrfachauswahl) */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <T keyName="ids_export.labels.ifc_versions" />
          </Typography>
          <InfoButton 
            titleKey="info_dialogs.ifc_versions.title" 
            contentKey="info_dialogs.ifc_versions.content" 
          />
        </Box>
        <Autocomplete
          multiple
          id="ifc-versions-select"
          options={["IFC2X3", "IFC4", "IFC4X3"]}
          value={ifcVersions}
          onChange={(event, newValue) => {
            setIfcVersions(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t("ids_export.placeholders.ifc_versions_select")}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  label={option}
                  {...tagProps}
                  onDelete={() => {
                    const newVersions = ifcVersions.filter(v => v !== option);
                    setIfcVersions(newVersions);
                  }}
                />
              );
            })
          }
          ChipProps={{
            size: "small",
            variant: "filled",
            color: "primary"
          }}
        />
      </Box>

      {/* Inline Spezifikationszeilen */}
      <Box sx={{ mb: 3 }}>
        {specRows.map((row: any) => (
          <Paper
            key={row.id}
            sx={{ mb: 2, p: 2, background: "#f7f7f7", position: "relative" }}
          >
            <Box sx={{ position: "absolute", right: 8, top: 8, display: "flex", gap: 1 }}>
              <IconButton
                aria-label="edit"
                onClick={() => handleEditSpec(row.id)}
                size="small"
                disabled={addRowMode}
                color="primary"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="remove"
                onClick={() => handleRemoveSpec(row.id)}
                size="small"
                disabled={addRowMode}
                color="error"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {row.name}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <T keyName="ids_export.labels.applicability_type" />:{" "}
              {row.applicabilityType === "type"
                ? <T keyName="ids_export.labels.type_ifc_class" />
                : <T keyName="ids_export.labels.classification" />}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <T keyName="ids_export.labels.ifc_versions" />: {Array.isArray(row.ifcVersions) ? row.ifcVersions.join(", ") : row.ifcVersions || row.ifcVersion || "IFC4"}
            </Typography>
            {row.applicabilityType === "type" && row.ifcClasses && Array.isArray(row.ifcClasses) && row.ifcClasses.length > 0 && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <T keyName="ids_export.labels.ifc_classes" />: {row.ifcClasses.join(", ")}
              </Typography>
            )}
            {row.applicabilityType === "type" && row.ifcClass && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <T keyName="ids_export.labels.ifc_class" />: {row.ifcClass}
              </Typography>
            )}
            <Typography variant="body2" sx={{ mb: 1 }}>
              <T keyName="ids_export.labels.requirements" />:
              {row.requirements.length === 0 && <em> <T keyName="ids_export.labels.none" /></em>}
              {row.requirements.map((req: any, idx: number) => {
                // Sichere Behandlung der valueNames
                let displayValue = "";
                if (req.type === "property" && req.propertySet) {
                  displayValue = req.propertySet;
                } else if (req.type === "classification" && req.modelName) {
                  displayValue = req.modelName;
                } else if (req.type === "attribute") {
                  displayValue = typeof req.valueNames === "string" ? req.valueNames : "";
                } else if (Array.isArray(req.valueNames)) {
                  displayValue = req.valueNames.join(", ");
                } else if (typeof req.valueNames === "string") {
                  displayValue = req.valueNames;
                }
                
                return (
                  <span key={idx} style={{ marginLeft: 8 }}>
                    [{req.type.charAt(0).toUpperCase() + req.type.slice(1)}]{" "}
                    {displayValue}
                    {idx < row.requirements.length - 1 ? "," : ""}
                  </span>
                );
              })}
            </Typography>
          </Paper>
        ))}

        {addRowMode && (
          <Paper sx={{ mb: 2, p: 2, position: "relative" }}>
            <IconButton
              aria-label="close"
              onClick={() => setAddRowMode(false)}
              size="small"
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {editingRowId ? <T keyName="ids_export.labels.edit_specification" /> : <T keyName="ids_export.labels.specification_name" />}
                </Typography>
                <InfoButton 
                  titleKey="info_dialogs.specification_name.title" 
                  contentKey="info_dialogs.specification_name.content" 
                />
              </Box>
              <TextField
                value={specName}
                onChange={(e) => setSpecName(e.target.value)}
                fullWidth
                autoFocus
                placeholder={t("ids_export.placeholders.specification_name_example")}
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                <T keyName="ids_export.labels.applicability" />
              </Typography>
              <InfoButton 
                titleKey="info_dialogs.applicability.title" 
                contentKey="info_dialogs.applicability.content" 
              />
            </Box>
            <RadioGroup
              row
              value={applicabilityType}
              onChange={(e) => {
                const newType = e.target.value as "type" | "classification";
                setApplicabilityType(newType);
                // Requirements anpassen basierend auf neuer Applicability
                if (newType === "classification") {
                  // Bei Classification: Nur Attribute erlaubt, alle anderen Requirements entfernen
                  const attributeReqs = requirements.filter(req => req.type === "attribute");
                  setRequirements(attributeReqs.length > 0 ? attributeReqs : [{ type: "attribute", value: "", dataType: "", cardinality: "required" }]);
                } else {
                  // Bei Type: Attribute nicht erlaubt, alle Attribute-Requirements entfernen
                  const nonAttributeReqs = requirements.filter(req => req.type !== "attribute");
                  setRequirements(nonAttributeReqs.length > 0 ? nonAttributeReqs : [{ type: "property", propertySet: "", baseNames: [], valueMap: {}, dataType: "", uri: "", cardinality: "required" }]);
                }
              }}
            >
              <FormControlLabel
                value="type"
                control={<Radio />}
                label={<T keyName="ids_export.labels.type_ifc_class" />}
              />
              <FormControlLabel
                value="classification"
                control={<Radio />}
                label={<T keyName="ids_export.labels.classification" />}
              />
            </RadioGroup>
            {/* IFC Klassen Feld nur wenn Applicability "type" - Mehrfachauswahl */}
            {applicabilityType === "type" && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <T keyName="ids_export.labels.ifc_classes" />
                  </Typography>
                  <InfoButton 
                    titleKey="info_dialogs.ifc_classes.title" 
                    contentKey="info_dialogs.ifc_classes.content" 
                  />
                </Box>
                <Autocomplete
                  multiple
                  id="ifc-classes-select"
                  options={IDS_IFC_ENTITIES}
                  value={ifcClasses}
                  onChange={(event, newValue) => {
                    setIfcClasses(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={t("ids_export.placeholders.ifc_classes_search")}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          label={option}
                          {...tagProps}
                          onDelete={() => {
                            const newClasses = ifcClasses.filter(c => c !== option);
                            setIfcClasses(newClasses);
                          }}
                        />
                      );
                    })
                  }
                  ChipProps={{
                    size: "small",
                    variant: "filled",
                    color: "secondary"
                  }}
                  filterOptions={(options, { inputValue }) => {
                    return options.filter(option =>
                      option.toLowerCase().includes(inputValue.toLowerCase())
                    );
                  }}
                />
              </Box>
            )}
            {/* Informationsfeld für Klassifikation */}
            {applicabilityType === "classification" && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <TextField
                  label={<T keyName="ids_export.labels.ifc_class" />}
                  value="IFCCLASSIFICATION"
                  fullWidth
                  variant="outlined"
                  disabled
                  helperText={<T keyName="ids_export.labels.classification_auto_ifcclassification" />}
                />
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                <T keyName="ids_export.labels.requirements" />
              </Typography>
              <InfoButton 
                titleKey="info_dialogs.requirements.title" 
                contentKey="info_dialogs.requirements.content" 
              />
            </Box>
            <FormGroup>
              {requirements.map((req: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1,
                    gap: 1,
                    position: "relative",
                  }}
                >
                  <FormControl sx={{ minWidth: 160 }}>
                    <InputLabel id={`req-type-label-${idx}`}>
                      <T keyName="ids_export.buttons.select_facet" />
                    </InputLabel>
                    <Select
                      size="small"
                      labelId={`req-type-label-${idx}`}
                      value={req.type || ""}
                      label={<T keyName="ids_export.buttons.select_facet" />}
                      onChange={(e) => {
                        handleRequirementTypeChange(idx, e.target.value as any);
                      }}
                    >
                      {applicabilityType === "classification" ? [
                        // Bei Classification Applicability: Nur Attribute
                        <MenuItem key="attribute" value="attribute"><T keyName="ids_export.buttons.attribute" /></MenuItem>
                      ] : [
                        // Bei Type Applicability: Property und Classification
                        <MenuItem key="property" value="property"><T keyName="ids_export.buttons.property" /></MenuItem>,
                        <MenuItem key="classification" value="classification"><T keyName="ids_export.buttons.classification" /></MenuItem>
                      ]}
                    </Select>
                  </FormControl>
                  {/* Classification Auswahl */}
                  {req.type === "classification" ? (
                    <ClassificationRequirement
                      requirement={req}
                      index={idx}
                      modelOptions={dictionaryOptions}
                      allTags={allTags}
                      selectedTagForClasses={selectedTagForClasses}
                      classesLoading={classesLoading}
                      onRequirementChange={handleRequirementChange}
                      onTagFilterForClasses={handleTagFilterForClasses}
                      onAddClassesByTag={addClassesByTag}
                      getPropertySetUri={getPropertySetUri}
                      getClassificationUri={getClassificationUri}
                      getClassesForModel={getClassesForModel}
                      // Hierarchische Props für Themen/Unterthemen/Klassen
                      getThemesForDictionary={getThemesForDictionary}
                      getSubThemesForTheme={getSubThemesForTheme}
                      getClassesForThemeOrSubTheme={getClassesForThemeOrSubTheme}
                      getAllClassesForDictionary={getAllClassesForDictionary}
                      hasSubThemes={hasSubThemes}
                      DATA_TYPE_OPTIONS={DATA_TYPE_OPTIONS}
                    />
                  ) : req.type === "attribute" ? (
                    <AttributeRequirement
                      requirement={req}
                      index={idx}
                      applicabilityType={applicabilityType}
                      modelOptions={dictionaryOptions}
                      allClassOptions={classOptions}
                      onRequirementChange={handleRequirementChange}
                      getPropertySetUri={getPropertySetUri}
                      getClassificationUri={getClassificationUri}
                      DATA_TYPE_OPTIONS={DATA_TYPE_OPTIONS}
                    />
                  ) : req.type === "property" ? (
                    <PropertyRequirement
                      requirement={req}
                      index={idx}
                      propertyGroupOptions={propertyGroupOptions}
                      allTags={allTags}
                      selectedTagForProperties={selectedTagForProperties}
                      allItemsLoading={allItemsLoading}
                      onRequirementChange={handleRequirementChange}
                      onTagFilterForProperties={handleTagFilterForProperties}
                      onAddPropertiesByTag={addPropertiesByTag}
                      onCreatePropertySetOpen={() => setCreatePropertySetDialogOpen(true)}
                      getPropertySetUri={getPropertySetUri}
                      getPropertiesForPropertySet={getPropertiesForPropertySet}
                      getValuesForProperty={getValuesForProperty}
                      DATA_TYPE_OPTIONS={DATA_TYPE_OPTIONS}
                    />
                  ) : null}
                  <IconButton
                    aria-label="remove"
                    onClick={() => handleRemoveRequirement(idx)}
                    size="small"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={handleAddRequirement}
                sx={{ mt: 1 }}
              >
                <T keyName="ids_export.buttons.add_requirement" />
              </Button>
            </FormGroup>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                onClick={() => {
                  setAddRowMode(false);
                  setEditingRowId(null);
                  setSpecName("");
                  setApplicabilityType("type");
                  setIfcVersions(["IFC4"]);
                  setRequirements([]);
                  setIfcClasses([]);
                }}
                color="secondary"
                sx={{ mr: 1 }}
              >
                <T keyName="ids_export.buttons.cancel" />
              </Button>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={() => {
                  setSaveLoadMode('specification');
                  setSaveLoadDialogOpen(true);
                }}
                disabled={!specName}
                sx={{ mr: 1 }}
              >
                <T keyName="ids_export.buttons.save_spec" />
              </Button>
              <Button
                onClick={handleSaveSpec}
                variant="contained"
                disabled={
                  !specName || (applicabilityType === "type" && ifcClasses.length === 0)
                }
              >
                {editingRowId ? <T keyName="ids_export.buttons.update" /> : <T keyName="ids_export.buttons.save" />}
              </Button>
            </Box>
          </Paper>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setAddRowMode(true);
            // Beim Öffnen des Add-Modus ein initiales Requirement basierend auf current applicabilityType hinzufügen
            if (requirements.length === 0) {
              const initialReq = applicabilityType === "classification"
                ? { type: "attribute" as const, value: "", dataType: "", cardinality: "required" }
                : { type: "property" as const, propertySet: "", baseNames: [], valueMap: {}, dataType: "", uri: "", cardinality: "required" };
              setRequirements([initialReq]);
            }
          }}
          disabled={addRowMode}
        >
          <T keyName="ids_export.buttons.add_specification" />
        </Button>

        <Button
          variant="outlined"
          startIcon={<FolderOpenIcon />}
          onClick={() => {
            setSaveLoadMode('ids');
            setSaveLoadDialogOpen(true);
          }}
        >
          <T keyName="ids_export.buttons.save_and_load" />
        </Button>
      </Box>
      
      {/* IDS Buttons nebeneinander - immer ganz unten */}
      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={handleGenerateIds}
          disabled={specRows.length === 0}
        >
          <T keyName="ids_export.buttons.generate_ids" />
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleDownloadIds}
          disabled={!isIdsGenerated}
        >
          <T keyName="ids_export.buttons.download_ids" />
        </Button>
        <Button 
          variant="outlined" 
          color="primary"
          startIcon={<CloudUploadIcon />}
          onClick={handleSaveToMinIO}
          disabled={!isIdsGenerated}
        >
          In MinIO speichern
        </Button>
      </Box>

      {/* Save/Load Dialog */}
      <SaveLoadDialog
        open={saveLoadDialogOpen}
        onClose={() => setSaveLoadDialogOpen(false)}
        currentIDSTitle={idsTitle}
        currentSpecRows={specRows}
        currentSpec={getCurrentSpecificationData()}
        currentLocalPropertySets={newlyCreatedPropertySets}
        onLoadIDS={handleLoadIDS}
        onLoadSpec={handleLoadSpecification}
        mode={saveLoadMode}
      />

      {/* Create PropertySet Dialog */}
      <CreatePropertySetDialog
        open={createPropertySetDialogOpen}
        onClose={() => setCreatePropertySetDialogOpen(false)}
        onPropertySetCreated={handlePropertySetCreated}
        availableTags={allTags}
      />
    </Container>
  );
};

export default IDSExportView;