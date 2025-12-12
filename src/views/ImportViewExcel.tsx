import React, { useState, useEffect, useRef } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  Typography,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableContainerProps,
  TableHead,
  TableRow,
  Paper,
  Stack,
  ButtonProps,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListSubheader,
} from "@mui/material";
import { useSnackbar } from "notistack";
import View from "./View";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  CatalogRecordType,
  RelationshipRecordType,
  FindTagsDocument,
  CreateEntryDocument,
  CreateRelationshipDocument,
  CreateTagDocument,
} from "../generated/graphql";
import { ApolloCache } from "@apollo/client";
import ExcelJS from "exceljs";
import { v4 as uuidv4 } from "uuid";
import { InfoButton } from "../components/InfoButton";
import { T, useTranslate } from '@tolgee/react';

// Typ für Tag-Ergebnisse
type TagResult = { id: string; name: string };

export const IMPORT_TAG_ID = "KATALOG-IMPORT";

// Define the structure for entity data
interface EntityData {
  name: string;
  id: string;
}

interface RelationData {
  id1: string;
  id2: string;
}

// Define type for checked rows
type CheckedRows = { [key: number]: boolean };

// Define type for checked rows in each table
type CheckedRowsTable = {
  entities: CheckedRows;
  relations: CheckedRows;
};
// Styled components for better organization and consistency
const StyledTableContainer = styled(TableContainer)<TableContainerProps>(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2),
  overflowX: 'auto'
}));

const StyledTable = styled(Table)({
  minWidth: 700,
  tableLayout: "fixed"
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1),
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
  fontWeight: 'bold',
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1),
}));

const FlexBox = styled(Box)({
  display: 'flex',
  alignItems: 'center'
});

const SelectContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  width: '100%'
});

const FullWidthSelect = styled(Select)({
  width: '100%'
});

const ProgressContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const ButtonsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  marginBottom: theme.spacing(2),
  flexWrap: "wrap",
  gap: theme.spacing(2),
}));

const ButtonWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  position: "relative",
}));

const ActionButton = styled(Button)<ButtonProps>(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
  // Entferne die explizite Höhe, damit sie der Standard Material-UI Höhe entspricht
}));

export function ImportViewExcel() {
  const [entitiesFile, setEntitiesFile] = useState<File | null>(null);
  const [importTag, setImportTag] = useState(""); // Changed from IMPORT_TAG_ID to empty string
  const [textFieldValues, setTextFieldValues] = useState<{
    [key: string]: string;
  }>({});
  const { enqueueSnackbar } = useSnackbar();
  const [valid, setValid] = useState<boolean | null>(null); // Use null for uninitialized state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [createTag] = useMutation(CreateTagDocument);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const { t } = useTranslate();

  // Enhanced Import Management
  const [isImporting, setIsImporting] = useState(false);
  const [importAborted, setImportAborted] = useState(false);
  const [importedEntities, setImportedEntities] = useState<string[]>([]);
  const [currentAction, setCurrentAction] = useState("");
  const [importStartTime, setImportStartTime] = useState<Date | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Ref for abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  // UUID Management for automatic ID generation
  const [generatedUUIDs, setGeneratedUUIDs] = useState<{
    [entityType: string]: { [name: string]: string }
  }>({});

  // Sequential UUIDs for ordered entities (preserves Excel row order)
  const [sequentialUUIDs, setSequentialUUIDs] = useState<{
    [entityType: string]: Array<{ name: string; uuid: string; order: number }>
  }>({});
  
  // State for managing UUID generation
  const [uuidGenerationNeeded, setUuidGenerationNeeded] = useState<{
    [entityType: string]: boolean
  }>({});
  
  // Function to get or create UUID for a name in a specific entity type
  const getOrCreateUUID = (entityType: string, name: string): string => {
    if (!name || name.trim() === '') return '';
    
    const trimmedName = name.trim();
    
    // Initialize entity type if not exists
    if (!generatedUUIDs[entityType]) {
      const newUUID = uuidv4();
      setGeneratedUUIDs(prev => ({
        ...prev,
        [entityType]: { [trimmedName]: newUUID }
      }));
      return newUUID;
    }
    
    // Return existing UUID if name already has one
    if (generatedUUIDs[entityType][trimmedName]) {
      return generatedUUIDs[entityType][trimmedName];
    }
    
    // Generate new UUID for new name
    const newUUID = uuidv4();
    setGeneratedUUIDs(prev => ({
      ...prev,
      [entityType]: {
        ...prev[entityType],
        [trimmedName]: newUUID
      }
    }));
    
    return newUUID;
  };

  // Function to get all generated UUIDs for an entity type (for dropdowns in relations)
  const getGeneratedUUIDsForEntityType = (entityType: string): Array<{id: string, name: string}> => {
    if (!generatedUUIDs[entityType]) return [];
    
    return Object.entries(generatedUUIDs[entityType]).map(([name, id]) => ({
      id,
      name
    }));
  };

  // Function to clear generated UUIDs (useful when starting a new import)
  const clearGeneratedUUIDs = () => {
    setGeneratedUUIDs({});
    setSequentialUUIDs({});
    setUuidGenerationNeeded({});
  };

  // Function to generate UUIDs for a specific entity type from Excel data
  const generateUUIDsForEntity = async (entityIndex: number) => {
    if (!entitiesFile) {
      enqueueSnackbar("Bitte wählen Sie zuerst eine Datei aus", { variant: "warning" });
      return;
    }

    const entityTypes = [
      "Referenzdokument", "Dictionary", "Thema", "Klasse", "Merkmal", 
      "Merkmalsgruppe", "Werteliste", "Maßeinheit", "Wert"
    ];
    const entityType = entityTypes[entityIndex];
    const sheetName = textFieldValues[`sheetField${entityIndex}`] || "";
    const nameColumnLetter = selectedLetters[`selectName${entityIndex}`] || "";
    const useNameTextField = useTextField[`name${entityIndex}`];

    if (useNameTextField) {
      // Single entry from text field
      const name = textFieldValues[`name${entityIndex}`] || "";
      if (name.trim()) {
        const uuid = uuidv4();
        setSequentialUUIDs(prev => ({
          ...prev,
          [entityType]: [{ name: name.trim(), uuid, order: 0 }]
        }));
        // UUID-Generation visuell über Interface ersichtlich, keine Snackbar nötig
      }
      return;
    }

    if (!sheetName || !nameColumnLetter) {
      enqueueSnackbar(`Bitte Tabellenblatt und Namensspalte für ${entityType} auswählen`, { variant: "warning" });
      return;
    }

    try {
      // Load Excel data
      const data = await entitiesFile.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(data);

      const sheet = workbook.getWorksheet(sheetName);
      if (!sheet) {
        enqueueSnackbar(`Tabellenblatt "${sheetName}" nicht gefunden`, { variant: "error" });
        return;
      }

      const columnLetterToIndex = (letter: string): number => {
        return letter.charCodeAt(0) - 65;
      };

      const nameColumnIndex = columnLetterToIndex(nameColumnLetter) + 1;
      const uniqueNames = new Map<string, number>(); // name -> first occurrence order
      const generatedEntries: Array<{ name: string; uuid: string; order: number }> = [];

      // First pass: collect unique names and their first occurrence order
      sheet.eachRow({ includeEmpty: false }, (row: ExcelJS.Row, rowNumber: number) => {
        if (rowNumber === 1) return; // Skip header

        const name = String(row.getCell(nameColumnIndex).value || '').trim();
        if (name && !uniqueNames.has(name)) {
          uniqueNames.set(name, rowNumber - 1); // Store first occurrence order
        }
      });

      // Second pass: generate UUIDs only for unique names
      uniqueNames.forEach((order, name) => {
        const uuid = uuidv4();
        generatedEntries.push({
          name,
          uuid,
          order
        });
      });

      // Sort by order to maintain Excel sequence
      generatedEntries.sort((a, b) => a.order - b.order);

      if (generatedEntries.length > 0) {
        setSequentialUUIDs(prev => ({
          ...prev,
          [entityType]: generatedEntries
        }));
        
        setUuidGenerationNeeded(prev => ({
          ...prev,
          [entityType]: false
        }));

        const totalRows = Array.from(uniqueNames.keys()).length;
        const duplicateCount = (function() {
          let totalEntries = 0;
          sheet.eachRow({ includeEmpty: false }, (row: ExcelJS.Row, rowNumber: number) => {
            if (rowNumber === 1) return;
            const name = String(row.getCell(nameColumnIndex).value || '').trim();
            if (name) totalEntries++;
          });
          return totalEntries;
        })() - totalRows;

        enqueueSnackbar(
          `${generatedEntries.length} eindeutige UUIDs für ${entityType} generiert` + 
          (duplicateCount > 0 ? ` (${duplicateCount} Duplikate erkannt)` : ""), 
          { variant: "success", autoHideDuration: 6000 }
        );
      } else {
        enqueueSnackbar(`Keine gültigen Namen in Spalte ${nameColumnLetter} gefunden`, { variant: "warning" });
      }

    } catch (error) {
      enqueueSnackbar(`Fehler beim Generieren der UUIDs: ${error}`, { variant: "error" });
    }
  };

  // Function to download generated UUIDs as CSV
  const downloadGeneratedUUIDs = () => {
    const allEntries: Array<{ name: string; type: string; uuid: string; order: number }> = [];
    
    Object.entries(sequentialUUIDs).forEach(([entityType, entries]) => {
      entries.forEach(entry => {
        allEntries.push({
          name: entry.name,
          type: entityType,
          uuid: entry.uuid,
          order: entry.order
        });
      });
    });

    if (allEntries.length === 0) {
      enqueueSnackbar("Keine generierten UUIDs zum Download verfügbar", { variant: "warning" });
      return;
    }

    // Sort by type and order
    allEntries.sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return a.order - b.order;
    });

    // Create CSV content
    const csvHeader = "Name,Typ,UUID,Reihenfolge\n";
    const csvContent = allEntries
      .map(entry => `"${entry.name}","${entry.type}","${entry.uuid}",${entry.order}`)
      .join("\n");

    const csvData = csvHeader + csvContent;
    
    // Create and download file
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `generierte-uuids-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Download erfolgt, Benutzer sieht es direkt - keine Snackbar nötig
  };

  // Function to find UUID by name in sequential UUIDs
  const findSequentialUUIDByName = (entityType: string, name: string): string | null => {
    if (!name || name.trim() === '') return null;
    
    const trimmedName = name.trim();
    const sequences = sequentialUUIDs[entityType];
    
    if (!sequences) return null;
    
    const found = sequences.find(entry => entry.name === trimmedName);
    return found ? found.uuid : null;
  };

  // Function to find UUID by name across all entity types
  const findUUIDByName = (name: string): string | null => {
    if (!name || name.trim() === '') return null;
    
    const trimmedName = name.trim();
    
    // First check sequential UUIDs
    for (const [entityType, sequences] of Object.entries(sequentialUUIDs)) {
      const found = sequences.find(entry => entry.name === trimmedName);
      if (found) return found.uuid;
    }
    
    // Then check old generated UUIDs as fallback
    for (const [entityType, nameToUuidMap] of Object.entries(generatedUUIDs)) {
      if (nameToUuidMap[trimmedName]) {
        return nameToUuidMap[trimmedName];
      }
    }
    
    return null;
  };

  // Import Control Functions
  const startImport = () => {
    setIsImporting(true);
    setImportAborted(false);
    setImportedEntities([]);
    setProgress(0);
    setImportStartTime(new Date());
    abortControllerRef.current = new AbortController();
  };

  const abortImport = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setImportAborted(true);
    setIsImporting(false);
    setProgress(0); // Reset progress bar
    setCurrentAction("Import abgebrochen");
    enqueueSnackbar("❌ Import wurde abgebrochen", { variant: "warning" });
  };

  const finishImport = () => {
    setIsImporting(false);
    setProgress(100);
    const duration = importStartTime ? Date.now() - importStartTime.getTime() : 0;
    setCurrentAction(`Import abgeschlossen in ${(duration / 1000).toFixed(1)}s`);
    abortControllerRef.current = null;
  };

  // Check if operation should be aborted
  const checkAborted = (): boolean => {
    return abortControllerRef.current?.signal.aborted || importAborted;
  };

  // Preview function - shows what will be imported
  const generatePreview = async () => {
    if (!entitiesFile) {
      enqueueSnackbar("Bitte wählen Sie zuerst eine Datei aus", { variant: "warning" });
      return;
    }

    try {
      setCurrentAction("Generiere Vorschau...");
      
      // Use the existing logic but don't actually create entities
      const preview = {
        entities: {},
        relations: {},
        generatedUUIDs: { ...generatedUUIDs },
        totalItems: 0
      };

      // Simulate the import process to generate preview data
      handleImportEntities(); // This populates our data structures
      
      // Count total items
      Object.values(checkedRows.entities).forEach(checked => {
        if (checked) preview.totalItems++;
      });
      Object.values(checkedRows.relations).forEach(checked => {
        if (checked) preview.totalItems++;
      });

      setPreviewData(preview);
      setShowPreview(true);
      setCurrentAction("Vorschau erstellt");
      
    } catch (error) {
      enqueueSnackbar(`Fehler bei Vorschau-Generierung: ${error}`, { variant: "error" });
    }
  };

  const handleValidationClick = () => {
    const hasErrors = handleValidation();
    enqueueSnackbar(
      hasErrors
        ? <T keyName="import_excel.validation_failed" />
        : <T keyName="import_excel.validation_success" />,
      { variant: hasErrors ? "error" : "success" }
    );
  };

  // States for dropdown selections
  const [selectedLetters, setSelectedLetters] = useState<{
    [key: string]: string;
  }>({});
  const [useTextField, setUseTextField] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [checkedRows, setCheckedRows] = useState<CheckedRowsTable>({
    entities: Array(9)
      .fill(false)
      .reduce((acc, _, index) => ({ ...acc, [index]: false }), {}),
    relations: Array(10)
      .fill(false)
      .reduce((acc, _, index) => ({ ...acc, [index]: false }), {}),
  });
  const [selectAllEntities, setSelectAllEntities] = useState(false); // New state for "Select All" checkbox

  // get list of tags
  const { refetch } = useQuery(FindTagsDocument, {
    variables: {
      pageSize: 100,
    },
  });

  const [create] = useMutation(CreateEntryDocument, {
    update: (cache: ApolloCache) => {
      cache.modify({
        id: "ROOT_QUERY",
        fields: {
          hierarchy: (value: any, { DELETE }: any) => DELETE,
          search: (value: any, { DELETE }: any) => DELETE,
          findDictionaries: (value: any, { DELETE }: any) => DELETE,
        },
      });
    },
  });
  const [createRelationship] = useMutation(CreateRelationshipDocument);

  // File change handler
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      setEntitiesFile(selectedFile);
      refetch({ pageSize: 100 });
      // Clear generated UUIDs when a new file is selected
      clearGeneratedUUIDs();
    }
  };

  const handleImportTagChange = (event: any) => {
    setImportTag(event.target.value);
  };

  const handleTextFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string
  ) => {
    setTextFieldValues((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleimportExcel = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    try {
      startImport();
      setCurrentAction("Starte Import...");
      
      handleImportEntities(); // Erste Funktion aufrufen
      
      if (checkAborted()) {
        return;
      }
      
      setCurrentAction("Analysiere Excel-Daten...");
      await importExcelData(); // Danach die Excel-Daten importieren
      
      if (!checkAborted()) {
        finishImport();
        // Erfolg wird über Progress-Bar und Status angezeigt, keine Snackbar nötig
      }
    } catch (error) {
      setIsImporting(false);
      setCurrentAction("Import fehlgeschlagen");
      enqueueSnackbar(`❌ Import-Fehler: ${error}`, { variant: "error" });
    }
  };

  const isIdRequired = (entityIndex: number): boolean => {
    return entityIndex > 2; // Für die ersten drei Zeilen (Index 0,1,2) ist ID nicht erforderlich
  };

  const handleValidation = (): boolean => {
    let hasErrors = false;
    const errorMessages = [];

    // Check if a file is selected
    if (!entitiesFile) {
      hasErrors = true;
      errorMessages.push(
        t("import_validation.select_file_error")
      );
    }

    // Check if at least one row is selected
    const hasSelectedRows = Object.values(checkedRows.entities).some(
      (isChecked) => isChecked
    );
    if (!hasSelectedRows) {
      hasErrors = true;
      errorMessages.push(
        t("import_validation.select_rows_error")
      );
    }

    // Check if all selected rows are completely filled
    const autoUuidInfoMessages: string[] = [];
    Object.entries(checkedRows.entities).forEach(([rowIndex, isChecked]) => {
      if (isChecked) {
        const rowNumber = parseInt(rowIndex, 10) + 1;
        const rowName = `Tabelle 1, Zeile ${rowNumber}`; // Assume table 1 for entities
        const nameValue = textFieldValues[`name${rowIndex}`];
        const idValue = textFieldValues[`id${rowIndex}`];
        const useNameTextField = useTextField[`name${rowIndex}`];
        const useIdTextField = useTextField[`id${rowIndex}`];
        const selectedName = selectedLetters[`selectName${rowIndex}`];
        const selectedId = selectedLetters[`selectID${rowIndex}`];

        // Check if we have a name but no ID - this triggers auto UUID generation
        const hasName = useNameTextField ? nameValue : selectedName;
        const hasId = useIdTextField ? idValue : selectedId;
        
        if (hasName && !hasId) {
          const entityTypes = [
            "Referenzdokument", "Dictionary", "Thema", "Klasse", "Merkmal", 
            "Merkmalsgruppe", "Werteliste", "Maßeinheit", "Wert"
          ];
          const entityType = entityTypes[parseInt(rowIndex, 10)];
          autoUuidInfoMessages.push(
            `ℹ️ ${entityType}: UUIDs werden automatisch für Namen generiert (keine ID-Spalte gewählt)`
          );
        }

        // Check if name field is filled or selected
        if (useNameTextField && !nameValue) {
          hasErrors = true;
          errorMessages.push(
            `${rowName}: Das Textfeld "Name" muss ausgefüllt werden.`
          );
        } else if (!useNameTextField && !selectedName) {
          hasErrors = true;
          errorMessages.push(
            `${rowName}: Das Dropdown "Name" muss ausgewählt werden.`
          );
        }

        // Check if id field is filled or selected - BUT allow auto-generation
        // For entities that require an ID, but only if auto-generation is not possible
        if (isIdRequired(parseInt(rowIndex))) {
          // If we have a name but no ID, that's OK because we can auto-generate
          if (hasName && !hasId) {
            // This is fine - UUID will be auto-generated (already handled above)
          } else if (!hasName && hasId) {
            // We have an ID but no name - this is an error
            hasErrors = true;
            errorMessages.push(
              `${rowName}: Ein Name ist erforderlich, auch wenn eine ID-Spalte gewählt ist.`
            );
          } else if (!hasName && !hasId) {
            // Neither name nor ID - this is an error
            hasErrors = true;
            errorMessages.push(
              `${rowName}: Entweder eine Namens-Spalte oder ein Textfeld-Name muss ausgefüllt werden.`
            );
          }
          // If both hasName && hasId, that's also fine - use both
        } else {
          // For the first three entities (index 0,1,2), ID is not required
          // But if we're using textfields and ID field is filled, it should be valid
          if (useIdTextField && idValue && !idValue.trim()) {
            hasErrors = true;
            errorMessages.push(
              `${rowName}: Das ID-Textfeld darf nicht leer sein, wenn es ausgefüllt wird.`
            );
          }
        }
      }
    });

    // Check for duplicate letters in columns with identical sheet names
    const sheetNames: { [key: string]: Set<string> } = {};
    Object.entries(selectedLetters).forEach(([key, value]) => {
      const index = key.match(/\d+/)?.[0];
      if (index !== undefined) {
        const sheetName = textFieldValues[`sheetField${index}`];
        if (sheetName) {
          if (!sheetNames[sheetName]) {
            sheetNames[sheetName] = new Set();
          }
          if (value && sheetNames[sheetName].has(value)) {
            hasErrors = true;
            errorMessages.push(
              t("import_validation.duplicate_columns_error")
            );
          } else {
            sheetNames[sheetName].add(value);
          }
        }
      }
    });

    // Update validation state and show messages
    setValid(!hasErrors);

    if (hasErrors) {
      errorMessages.forEach((error) => {
        enqueueSnackbar(error, { variant: "error" });
      });
    }
    
    // Show info messages for auto UUID generation
    if (autoUuidInfoMessages.length > 0) {
      autoUuidInfoMessages.forEach((info) => {
        enqueueSnackbar(info, { variant: "info", autoHideDuration: 6000 });
      });
    }
    
    return hasErrors;
  };

  const handleClearTable = () => {
    setTextFieldValues({});
    setSelectedLetters({});
    setCheckedRows({
      entities: Array(9)
        .fill(false)
        .reduce((acc, _, index) => ({ ...acc, [index]: false }), {}),
      relations: Array(10)
        .fill(false)
        .reduce((acc, _, index) => ({ ...acc, [index]: false }), {}),
    });
    setValid(null); // Reset validation state
    setSelectAllEntities(false); // Reset "Select All" checkbox

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input value
    }
    setEntitiesFile(null); // Clear file state
    setProgress(0); // Reset progressBar
    
    // Clear generated UUIDs
    clearGeneratedUUIDs();
    
    // Reset import states
    setIsImporting(false);
    setImportAborted(false);
    setImportedEntities([]);
    setCurrentAction("");
    setImportStartTime(null);
    setPreviewData(null);
    setShowPreview(false);
    setStatus(""); // Reset status message
    window.location.reload(); // Reload the page
  };

  const handleSelectChange = (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } },
    key: string
  ) => {
    setSelectedLetters((prev) => ({
      ...prev,
      [key]: event.target.value as string,
    }));
  };

  const handleUseTextFieldToggle = (key: string) => {
    setUseTextField((prev) => {
      const newValue = !prev[key];
      return { ...prev, [key]: newValue };
    });

    if (!useTextField[key]) {
      setTextFieldValues((prev) => ({ ...prev, [key]: "" }));
      setSelectedLetters((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleCheckboxChange = (
    index: number,
    table: "entities" | "relations"
  ) => {
    setCheckedRows((prev) => ({
      ...prev,
      [table]: { ...prev[table], [index]: !prev[table][index] },
    }));
  };

  const handleSelectAll = (table: "entities" | "relations") => {
    setCheckedRows((prev) => {
      const allChecked = Object.values(prev[table]).every(Boolean);
      const newCheckedRows: CheckedRows = {};
      for (let i = 0; i < (table === "entities" ? 9 : 10); i++) {
        newCheckedRows[i] = !allChecked;
      }
      return { ...prev, [table]: newCheckedRows };
    });
  };

  useEffect(() => {
    // Initialize "Select All" checkbox state
    setSelectAllEntities(false);
  }, []);

  useEffect(() => {
    // Update all entities checkboxes based on the "Select All" checkbox
    const newCheckedRows = { ...checkedRows.entities };
    Object.keys(newCheckedRows).forEach((index) => {
      newCheckedRows[parseInt(index)] = selectAllEntities;
    });
    setCheckedRows((prev) => ({
      ...prev,
      entities: newCheckedRows,
    }));
  }, [selectAllEntities]);

  const alphabet = Array.from(Array(26)).map((e, i) =>
    String.fromCharCode(i + 65)
  ); // ['A', 'B', ..., 'Z']

  const handleImportEntities = () => {
    const entityData: {
      [key: string]: { sheet: string; name: string; id: string }[];
    } = {};

    const relationData: {
      [key: string]: { id1: string; id2: string; sheet: string }[];
    } = {};

    [
      "Referenzdokument",
      "Dictionary",
      "Thema",
      "Klasse",
      "Merkmal",
      "Merkmalsgruppe",
      "Werteliste",
      "Maßeinheit",
      "Wert",
    ].forEach((entityLabel, index) => {
      if (checkedRows.entities[index]) {
        const sheetName = textFieldValues[`sheetField${index}`] || "";
        console.log(`Entity: ${entityLabel}, Sheet Name: ${sheetName}`); // Debug-Log

        // Determine whether to use the dropdown value or text field value for name
        const name =
          entityLabel === "Referenzdokument" ||
            entityLabel === "Dictionary" ||
            entityLabel === "Thema"
            ? useTextField[`name${index}`]
              ? textFieldValues[`name${index}`] || ""
              : `${selectedLetters[`selectName${index}`]}`
            : `${selectedLetters[`selectName${index}`]}`;

        const id = useTextField[`id${index}`]
          ? textFieldValues[`id${index}`] || ""
          : `${selectedLetters[`selectID${index}`]}`;

        console.log(`Name: ${name}, ID: ${id}`); // Debug-Log

        if (!entityData[entityLabel]) {
          entityData[entityLabel] = [];
        }

        // Check if we have a name column but no ID column selected
        const hasNameColumn = name && name !== "";
        const hasIdColumn = id && id !== "";
        
        if (hasNameColumn && sheetName) {
          if (hasIdColumn) {
            // Normal case: both name and ID are provided
            console.log(
              `Adding to entityData: ${entityLabel}, Name: ${name}, ID: ${id}, Sheet: ${sheetName}`
            ); // Debug-Log
            entityData[entityLabel].push({ sheet: sheetName, name, id });
          } else {
            // Auto-generate UUID case: name provided but no ID column
            console.log(
              `Adding to entityData with auto-UUID: ${entityLabel}, Name: ${name}, Sheet: ${sheetName}`
            ); // Debug-Log
            entityData[entityLabel].push({ sheet: sheetName, name, id: 'AUTO_UUID' });
          }
        } else {
          console.log(`Skipping ${entityLabel} due to missing data`); // Debug-Log
        }
      }
    });

    Object.entries(entityData).forEach(([entityLabel, data]) => {
      const ENTITY_CONSTANT = data;
      console.log(`${entityLabel} Data:`, ENTITY_CONSTANT);
    });

    // Relationen durchgehen und Daten speichern
    [
      "Rel_Concept_Referenzdokument",
      "Rel_Concept_Dictionary",
      "Rel_Thema_Klasse",
      "Rel_Klasse_Merkmal",
      "Rel_Merkmal_Maßeinheit",
      "Rel_Merkmal_Werteliste",
      "Rel_Werteliste_Maßeinheit",
      "Rel_Werteliste_Wert",
      "Rel_Klasse_Merkmalsgruppe",
      "Rel_Merkmalsgruppe_Merkmal"
    ].forEach((relationLabel, index) => {
      if (checkedRows.relations[index]) {
        const id1 = selectedLetters[`relationID1${index}`] || "";
        const id2 = selectedLetters[`relationID2${index}`] || "";
        const sheetName = textFieldValues[`sheetFieldRelation${index}`] || "";

        console.log(
          `Relation: ${relationLabel}, Tabellenblatt: ${sheetName}, ID1: ${id1}, ID2: ${id2}`
        ); // Debug-Log

        if (!relationData[relationLabel]) {
          relationData[relationLabel] = [];
        }

        if (id1 && id2 && sheetName) {
          relationData[relationLabel].push({ id1, id2, sheet: sheetName });
        } else {
          console.log(`Skipping ${relationLabel} due to missing IDs`); // Debug-Log
        }
      }
    });

    Object.entries(relationData).forEach(([relationLabel, data]) => {
      const RELATION_CONSTANT = data;
      console.log(`${relationLabel} Data:`, RELATION_CONSTANT);
    });
  };

  const importExcelData = async () => {
    const entityExcelDataTemp: {
      [key: string]: EntityData[];
    } = {};

    const relationExcelDataTemp: {
      [key: string]: RelationData[];
    } = {};

    const file = entitiesFile;
    if (!file) {
      console.error("Keine Datei ausgewählt.");
      return;
    }

    // ExcelJS Workbook laden
    const data = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(data);

    // Hilfsfunktion zum Überprüfen von Duplikaten
    const isDuplicate = (
      array: { name: string; id: string }[],
      name: string,
      id: string
    ) => {
      return array.some((item) => item.name === name && item.id === id);
    };

    // Hilfsfunktion zum Überprüfen von Duplikaten für Relationen
    const isRelationDuplicate = (
      array: { id1: string; id2: string }[],
      id1: string,
      id2: string
    ) => {
      return array.some((item) => item.id1 === id1 && item.id2 === id2);
    };

    const columnLetterToIndex = (letter: string): number => {
      return letter.charCodeAt(0) - 65;
    };

    [
      "Referenzdokument",
      "Dictionary",
      "Thema",
      "Klasse",
      "Merkmal",
      "Merkmalsgruppe",
      "Werteliste",
      "Maßeinheit",
      "Wert",
    ].forEach((entityLabel, index) => {
      if (checkedRows.entities[index]) {
        const sheetName = textFieldValues[`sheetField${index}`] || "";
        const useNameTextField = useTextField[`name${index}`];
        const nameColumnLetter = selectedLetters[`selectName${index}`] || "";
        const useIdTextField = useTextField[`id${index}`];
        let idColumnLetter = selectedLetters[`selectID${index}`] || "";

        if (useIdTextField && !idColumnLetter && index <= 2) {
          idColumnLetter = uuidv4();
        }

        if (!entityExcelDataTemp[entityLabel]) {
          entityExcelDataTemp[entityLabel] = [];
        }

        if (useNameTextField) {
          // Verwende den Textfeldwert direkt für den Namen
          const name = textFieldValues[`name${index}`] || "";
          let id = textFieldValues[`id${index}`] || "";

          // Check if we have sequential UUIDs for this entity type
          const hasSequentialUUIDs = sequentialUUIDs[entityLabel] && sequentialUUIDs[entityLabel].length > 0;
          
          // Auto-generate UUID if no ID provided
          if (!id) {
            if (hasSequentialUUIDs) {
              // Use the first sequential UUID for single text field entries
              id = sequentialUUIDs[entityLabel][0].uuid;
            } else if (index <= 2) {
              // Legacy fallback for first 3 entity types
              id = uuidv4();
            } else {
              // Use smart UUID generation based on name
              id = getOrCreateUUID(entityLabel, name);
            }
          }

          if (name && id) {
            // Duplikatprüfung beim Hinzufügen
            if (
              !isDuplicate(entityExcelDataTemp[entityLabel], name, id)
            ) {
              entityExcelDataTemp[entityLabel].push({ name, id });
            }
          } else {
            console.warn(`Kein gültiger Name für ${entityLabel} gefunden.`);
          }
        } else {
          // Check if we have sequential UUIDs for this entity type
          const hasSequentialUUIDs = sequentialUUIDs[entityLabel] && sequentialUUIDs[entityLabel].length > 0;
          
          if (hasSequentialUUIDs) {
            // Use sequential UUIDs in order
            console.log(`Using sequential UUIDs for ${entityLabel}:`, sequentialUUIDs[entityLabel]);
            sequentialUUIDs[entityLabel].forEach(entry => {
              if (!isDuplicate(entityExcelDataTemp[entityLabel], entry.name, entry.uuid)) {
                entityExcelDataTemp[entityLabel].push({ name: entry.name, id: entry.uuid });
              }
            });
          } else {
            // Falls Dropdown verwendet wird, müssen ein Tabellenname und Spaltenbuchstaben angegeben sein
            if (!sheetName || !nameColumnLetter) {
              if (index > 2) {
                console.error(
                  `Fehlende Informationen für ${entityLabel}: Tabellenblatt oder Namensspalte nicht definiert.`
                );
                return;
              }
            }

            const sheet = workbook.getWorksheet(sheetName);
            if (!sheet) {
              console.error(`Tabellenblatt ${sheetName} nicht gefunden.`);
              return;
            }

            const nameColumnIndex = columnLetterToIndex(nameColumnLetter) + 1; // ExcelJS ist 1-basiert
            const idColumnIndex = columnLetterToIndex(idColumnLetter) + 1;

            // Überspringe die Kopfzeile und verarbeite die Daten ab Zeile 2
            sheet.eachRow({ includeEmpty: false }, (row: ExcelJS.Row, rowNumber: number) => {
              if (rowNumber === 1) return; // Kopfzeile überspringen
              const name = row.getCell(nameColumnIndex).value as string;
              let id: string;

              // Check if ID column is provided
              if (idColumnLetter && idColumnLetter !== "") {
                // Use provided ID column
                id = row.getCell(idColumnIndex).value as string;
              } else {
                // Auto-generate UUID based on name
                id = getOrCreateUUID(entityLabel, name);
              }

              // Fallback for legacy logic (first 3 entity types)
              if (!id && index <= 2) {
                id = uuidv4();
              }

              if (name && id) {
                if (!isDuplicate(entityExcelDataTemp[entityLabel], name, id)) {
                  entityExcelDataTemp[entityLabel].push({ name, id });
                }
              } else {
                console.warn(
                  `Zeile ${rowNumber} in ${sheetName} enthält keine gültigen Werte für Name:`,
                  row.values
                );
              }
            });
          }
        }

        console.log(
          `Excel-Daten für ${entityLabel}:`,
          entityExcelDataTemp[entityLabel]
        );
      }
    });

    // Relationen durchgehen und Daten speichern
    [
      "Rel_Concept_Referenzdokument",
      "Rel_Concept_Dictionary",
      "Rel_Thema_Klasse",
      "Rel_Klasse_Merkmal",
      "Rel_Merkmal_Maßeinheit",
      "Rel_Merkmal_Werteliste",
      "Rel_Werteliste_Maßeinheit",
      "Rel_Werteliste_Wert",
      "Rel_Klasse_Merkmalsgruppe",
      "Rel_Merkmalsgruppe_Merkmal"
    ].forEach((relationLabel, index) => {
      if (checkedRows.relations[index]) {
        const sheetName = textFieldValues[`sheetFieldRelation${index}`] || "";
        const id1Selection = selectedLetters[`relationID1${index}`] || "";
        const id2Selection = selectedLetters[`relationID2${index}`] || "";

        console.log(
          `Relation: ${relationLabel}, Sheet Name: ${sheetName}, ID1 Selection: ${id1Selection}, ID2 Selection: ${id2Selection}`
        ); // Debug-Log

        if (!relationExcelDataTemp[relationLabel]) {
          relationExcelDataTemp[relationLabel] = [];
        }

        // Check if the selections are UUIDs (contain dashes), sequences (start with SEQUENCE:), or column letters
        const isId1UUID = id1Selection.includes('-');
        const isId2UUID = id2Selection.includes('-');
        const isId1Sequence = id1Selection.startsWith('SEQUENCE:');
        const isId2Sequence = id2Selection.startsWith('SEQUENCE:');

        if (isId1Sequence && isId2Sequence) {
          // Both are sequences - create relations based on order
          const entityType1 = id1Selection.replace('SEQUENCE:', '');
          const entityType2 = id2Selection.replace('SEQUENCE:', '');
          const sequence1 = sequentialUUIDs[entityType1] || [];
          const sequence2 = sequentialUUIDs[entityType2] || [];
          
          // Create relations based on order (1st with 1st, 2nd with 2nd, etc.)
          const minLength = Math.min(sequence1.length, sequence2.length);
          for (let i = 0; i < minLength; i++) {
            const id1 = sequence1[i].uuid;
            const id2 = sequence2[i].uuid;
            if (!isRelationDuplicate(relationExcelDataTemp[relationLabel], id1, id2)) {
              relationExcelDataTemp[relationLabel].push({ id1, id2 });
            }
          }
          console.log(`Sequential relation created: ${entityType1}[${sequence1.length}] -> ${entityType2}[${sequence2.length}], ${minLength} relations`);
          
        } else if (isId1Sequence || isId2Sequence) {
          // One sequence, one column - use sequence in order with column values
          const isSequenceFirst = isId1Sequence;
          const sequenceType = isSequenceFirst ? id1Selection.replace('SEQUENCE:', '') : id2Selection.replace('SEQUENCE:', '');
          const columnLetter = isSequenceFirst ? id2Selection : id1Selection;
          const sequence = sequentialUUIDs[sequenceType] || [];
          
          if (!sheetName) {
            console.error(`Sheet name required for sequence/column relation: ${relationLabel}`);
            return;
          }

          const sheet = workbook.getWorksheet(sheetName);
          if (!sheet) {
            console.error(`Tabellenblatt ${sheetName} nicht gefunden.`);
            return;
          }

          const columnIndex = columnLetterToIndex(columnLetter) + 1;
          const columnValues: string[] = [];
          
          // Read all values from the column first
          sheet.eachRow({ includeEmpty: false }, (row: ExcelJS.Row, rowNumber: number) => {
            if (rowNumber === 1) return;
            let cellValue = String(row.getCell(columnIndex).value || '').trim();
            
            // Try to resolve name to UUID if it's not already a UUID
            if (cellValue && !cellValue.includes('-')) {
              const foundUUID = findUUIDByName(cellValue);
              if (foundUUID) {
                cellValue = foundUUID;
              }
            }
            
            if (cellValue) {
              columnValues.push(cellValue);
            }
          });

          // Create relations in order: sequence[0] with columnValues[0], etc.
          const minLength = Math.min(sequence.length, columnValues.length);
          for (let i = 0; i < minLength; i++) {
            const sequenceUUID = sequence[i].uuid;
            const columnValue = columnValues[i];
            const id1 = isSequenceFirst ? sequenceUUID : columnValue;
            const id2 = isSequenceFirst ? columnValue : sequenceUUID;
            
            if (!isRelationDuplicate(relationExcelDataTemp[relationLabel], id1, id2)) {
              relationExcelDataTemp[relationLabel].push({ id1, id2 });
            }
          }
          console.log(`Sequential/Column relation created: ${sequence.length} sequence entries with ${columnValues.length} column values, ${minLength} relations`);
          
        } else if (isId1UUID && isId2UUID) {
          // Both are direct UUIDs - create relation directly
          if (id1Selection && id2Selection) {
            if (!isRelationDuplicate(relationExcelDataTemp[relationLabel], id1Selection, id2Selection)) {
              relationExcelDataTemp[relationLabel].push({ id1: id1Selection, id2: id2Selection });
              console.log(`Direct UUID relation: ${id1Selection} -> ${id2Selection}`);
            }
          }
        } else if (isId1UUID || isId2UUID) {
          // Mixed: one UUID, one column - need to process Excel data
          if (!sheetName) {
            console.error(`Sheet name required for mixed UUID/column relation: ${relationLabel}`);
            return;
          }

          const sheet = workbook.getWorksheet(sheetName);
          if (!sheet) {
            console.error(`Tabellenblatt ${sheetName} nicht gefunden.`);
            return;
          }

          let columnIndex = 0;
          let fixedUUID = "";
          
          if (isId1UUID) {
            fixedUUID = id1Selection;
            columnIndex = columnLetterToIndex(id2Selection) + 1;
          } else {
            fixedUUID = id2Selection;
            columnIndex = columnLetterToIndex(id1Selection) + 1;
          }

          sheet.eachRow({ includeEmpty: false }, (row: ExcelJS.Row, rowNumber: number) => {
            if (rowNumber === 1) return;
            let cellValue = String(row.getCell(columnIndex).value || '').trim();

            // Try to resolve name to UUID if it's not already a UUID
            if (cellValue && !cellValue.includes('-')) {
              const foundUUID = findUUIDByName(cellValue);
              if (foundUUID) {
                cellValue = foundUUID;
              }
            }

            if (cellValue) {
              const id1 = isId1UUID ? fixedUUID : cellValue;
              const id2 = isId1UUID ? cellValue : fixedUUID;
              
              if (!isRelationDuplicate(relationExcelDataTemp[relationLabel], id1, id2)) {
                relationExcelDataTemp[relationLabel].push({ id1, id2 });
              }
            }
          });
        } else {
          // Both are column letters - process as before
          if (!sheetName) {
            console.error(`Sheet name required for column-based relation: ${relationLabel}`);
            return;
          }

          const sheet = workbook.getWorksheet(sheetName);
          if (!sheet) {
            console.error(`Tabellenblatt ${sheetName} nicht gefunden.`);
            return;
          }

          // Convert column letters to indices
          const id1ColumnIndex = columnLetterToIndex(id1Selection) + 1;
          const id2ColumnIndex = columnLetterToIndex(id2Selection) + 1;

          // Start from the second row (index 2) to skip the header row
          sheet.eachRow({ includeEmpty: false }, (row: ExcelJS.Row, rowNumber: number) => {
            if (rowNumber === 1) return;
            let id1 = String(row.getCell(id1ColumnIndex).value || '').trim();
            let id2 = String(row.getCell(id2ColumnIndex).value || '').trim();

            // Try to resolve names to UUIDs if the values are not UUIDs
            // This helps when relations reference entity names instead of IDs
            if (id1 && typeof id1 === 'string' && !id1.includes('-')) {
              // Looks like a name, try to find corresponding UUID
              const foundUUID = findUUIDByName(id1);
              if (foundUUID) {
                id1 = foundUUID;
              }
            }

            if (id2 && typeof id2 === 'string' && !id2.includes('-')) {
              // Looks like a name, try to find corresponding UUID
              const foundUUID = findUUIDByName(id2);
              if (foundUUID) {
                id2 = foundUUID;
              }
            }

            if (id1 && id2) {
              if (!isRelationDuplicate(relationExcelDataTemp[relationLabel], id1, id2)) {
                relationExcelDataTemp[relationLabel].push({ id1, id2 });
              }
            } else {
              console.warn(
                `Zeile ${rowNumber} in ${sheetName} enthält keine gültigen Werte für ID1 oder ID2:`,
                row.values
              );
            }
          });
        }

        console.log(
          `Excel data for ${relationLabel}:`,
          relationExcelDataTemp[relationLabel]
        );
      }
    });

    // Ausgabe der gesammelten Daten
    Object.entries(entityExcelDataTemp).forEach(([entityLabel, data]) => {
      console.log(`${entityLabel} Data:`, data);
    });

    Object.entries(relationExcelDataTemp).forEach(([relationLabel, data]) => {
      console.log(`${relationLabel} Data:`, data);
    });

    await importEntities(entityExcelDataTemp); // Pass the argument to the function
    await importRelations(relationExcelDataTemp); // Pass the argument to the function
  };

  // Hilfsfunktionen
  const nameInTags = (nodes: TagResult[], searchName: string) => {
    return nodes.some(({ name }) => name === searchName);
  };

  const idOfTag = (nodes: TagResult[], searchName: string) => {
    return nodes.find((obj) => obj.name === searchName)!.id;
  };

  const createTagIfNotExists = async (tagId: string, name: string) => {
    await createTag({
      variables: {
        input: {
          tagId,
          name,
        },
      },
    });
    refetch({ pageSize: 100 });
  };

  const importEntities = async (entityExcelData: {
    [key: string]: EntityData[];
  }) => {
    // Definiere Entitätstypen und deren zugehörige Tags
    const entityTypes: {
      [key: string]: { recordType: CatalogRecordType; tag: string };
    } = {
      Referenzdokument: {
        recordType: CatalogRecordType.ExternalDocument,
        tag: "Referenzdokument",
      },
      Dictionary: {
        recordType: CatalogRecordType.Dictionary,
        tag: "Dictionary",
      },
      Thema: {
        recordType: CatalogRecordType.Subject,
        tag: "Thema",
      },
      Klasse: {
        recordType: CatalogRecordType.Subject,
        tag: "Klasse",
      },
      Merkmal: {
        recordType: CatalogRecordType.Property,
        tag: "Merkmal",
      },
      Merkmalsgruppe: {
        recordType: CatalogRecordType.Subject,
        tag: "Merkmalsgruppe",
      },
      Werteliste: {
        recordType: CatalogRecordType.ValueList,
        tag: "Werteliste",
      },
      Maßeinheit: {
        recordType: CatalogRecordType.Unit,
        tag: "Maßeinheit",
      },
      Wert: {
        recordType: CatalogRecordType.Value,
        tag: "Wert",
      },
    };

    // Import Tag ist jetzt verpflichtend, kein Fallback mehr nötig
    createTagIfNotExists(importTag, importTag);

    // Vorhandene Tags abrufen
    const tagsResponse = await refetch();
    const existingTags = tagsResponse.data?.findTags.nodes ?? [];

    // Importstatus
    let allImportsSuccessful = true;

    // Gesamtanzahl der Entitäten berechnen
    const totalEntities = Object.values(entityExcelData).reduce(
      (acc, entities) => acc + entities.length,
      0
    );
    let processedEntities = 0;

    // Entitäten importieren
    for (const [entityKey, entities] of Object.entries(entityExcelData)) {
      // Check for abort before processing each entity type
      if (checkAborted()) {
        console.log("Import aborted during entity processing");
        return;
      }
      
      setCurrentAction(`Importiere ${entityKey} (${entities.length} Einträge)...`);
      console.log(`Processing entityKey: "${entityKey}"`);
      const { recordType, tag } = entityTypes[entityKey];
      const tagIds = [];
      // Import Tag ist jetzt verpflichtend
      tagIds.push(importTag);

      if (!nameInTags(existingTags, tag)) {
        const tagId = uuidv4();
        try {
          await createTagIfNotExists(tagId, tag);
          existingTags.push({ id: tagId, name: tag });
        } catch (e) {
          const errorMessage = e?.toString() || '';
          if (errorMessage.includes('already exists') || errorMessage.includes('duplicate') || errorMessage.includes('conflict')) {
            console.warn(`Tag already exists: ${tag}`);
            enqueueSnackbar(`⚠️ Tag "${tag}" bereits vorhanden`, { 
              variant: "warning",
              autoHideDuration: 3000 
            });
          } else {
            enqueueSnackbar(`❌ Tag "${tag}" konnte nicht erstellt werden: ` + e, {
              variant: "error",
            });
            allImportsSuccessful = false;
          }
        }
      }
      tagIds.push(idOfTag(existingTags, tag));

      for (const entity of entities) {
        // Check for abort before processing each entity
        if (checkAborted()) {
          console.log("Import aborted during entity creation");
          return;
        }
        
        const { name, id } = entity;

        if (!name) {
          console.warn(`Skipping empty name for ${entityKey}`);
          continue;
        }

        try {
          setStatus(`Importing ${recordType}: ${name}`);
          setCurrentAction(`Erstelle ${entityKey}: ${name}`);
          console.log(`Creating record "${recordType}" with name: ${name}`);
          
          await create({
            variables: {
              input: {
                catalogEntryType: recordType,
                tags: tagIds,
                properties: {
                  id: id,
                  names: [{ languageTag: "de", value: name }],
                },
              },
            },
          });

          // Track imported entities for potential rollback
          setImportedEntities(prev => [...prev, `${recordType}: ${name}`]);

          // Fortschritt aktualisieren
          processedEntities += 1;
          if (!checkAborted()) {
            setProgress((processedEntities / totalEntities) * 100); // Fortschritt als Prozentsatz
          }
        } catch (error) {
          console.error(`Error creating record "${recordType}"... ${name}`, error);
          
          // Check if it's a duplicate error
          const errorMessage = error?.toString() || '';
          if (errorMessage.includes('already exists') || errorMessage.includes('duplicate') || errorMessage.includes('conflict')) {
            enqueueSnackbar(`⚠️ Entität "${name}" mit ID "${id}" ist bereits in DataCat vorhanden`, { 
              variant: "warning",
              autoHideDuration: 4000 
            });
            console.warn(`Duplicate entity skipped: ${name} (ID: ${id})`);
          } else {
            enqueueSnackbar(`❌ Fehler beim Erstellen: ${name}`, { variant: "error" });
            allImportsSuccessful = false;
          }
        }
      }
    }

    // Snackbar nur bei Fehlern ausführen
    if (!allImportsSuccessful) {
      enqueueSnackbar(
        "Es gab Fehler beim Importieren einiger Entitäten. Bitte prüfen.",
        { variant: "error" }
      );
    }

    console.log("Import of all entities completed");
  };

  const importRelations = async (relationExcelData: {
    [key: string]: RelationData[];
  }) => {
    // Define relationship types mapping directly to RelationshipRecordType
    const relTypes: { [key: string]: RelationshipRecordType } = {
      Rel_Concept_Referenzdokument: RelationshipRecordType.ReferenceDocuments,
      Rel_Concept_Dictionary: RelationshipRecordType.Dictionary,
      Rel_Thema_Klasse: RelationshipRecordType.RelationshipToSubject,
      Rel_Klasse_Merkmal: RelationshipRecordType.Properties,
      Rel_Merkmal_Maßeinheit: RelationshipRecordType.Units,
      Rel_Merkmal_Werteliste: RelationshipRecordType.PossibleValues,
      Rel_Werteliste_Maßeinheit: RelationshipRecordType.Unit,
      Rel_Werteliste_Wert: RelationshipRecordType.Values,
      Rel_Klasse_Merkmalsgruppe: RelationshipRecordType.RelationshipToSubject,
      Rel_Merkmalsgruppe_Merkmal: RelationshipRecordType.Properties
      // Rel_Thema_Thema: RelationshipRecordType.RelationshipToSubject 
    };

    // Import status
    let allImportsSuccessful = true;

    // Gesamtanzahl der Relationen berechnen
    const totalRelations = Object.values(relationExcelData).reduce(
      (acc, relations) => acc + relations.length,
      0
    );
    let processedRelations = 0;

    // Iterate over each relation type and create relationships
    for (const [relationKey, relations] of Object.entries(relationExcelData)) {
      // Check for abort before processing each relation type
      if (checkAborted()) {
        console.log("Import aborted during relation processing");
        return;
      }

      const relationshipType = relTypes[relationKey];

      // Statusanzeige: Welche Relation wird aktuell importiert
      console.log(`Processing relationKey: "${relationKey}"`);
      console.log(`Mapped relationshipType: "${relationshipType}"`);

      if (!relationshipType) {
        console.warn(`Unknown relationship type for "${relationKey}"`);
        continue;
      }

      setStatus(`Importing ${relationKey}...`);

      const grouped: { [fromId: string]: string[] } = {};
      for (const { id1, id2 } of relations) {
        if (!id1 || !id2) continue;
        if (!grouped[id1]) grouped[id1] = [];
        grouped[id1].push(id2);
      }

      for (const [fromId, toIds] of Object.entries(grouped)) {
        // Check for abort before processing each relation group
        if (checkAborted()) {
          console.log("Import aborted during relation creation");
          return;
        }

        try {
          let properties: any = {};
          if (relationshipType === RelationshipRecordType.RelationshipToSubject) {
            properties = {
              relationshipToSubjectProperties: {
                relationshipType: "XTD_SCHEMA_LEVEL"
              }
            }
          }

          console.log(
            `Creating relationship "${relationshipType}" from ${fromId} to ${toIds.join(", ")}`
          );
          await createRelationship({
            variables: {
              input: {
                relationshipType: relationshipType,
                properties: properties,
                fromId,
                toIds,
              },
            },
          });

          // Fortschritt aktualisieren
          processedRelations += toIds.length;
          if (!checkAborted()) {
            setProgress((processedRelations / totalRelations) * 100); // Fortschritt als Prozentsatz
          }
        } catch (error) {
          console.error(
            `Error creating relationship "${relationshipType}" from ${fromId} to ${toIds.join(", ")}`,
            error
          );
          
          // Check if it's a duplicate or already exists error
          const errorMessage = error?.toString() || '';
          if (errorMessage.includes('already exists') || errorMessage.includes('duplicate') || errorMessage.includes('conflict')) {
            console.warn(`Duplicate relationship skipped: ${relationshipType} from ${fromId} to ${toIds.join(", ")}`);
            enqueueSnackbar(`⚠️ Relation bereits vorhanden: ${relationshipType}`, { 
              variant: "warning",
              autoHideDuration: 3000 
            });
          } else {
            enqueueSnackbar(`❌ Fehler beim Erstellen der Relation: ${relationshipType}`, { variant: "error" });
            allImportsSuccessful = false;
          }
        }
      }
    }

    // Snackbar nur bei Fehlern anzeigen
    if (!allImportsSuccessful) {
      enqueueSnackbar(
        "Es gab Fehler beim Importieren einiger Relationen. Bitte prüfen.",
        {
          variant: "error",
        }
      );
    }
    console.log("Import of all relationships completed");
  };

  const renderEntityTable = () => (
    <StyledTableContainer component={Paper}>
      <StyledTable>
        <TableHead>
          <TableRow>
            <StyledHeaderCell>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Object.values(checkedRows.entities).every(Boolean)}
                    onChange={() => handleSelectAll("entities")}
                  />
                }
                label={<T keyName="import_excel.select_all" />}
              />
            </StyledHeaderCell>
            <StyledHeaderCell><T keyName="import_excel.label" /></StyledHeaderCell>
            <StyledHeaderCell><T keyName="import_excel.sheet" /></StyledHeaderCell>
            <StyledHeaderCell><T keyName="import_excel.name" /></StyledHeaderCell>
            <StyledHeaderCell><T keyName="import_excel.id" /></StyledHeaderCell>
            <StyledHeaderCell>UUID Generation</StyledHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[
            { label: <T keyName="document.titlePlural" />, toggle: true },
            { label: <T keyName="dictionary.titlePlural" />, toggle: true },
            { label: <T keyName="theme.titlePlural" />, toggle: true },
            { label: <T keyName="class.titlePlural" />, toggle: true },
            { label: <T keyName="property.titlePlural" />, toggle: false },
            { label: <T keyName="propertyGroup.titlePlural" />, toggle: false },
            { label: <T keyName="valuelist.titlePlural" />, toggle: false },
            { label: <T keyName="unit.titlePlural" />, toggle: false },
            { label: <T keyName="value.titlePlural" />, toggle: false },
          ].map((entity, index) => (
            <TableRow key={index}>
              <StyledTableCell>
                <Checkbox
                  checked={!!checkedRows.entities[index]}
                  onChange={() => handleCheckboxChange(index, "entities")}
                />
              </StyledTableCell>
              <StyledTableCell>{entity.label}</StyledTableCell>
              <StyledTableCell>
                <TextField
                  value={textFieldValues[`sheetField${index}`] || ""}
                  onChange={(e) => handleTextFieldChange(e, `sheetField${index}`)}
                  fullWidth
                  placeholder={t('import_excel.sheetName')}
                  disabled={!checkedRows.entities[index]}
                  size="small"
                />
              </StyledTableCell>
              <StyledTableCell>
                <FlexBox>
                  {useTextField[`name${index}`] ? (
                    <TextField
                      value={textFieldValues[`name${index}`] || ""}
                      onChange={(e) => handleTextFieldChange(e, `name${index}`)}
                      fullWidth
                      placeholder="Name"
                      disabled={!checkedRows.entities[index]}
                      size="small"
                    />
                  ) : (
                    <FullWidthSelect
                      value={selectedLetters[`selectName${index}`] || ""}
                      onChange={(e) => handleSelectChange(e, `selectName${index}`)}
                      displayEmpty
                      disabled={!checkedRows.entities[index]}
                      size="small"
                    >
                      {alphabet.map((letter) => (
                        <MenuItem key={letter} value={letter}>
                          {letter}
                        </MenuItem>
                      ))}
                    </FullWidthSelect>
                  )}
                  {entity.toggle && index <= 3 && (
                    <Button
                      size="small"
                      onClick={() => handleUseTextFieldToggle(`name${index}`)}
                    >
                      {useTextField[`name${index}`] ? "Dropdown" : "Text"}
                    </Button>
                  )}
                </FlexBox>
              </StyledTableCell>
              <StyledTableCell>
                <SelectContainer>
                  {!useTextField[`id${index}`] && (
                    <FullWidthSelect
                      value={selectedLetters[`selectID${index}`] || ""}
                      onChange={(e) => handleSelectChange(e, `selectID${index}`)}
                      displayEmpty
                      disabled={entity.toggle ? useTextField[`id${index}`] || !checkedRows.entities[index] : !checkedRows.entities[index]}
                      size="small"
                    >
                      {alphabet.map((letter) => (
                        <MenuItem key={letter} value={letter}>
                          {letter}
                        </MenuItem>
                      ))}
                    </FullWidthSelect>
                  )}
                  {entity.toggle && useTextField[`id${index}`] && (
                    <TextField
                      value={textFieldValues[`id${index}`] || ""}
                      onChange={(e) => handleTextFieldChange(e, `id${index}`)}
                      fullWidth
                      placeholder="ID"
                      disabled={!useTextField[`id${index}`] || !checkedRows.entities[index]}
                      size="small"
                    />
                  )}
                  {entity.toggle && (
                    <Button
                      size="small"
                      onClick={() => handleUseTextFieldToggle(`id${index}`)}
                    >
                      {useTextField[`id${index}`] ? "Dropdown" : "Text"}
                    </Button>
                  )}
                </SelectContainer>
              </StyledTableCell>
              <StyledTableCell>
                {(() => {
                  const entityTypes = [
                    "Referenzdokument", "Dictionary", "Thema", "Klasse", "Merkmal", 
                    "Merkmalsgruppe", "Werteliste", "Maßeinheit", "Wert"
                  ];
                  const entityType = entityTypes[index];
                  const hasName = useTextField[`name${index}`] ? 
                    textFieldValues[`name${index}`] : 
                    selectedLetters[`selectName${index}`];
                  const hasId = useTextField[`id${index}`] ? 
                    textFieldValues[`id${index}`] : 
                    selectedLetters[`selectID${index}`];
                  const needsUUIDs = checkedRows.entities[index] && hasName && !hasId;
                  const hasGeneratedUUIDs = sequentialUUIDs[entityType]?.length > 0;

                  if (!checkedRows.entities[index]) {
                    return <Typography variant="body2" color="text.disabled">-</Typography>;
                  }

                  if (!needsUUIDs) {
                    return <Typography variant="body2" color="text.secondary">Nicht benötigt</Typography>;
                  }

                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        size="small"
                        variant={hasGeneratedUUIDs ? "outlined" : "contained"}
                        color={hasGeneratedUUIDs ? "secondary" : "primary"}
                        onClick={() => generateUUIDsForEntity(index)}
                        disabled={!hasName}
                        sx={{ minWidth: '120px' }}
                      >
                        {hasGeneratedUUIDs ? "🔄 Neu generieren" : "🆔 IDs generieren"}
                      </Button>
                      {hasGeneratedUUIDs && (
                        <Typography variant="caption" color="success.main" sx={{ textAlign: 'center' }}>
                          ✅ {sequentialUUIDs[entityType].length} IDs
                        </Typography>
                      )}
                    </Box>
                  );
                })()}
              </StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>
    </StyledTableContainer>
  );

  const renderRelationTable = () => (
    <StyledTableContainer component={Paper}>
      <StyledTable>
        <TableHead>
          <TableRow>
            <StyledHeaderCell>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Object.values(checkedRows.relations).every(Boolean)}
                    onChange={() => handleSelectAll("relations")}
                  />
                }
                label={<T keyName='import_excel.select_all' />}
              />
            </StyledHeaderCell>
            <StyledHeaderCell>{<T keyName='import_excel.relations' />}</StyledHeaderCell>
            <StyledHeaderCell>{<T keyName='import_excel.sheetName' />}</StyledHeaderCell>
            <StyledHeaderCell>ID 1</StyledHeaderCell>
            <StyledHeaderCell>ID 2</StyledHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[
            <T keyName="import_excel.rel_concept_doc" />,
            <T keyName="import_excel.rel_concept_dictionary" />,
            <T keyName="import_excel.rel_theme_class" />,
            <T keyName="import_excel.rel_class_property" />,
            <T keyName="import_excel.rel_property_unit" />,
            <T keyName="import_excel.rel_property_valuelist" />,
            <T keyName="import_excel.rel_valuelist_unit" />,
            <T keyName="import_excel.rel_valuelist_value" />,
            <T keyName="import_excel.rel_class_propertygroup" />,
            <T keyName="import_excel.rel_propertygroup_property" />
          ].map((relation, index) => (
            <TableRow key={index}>
              <StyledTableCell>
                <Checkbox
                  checked={!!checkedRows.relations[index]}
                  onChange={() => handleCheckboxChange(index, "relations")}
                />
              </StyledTableCell>
              <StyledTableCell>{relation}</StyledTableCell>
              <StyledTableCell>
                <TextField
                  value={textFieldValues[`sheetFieldRelation${index}`] || ""}
                  onChange={(e) => handleTextFieldChange(e, `sheetFieldRelation${index}`)}
                  fullWidth
                  placeholder={t('import_excel.sheetName')}
                  disabled={!checkedRows.relations[index]}
                  size="small"
                />
              </StyledTableCell>
              <StyledTableCell>
                <FullWidthSelect
                  value={selectedLetters[`relationID1${index}`] || ""}
                  onChange={(e) => handleSelectChange(e, `relationID1${index}`)}
                  displayEmpty
                  disabled={!checkedRows.relations[index]}
                  size="small"
                >
                  <MenuItem value="">
                    <em>Auswählen...</em>
                  </MenuItem>
                  
                  <ListSubheader sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Excel-Spalten
                  </ListSubheader>
                  {alphabet.map((letter) => (
                    <MenuItem key={letter} value={letter}>
                      Spalte {letter}
                    </MenuItem>
                  ))}
                  
                  {Object.keys(sequentialUUIDs).length > 0 && [
                      <ListSubheader key="seq-header-1" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                        Sequenzielle ID-Listen
                      </ListSubheader>,
                      ...Object.entries(sequentialUUIDs).map(([entityType, entries]) => (
                        <MenuItem key={`${entityType}-sequence`} value={`SEQUENCE:${entityType}`} sx={{ pl: 3 }}>
                          📋 {entityType} Liste ({entries.length} Einträge)
                        </MenuItem>
                      ))
                  ]}
                </FullWidthSelect>
              </StyledTableCell>
              <StyledTableCell>
                <FullWidthSelect
                  value={selectedLetters[`relationID2${index}`] || ""}
                  onChange={(e) => handleSelectChange(e, `relationID2${index}`)}
                  displayEmpty
                  disabled={!checkedRows.relations[index]}
                  size="small"
                >
                  <MenuItem value="">
                    <em>Auswählen...</em>
                  </MenuItem>
                  
                  <ListSubheader sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Excel-Spalten
                  </ListSubheader>
                  {alphabet.map((letter) => (
                    <MenuItem key={letter} value={letter}>
                      Spalte {letter}
                    </MenuItem>
                  ))}
                  
                  {Object.keys(sequentialUUIDs).length > 0 && [
                      <ListSubheader key="seq-header-2" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                        Sequenzielle ID-Listen
                      </ListSubheader>,
                      ...Object.entries(sequentialUUIDs).map(([entityType, entries]) => (
                        <MenuItem key={`${entityType}-sequence-2`} value={`SEQUENCE:${entityType}`} sx={{ pl: 3 }}>
                          📋 {entityType} Liste ({entries.length} Einträge)
                        </MenuItem>
                      ))
                  ]}
                </FullWidthSelect>
              </StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>
    </StyledTableContainer>
  );

  // Render function for generated UUIDs display
  const renderGeneratedUUIDs = () => {
    const hasGeneratedUUIDs = Object.keys(generatedUUIDs).length > 0;
    
    if (!hasGeneratedUUIDs) return null;

    return (
      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          🆔 Generierte UUIDs
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Automatisch generierte IDs für Einträge ohne ID-Spalte. Diese können in Relationen verwendet werden:
        </Typography>
        
        {Object.entries(generatedUUIDs).map(([entityType, nameToUuidMap]) => {
          const entries = Object.entries(nameToUuidMap);
          if (entries.length === 0) return null;
          
          return (
            <Box key={entityType} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {entityType} ({entries.length} {entries.length === 1 ? 'Eintrag' : 'Einträge'})
              </Typography>
              <Box sx={{ pl: 2 }}>
                {entries.map(([name, uuid]) => (
                  <Typography key={name} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    <strong>{name}</strong> → {uuid}
                  </Typography>
                ))}
              </Box>
            </Box>
          );
        })}
        
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'success.light', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            💡 Tipp: Diese generierten IDs erscheinen automatisch in den Dropdown-Listen für Relationen. 
            So können Sie Beziehungen zwischen automatisch erstellten Einträgen definieren.
          </Typography>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={clearGeneratedUUIDs}
            startIcon={<span>🗑️</span>}
          >
            UUIDs zurücksetzen
          </Button>
        </Box>
      </Box>
    );
  };

  const renderActionArea = () => (
    <ButtonsContainer sx={{ mt: 2 }}>
      <ButtonWrapper>
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <ActionButton
            variant="contained"
            component="label"
            color="primary"
            sx={{ 
              minWidth: '220px',
              paddingRight: '40px'
            }}
          >
            <T keyName="import_excel.select_file_button" />
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              name="entitiesFile"
              hidden
              ref={fileInputRef}
            />
          </ActionButton>
          <Box sx={{ 
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 1
          }}>
            <InfoButton 
              titleKey="import_excel.help.file_select.title" 
              contentKey="import_excel.help.file_select.content"
              size="small"
            />
          </Box>
        </Box>
        <Typography color="textSecondary">
          {entitiesFile === null ? <T keyName="import_excel.no_file_selected" /> : entitiesFile.name}
        </Typography>
      </ButtonWrapper>

      <ButtonWrapper>
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <ActionButton
            variant="contained"
            color="secondary"
            onClick={handleValidationClick}
            disabled={isImporting}
            sx={{ 
              minWidth: '180px',
              paddingRight: '40px'
            }}
          >
            <T keyName="import_excel.check_inputs_button" />
          </ActionButton>
          <Box sx={{ 
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 1
          }}>
            <InfoButton 
              titleKey="import_excel.help.validation.title" 
              contentKey="import_excel.help.validation.content"
              size="small"
            />
          </Box>
        </Box>
      </ButtonWrapper>

      <ButtonWrapper>
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <ActionButton
            variant="outlined"
            color="info"
            onClick={generatePreview}
            disabled={!entitiesFile || !valid || !importTag.trim() || isImporting}
            sx={{ 
              minWidth: '190px',
              paddingRight: '40px'
            }}
          >
            Vorschau anzeigen
          </ActionButton>
          <Box sx={{ 
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 1
          }}>
            <InfoButton 
              titleKey="import_excel.help.preview.title" 
              contentKey="import_excel.help.preview.content"
              size="small"
            />
          </Box>
        </Box>
      </ButtonWrapper>

      <ButtonWrapper>
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <TextField
            id="importTag"
            label={<T keyName="import_excel.import_tag_label" />}
            name="importTag"
            variant="outlined"
            size="small"
            onChange={handleImportTagChange}
            value={importTag}
            sx={{ mb: 0.5, width: "240px", paddingRight: '32px' }}
            disabled={isImporting}
            required
            error={!importTag.trim()}
          />
          <Box sx={{ 
            position: 'absolute',
            top: 8,
            right: 4,
            zIndex: 1
          }}>
            <InfoButton 
              titleKey="import_excel.help.import_tag.title" 
              contentKey="import_excel.help.import_tag.content"
              size="small"
            />
          </Box>
        </Box>
      </ButtonWrapper>

      <ButtonWrapper>
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <ActionButton
            variant="contained"
            color="primary"
            disabled={!entitiesFile || !valid || !importTag.trim() || isImporting}
            onClick={handleimportExcel}
            sx={{ 
              minWidth: '240px',
              paddingRight: '40px'
            }}
          >
            {isImporting ? "Importiere..." : <T keyName="import_excel.import_button" />}
          </ActionButton>
          <Box sx={{ 
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 1
          }}>
            <InfoButton 
              titleKey="import_excel.help.import.title" 
              contentKey="import_excel.help.import.content"
              size="small"
            />
          </Box>
        </Box>
      </ButtonWrapper>

      {isImporting && (
        <ButtonWrapper>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <ActionButton
              variant="contained"
              color="error"
              onClick={abortImport}
              sx={{ 
                minWidth: '190px',
                paddingRight: '40px'
              }}
            >
              Import abbrechen
            </ActionButton>
            <Box sx={{ 
              position: 'absolute',
              top: 4,
              right: 4,
              zIndex: 1
            }}>
              <InfoButton 
                titleKey="import_excel.help.abort.title" 
                contentKey="import_excel.help.abort.content"
                size="small"
              />
            </Box>
          </Box>
        </ButtonWrapper>
      )}

      <ButtonWrapper>
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <ActionButton
            variant="outlined"
            color="success"
            onClick={downloadGeneratedUUIDs}
            disabled={Object.keys(sequentialUUIDs).length === 0}
            sx={{ 
              minWidth: '200px',
              paddingRight: '40px'
            }}
          >
            📥 UUIDs herunterladen
          </ActionButton>
          <Box sx={{ 
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 1
          }}>
            <InfoButton 
              titleKey="import_excel.help.download_uuids.title" 
              contentKey="import_excel.help.download_uuids.content"
              size="small"
            />
          </Box>
        </Box>
      </ButtonWrapper>

      <ButtonWrapper>
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <ActionButton
            variant="contained"
            color="inherit"
            onClick={handleClearTable}
            disabled={isImporting}
            sx={{ 
              minWidth: '210px',
              paddingRight: '40px'
            }}
          >
            <T keyName="import_excel.reset_button" />
          </ActionButton>
          <Box sx={{ 
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 1
          }}>
            <InfoButton 
              titleKey="import_excel.help.reset.title" 
              contentKey="import_excel.help.reset.content"
              size="small"
            />
          </Box>
        </Box>
      </ButtonWrapper>
    </ButtonsContainer>
  );

  const renderProgressArea = () => (
    <ProgressContainer>
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        color={importAborted ? "error" : "primary"}
      />
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
        <Typography variant="body2" color={importAborted ? "error" : "inherit"}>
          {currentAction || status}
        </Typography>
        <Typography variant="body2">{progress.toFixed(1)}%</Typography>
      </Stack>
      
      {isImporting && (
        <Stack direction="row" spacing={2} sx={{ mt: 2 }} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            ⏱️ Gestartet: {importStartTime?.toLocaleTimeString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            📦 Importierte Einträge: {importedEntities.length}
          </Typography>
        </Stack>
      )}
      
      {importAborted && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          ⚠️ Import wurde abgebrochen. Bereits erstellte Einträge bleiben bestehen.
        </Typography>
      )}
    </ProgressContainer>
  );

  const renderPreviewDialog = () => (
    <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        📋 Import-Vorschau
      </DialogTitle>
      <DialogContent>
        {previewData && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Zusammenfassung
            </Typography>
            <Typography variant="body2" paragraph>
              Gesamtanzahl zu importierender Elemente: <strong>{previewData.totalItems}</strong>
            </Typography>
            
            {Object.keys(generatedUUIDs).length > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  🆔 Automatisch generierte UUIDs
                </Typography>
                {Object.entries(generatedUUIDs).map(([entityType, uuids]) => (
                  <Typography key={entityType} variant="body2">
                    • {entityType}: {Object.keys(uuids).length} neue UUIDs
                  </Typography>
                ))}
              </Box>
            )}
            
            <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                ✅ Bereit zum Import
              </Typography>
              <Typography variant="body2">
                Alle Validierungen bestanden. Der Import kann gestartet werden.
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowPreview(false)}>
          Schließen
        </Button>
        <Button 
          variant="contained" 
          onClick={() => {
            setShowPreview(false);
            handleimportExcel({} as React.MouseEvent<HTMLButtonElement>);
          }}
          disabled={!entitiesFile || !valid}
        >
          Import starten
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <View heading={<T keyName="import_excel.heading" />}>
      <Box>
        <Typography variant="body1" paragraph>
          <T keyName="import_excel.description" />
        </Typography>

        {renderEntityTable()}
        {renderRelationTable()}
        {renderActionArea()}

        {(progress > 0 || isImporting) && renderProgressArea()}
        {renderPreviewDialog()}
      </Box>
    </View>
  );
}
