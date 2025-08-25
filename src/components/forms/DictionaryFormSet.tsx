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
    update: (cache) => {
      // Optimierte Cache-Updates
      cache.evict({ fieldName: 'findDictionaries' });
      cache.gc();
    }
  });
  const [deleteDictionary] = useDeleteRelationshipMutation({
    errorPolicy: 'all',
    update: (cache) => {
      // Optimierte Cache-Updates
      cache.evict({ fieldName: 'findDictionaries' });
      cache.gc();
    }
  });
  const [currentDictionaryId, setCurrentDictionaryId] = useState(initialDictionaryId);

  // Alle Dictionaries laden mit optimierter Caching-Strategie
  const { data, loading } = useFindDictionariesQuery({ 
    variables: { input: {} },
    fetchPolicy: 'cache-first', // Verwende Cache wenn möglich
    errorPolicy: 'all'
  });
  const dictionaries = data?.findDictionaries?.nodes ?? [];

  const {
    control,
    reset
  } = useForm<DictionaryFormValues>({
    mode: "onChange",
    defaultValues: { selectedDictionary: currentDictionaryId },
  });

  useEffect(() => {
    reset({ selectedDictionary: currentDictionaryId });
  }, [currentDictionaryId, reset]);

  const handleChange = async (
    e: SelectChangeEvent<string>,
    field: { onChange: (value: any) => void }
  ) => {
    const newDictionaryId = e.target.value;
    field.onChange(newDictionaryId);
    
    // Sofort den lokalen State aktualisieren für bessere UX
    setCurrentDictionaryId(newDictionaryId);
    
    // Sofortige Bestätigung anzeigen
    enqueueSnackbar(<T keyName="update.updating">Aktualisiere Dictionary...</T>, { variant: 'info' });

    try {
      // Operationen parallel ausführen statt sequenziell
      const deletePromise = currentDictionaryId 
        ? deleteDictionary({
            variables: {
              input: { fromId: catalogEntryId, toId: currentDictionaryId, relationshipType: RelationshipRecordType.Dictionary }
            }
          })
        : Promise.resolve();

      const createPromise = setDictionary({
        variables: {
          input: { fromId: catalogEntryId, toIds: [newDictionaryId], relationshipType: RelationshipRecordType.Dictionary }
        }
      });

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
              value={field.value}
              onChange={e => handleChange(e, field)}
              size="small"
              sx={{ minWidth: 180 }}
              disabled={loading}
            >
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
