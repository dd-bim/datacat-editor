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
  ButtonProps
} from "@mui/material";
import { useSnackbar } from "notistack";
import View from "./View";
import {
  CatalogRecordType,
  RelationshipRecordType,
  FindTagsResultFragment,
  useFindTagsQuery,
  useCreateEntryMutation,
  useCreateRelationshipMutation,
  useCreateTagMutation,
} from "../generated/types";
import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";
import { T, useTranslate } from '@tolgee/react';


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
}));

const ActionButton = styled(Button)<ButtonProps>(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
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
  const [createTag] = useCreateTagMutation();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const { t } = useTranslate();

  const handleValidationClick = () => {
    const hasErrors = handleValidation();
    enqueueSnackbar(
      hasErrors
        ? <T keyName="import_excel.validation_error" />
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
  const { refetch } = useFindTagsQuery({
    variables: {
      pageSize: 100,
    },
  });

  const [create] = useCreateEntryMutation();
  const [createRelationship] = useCreateRelationshipMutation();

  // File change handler
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      setEntitiesFile(selectedFile);
      refetch({ pageSize: 100 });
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
    handleImportEntities(); // Erste Funktion aufrufen
    await importExcelData(); // Danach die Excel-Daten importieren
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
        "Bitte wählen Sie eine Excel-Datei zum Importieren aus."
      );
    }

    // Check if at least one row is selected
    const hasSelectedRows = Object.values(checkedRows.entities).some(
      (isChecked) => isChecked
    );
    if (!hasSelectedRows) {
      hasErrors = true;
      errorMessages.push(
        "Bitte wählen Sie mindestens eine Zeile zum Importieren aus."
      );
    }

    // Check if all selected rows are completely filled
    Object.entries(checkedRows.entities).forEach(([rowIndex, isChecked]) => {
      if (isChecked) {
        const rowNumber = parseInt(rowIndex, 10) + 1;
        const rowName = `Tabelle 1, Zeile ${rowNumber}`; // Assume table 1 for entities
        const nameValue = textFieldValues[`name${rowIndex}`];
        const idValue = textFieldValues[`id${rowIndex}`];
        const selectedName = selectedLetters[`selectName${rowIndex}`];
        const selectedId = selectedLetters[`selectID${rowIndex}`];
        const useNameTextField = useTextField[`name${rowIndex}`];
        const useIdTextField = useTextField[`id${rowIndex}`];

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

        // Check if id field is filled or selected
        if (isIdRequired(parseInt(rowIndex)) && useIdTextField && !idValue) {
          hasErrors = true;
          errorMessages.push(
            `${rowName}: Das Textfeld "ID" muss ausgefüllt werden.`
          );
        } else if (
          isIdRequired(parseInt(rowIndex)) &&
          !useIdTextField &&
          !selectedId
        ) {
          hasErrors = true;
          errorMessages.push(
            `${rowName}: Das Dropdown "ID" muss ausgewählt werden.`
          );
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
              "In einem Tabellenblatt dürfen keine gleichen Spalten für unterschiedliche Entitäten/ IDs verwendet werden."
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

        if (name && id && sheetName) {
          console.log(
            `Adding to entityData: ${entityLabel}, Name: ${name}, ID: ${id}, Sheet: ${sheetName}`
          ); // Debug-Log
          entityData[entityLabel].push({ sheet: sheetName, name, id });
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

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);

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

          if (!id && index <= 2) {
            id = uuidv4();
          }

          if (name) {
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
          // Falls Dropdown verwendet wird, müssen ein Tabellenname und Spaltenbuchstaben angegeben sein
          if (!sheetName || !nameColumnLetter) {
            if (index > 2) {
              console.error(
                `Fehlende Informationen für ${entityLabel}: Tabellenblatt oder Namensspalte nicht definiert.`
              );
              return;
            }
          }

          const sheet = workbook.Sheets[sheetName];
          if (!sheet) {
            console.error(`Tabellenblatt ${sheetName} nicht gefunden.`);
            return;
          }

          const nameColumnIndex = columnLetterToIndex(nameColumnLetter);
          const idColumnIndex = columnLetterToIndex(idColumnLetter);

          const jsonData = XLSX.utils.sheet_to_json<{ [key: string]: string }>(
            sheet,
            { header: 1 }
          );

          // Überspringe die Kopfzeile und verarbeite die Daten ab Zeile 2
          jsonData.slice(1).forEach((row, rowIndex) => {
            const name = row[nameColumnIndex];
            let id = row[idColumnIndex];

            if (!id && index <= 2) {
              id = uuidv4();
            }

            if (name) {
              // Duplikatprüfung beim Hinzufügen
              if (
                !isDuplicate(entityExcelDataTemp[entityLabel], name, id)
              ) {
                entityExcelDataTemp[entityLabel].push({ name, id });
              }
            } else {
              console.warn(
                `Zeile ${rowIndex + 2
                } in ${sheetName} enthält keine gültigen Werte für Name:`,
                row
              );
            }
          });
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
        const id1ColumnLetter = selectedLetters[`relationID1${index}`] || "";
        const id2ColumnLetter = selectedLetters[`relationID2${index}`] || "";

        console.log(
          `Relation: ${relationLabel}, Sheet Name: ${sheetName}, ID1 Column: ${id1ColumnLetter}, ID2 Column: ${id2ColumnLetter}`
        ); // Debug-Log

        if (!sheetName || !id1ColumnLetter || !id2ColumnLetter) {
          console.error(
            `Fehlende Informationen für ${relationLabel}: Tabellenblatt oder Spalten nicht definiert.`
          );
          return;
        }

        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
          console.error(`Tabellenblatt ${sheetName} nicht gefunden.`);
          return;
        }

        if (!relationExcelDataTemp[relationLabel]) {
          relationExcelDataTemp[relationLabel] = [];
        }

        // Convert column letters to indices
        const id1ColumnIndex = columnLetterToIndex(id1ColumnLetter);
        const id2ColumnIndex = columnLetterToIndex(id2ColumnLetter);

        // Auslesen der Excel-Daten
        const jsonData = XLSX.utils.sheet_to_json<{ [key: string]: string }>(
          sheet,
          { header: 1 }
        ); // Read as 2D array

        // Start from the second row (index 1) to skip the header row
        for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
          const id1 = jsonData[rowIndex][id1ColumnIndex];
          const id2 = jsonData[rowIndex][id2ColumnIndex];

          if (id1 && id2) {
            // Prüfe auf Duplikate vor dem Hinzufügen
            if (
              !isRelationDuplicate(
                relationExcelDataTemp[relationLabel],
                id1,
                id2
              )
            ) {
              relationExcelDataTemp[relationLabel].push({ id1, id2 });
            }
          } else {
            console.warn(
              `Zeile ${rowIndex + 1
              } in ${sheetName} enthält keine gültigen Werte für ID1 oder ID2:`,
              jsonData[rowIndex]
            );
          }
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
  const nameInTags = (nodes: FindTagsResultFragment[], searchName: string) => {
    return nodes.some(({ name }) => name === searchName);
  };

  const idOfTag = (nodes: FindTagsResultFragment[], searchName: string) => {
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

    if (!importTag) {
      createTagIfNotExists(IMPORT_TAG_ID, IMPORT_TAG_ID);
    } else {
      createTagIfNotExists(importTag, importTag);
    }

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
      console.log(`Processing entityKey: "${entityKey}"`);
      const { recordType, tag } = entityTypes[entityKey];
      const tagIds = [];
      if (!importTag) {
        tagIds.push(IMPORT_TAG_ID);
      } else {
        tagIds.push(importTag);
      }

      if (!nameInTags(existingTags, tag)) {
        const tagId = uuidv4();
        try {
          await createTagIfNotExists(tagId, tag);
          existingTags.push({ id: tagId, name: tag });
        } catch (e) {
          enqueueSnackbar(`Create new tag ${tag} failed: ` + e, {
            variant: "error",
          });
          allImportsSuccessful = false;
        }
      }
      tagIds.push(idOfTag(existingTags, tag));

      for (const entity of entities) {
        const { name, id } = entity;

        if (!name) {
          console.warn(`Skipping empty name for ${entityKey}`);
          continue;
        }

        try {
          setStatus(`Importing ${recordType}: ${name}`);
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

          // Fortschritt aktualisieren
          processedEntities += 1;
          setProgress((processedEntities / totalEntities) * 100); // Fortschritt als Prozentsatz
        } catch (error) {
          console.error(`Error creating record "${recordType}"... ${name}`);
          allImportsSuccessful = false;
        }
      }
    }

    // Snackbar nur nach dem gesamten Import ausführen
    if (allImportsSuccessful) {
      enqueueSnackbar("Alle Entitäten wurden erfolgreich importiert.", {
        variant: "success",
      });
    } else {
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
          setProgress((processedRelations / totalRelations) * 100); // Fortschritt als Prozentsatz
        } catch (error) {
          console.error(
            `Error creating relationship "${relationshipType}" from ${fromId} to ${toIds.join(", ")}`
          );
          allImportsSuccessful = false;
        }
      }
    }

    // Snackbar for import status
    if (allImportsSuccessful) {
      enqueueSnackbar("All relationships were successfully imported.", {
        variant: "success",
      });
    } else {
      enqueueSnackbar(
        "There were errors importing some relationships. Please check.",
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
                  {alphabet.map((letter) => (
                    <MenuItem key={letter} value={letter}>
                      {letter}
                    </MenuItem>
                  ))}
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
                  {alphabet.map((letter) => (
                    <MenuItem key={letter} value={letter}>
                      {letter}
                    </MenuItem>
                  ))}
                </FullWidthSelect>
              </StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>
    </StyledTableContainer>
  );

  const renderActionArea = () => (
    <ButtonsContainer sx={{ mt: 2 }}>
      <ButtonWrapper>
        <ActionButton
          variant="contained"
          component="label"
          color="primary"
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
        <Typography color="textSecondary">
          {entitiesFile === null ? <T keyName="import_excel.no_file_selected" /> : entitiesFile.name}
        </Typography>
      </ButtonWrapper>

      <ButtonWrapper>
        <ActionButton
          variant="contained"
          color="secondary"
          onClick={handleValidationClick}
        >
          <T keyName="import_excel.check_inputs_button" />
        </ActionButton>
      </ButtonWrapper>

      <ButtonWrapper>
        <TextField
          id="importTag"
          label={<T keyName="import_excel.import_tag_label" />}
          name="importTag"
          variant="outlined"
          size="small"
          onChange={handleImportTagChange}
          value={importTag}
          sx={{ mb: 0.5, width: "200px" }}
        />
      </ButtonWrapper>

      <ButtonWrapper>
        <ActionButton
          variant="contained"
          color="primary"
          disabled={!entitiesFile || !valid}
          onClick={handleimportExcel}
        >
          <T keyName="import_excel.import_button" />
        </ActionButton>
      </ButtonWrapper>

      <ButtonWrapper>
        <ActionButton
          variant="contained"
          color="inherit"
          onClick={handleClearTable}
        >
          <T keyName="import_excel.reset_button" />
        </ActionButton>
      </ButtonWrapper>
    </ButtonsContainer>
  );

  const renderProgressArea = () => (
    <ProgressContainer>
      <LinearProgress variant="determinate" value={progress} />
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
        <Typography variant="body2">{status}</Typography>
        <Typography variant="body2">{progress.toFixed(1)}%</Typography>
      </Stack>
    </ProgressContainer>
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

        {progress > 0 && renderProgressArea()}
      </Box>
    </View>
  );
}
