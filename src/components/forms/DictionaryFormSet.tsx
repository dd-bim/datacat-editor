import FormSet, { FormSetTitle } from "./FormSet";
import { FC } from "react";
import { useEffect } from "react";
import {
  RelationshipRecordType,
  useCreateRelationshipMutation,
  useDeleteRelationshipMutation
} from "../../generated/types";
import { useSnackbar } from "notistack";
import { styled } from "@mui/material/styles";
import { T } from "@tolgee/react";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useFindDictionariesQuery } from "../../generated/types";
import React, { useState } from "react";

type DictionaryFormSetProps = {
  catalogEntryId: string;
  dictionaryId: string;
};

type DictionaryFormValues = {
  selectedDictionary: string;
};

const FormContainer = styled('form')(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  "& > *": {
    marginRight: theme.spacing(1),
  },
}));

const DictionaryFormSet: FC<DictionaryFormSetProps> = (props) => {
  const { catalogEntryId, dictionaryId: initialDictionaryId } = props;
  const { enqueueSnackbar } = useSnackbar();

  const [setDictionary] = useCreateRelationshipMutation({
    errorPolicy: 'all',
    // Remove aggressive cache updates that can cause loops
    // Let Apollo handle cache updates automatically
  });
  const [deleteDictionary] = useDeleteRelationshipMutation({
    errorPolicy: 'all',
    // Remove aggressive cache updates that can cause loops
    // Let Apollo handle cache updates automatically
  });
  const [currentDictionaryId, setCurrentDictionaryId] = useState(initialDictionaryId);

  // Alle Dictionaries laden mit optimierter Caching-Strategie
  const { data, loading } = useFindDictionariesQuery({ 
    variables: { input: {} },
    fetchPolicy: 'cache-first', // Verwende Cache wenn möglich
    errorPolicy: 'all'
  });
  const dictionaries = data?.findDictionaries?.nodes ?? [];

  // Validiere ob die aktuelle Dictionary-ID noch verfügbar ist
  const validDictionaryId = React.useMemo(() => {
    // Während des Ladens immer leeren Wert zurückgeben
    if (loading) return "";
    
    if (!currentDictionaryId) return "";
    
    // Prüfe ob die ID in den verfügbaren Dictionaries existiert
    const isValid = dictionaries.some(dict => dict.id === currentDictionaryId);
    
    if (!isValid && dictionaries.length > 0) {
      console.warn(`Dictionary ID ${currentDictionaryId} nicht gefunden, fallback auf leeren Wert`);
      return "";
    }
    
    return currentDictionaryId;
  }, [currentDictionaryId, dictionaries, loading]);

  const {
    control,
    reset
  } = useForm<DictionaryFormValues>({
    mode: "onChange",
    defaultValues: { selectedDictionary: validDictionaryId },
  });

  useEffect(() => {
    reset({ selectedDictionary: validDictionaryId });
  }, [validDictionaryId, reset]);

  const handleChange = async (
    e: SelectChangeEvent<string>,
    field: { onChange: (value: any) => void }
  ) => {
    const newDictionaryId = e.target.value;
    field.onChange(newDictionaryId);
    
    // Sofort den lokalen State aktualisieren für bessere UX
    setCurrentDictionaryId(newDictionaryId);
    
    // Nur zeigen wenn wirklich eine Änderung stattfindet
    if (newDictionaryId !== validDictionaryId) {
      enqueueSnackbar(<T keyName="update.updating">Aktualisiere Dictionary...</T>, { variant: 'info' });
    }

    try {
      // Operationen parallel ausführen statt sequenziell
      const deletePromise = validDictionaryId 
        ? deleteDictionary({
            variables: {
              input: { fromId: catalogEntryId, toId: validDictionaryId, relationshipType: RelationshipRecordType.Dictionary }
            }
          })
        : Promise.resolve();

      const createPromise = newDictionaryId ? setDictionary({
        variables: {
          input: { fromId: catalogEntryId, toIds: [newDictionaryId], relationshipType: RelationshipRecordType.Dictionary }
        }
      }) : Promise.resolve();

      // Auf beide Operationen parallel warten
      await Promise.all([deletePromise, createPromise]);
      
      // Erfolgs-Nachricht nach Abschluss
      enqueueSnackbar(<T keyName="update.update_success"/>, { variant: 'success' });
    } catch (error) {
      console.error('Error updating dictionary relationship:', error);
      // Bei Fehler zurücksetzen
      setCurrentDictionaryId(currentDictionaryId);
      field.onChange(currentDictionaryId);
      enqueueSnackbar('Fehler beim Aktualisieren der Dictionary-Zuordnung', { variant: 'error' });
    }
  };

  return (
    <FormSet>
      <FormContainer>
        <FormSetTitle sx={{ mr: 1 }}>
          <b>
            <T keyName="dictionary.title" />
          </b>
        </FormSetTitle>
        <Controller
          name="selectedDictionary"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              value={validDictionaryId} // Verwende validierte ID statt field.value
              onChange={e => handleChange(e, field)}
              size="small"
              sx={{ minWidth: 180 }}
              disabled={loading}
            >
              {/* Leere Option für "kein Dictionary" */}
              <MenuItem value="">
                <em><T keyName="dictionary.no_dictionary" defaultValue="Kein Dictionary" /></em>
              </MenuItem>
              {dictionaries.map(dict => (
                <MenuItem key={dict.id} value={dict.id}>
                  {typeof dict.name === "string"
                    ? dict.name
                    : dict.name?.texts?.[0]?.text ?? dict.id}
                </MenuItem>
              ))}
            </Select>
          )}
        />
      </FormContainer>
    </FormSet>
  );
};

export default DictionaryFormSet;
