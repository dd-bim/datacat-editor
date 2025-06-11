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

  const [setDictionary] = useCreateRelationshipMutation();
  const [deleteDictionary] = useDeleteRelationshipMutation();
  const [currentDictionaryId, setCurrentDictionaryId] = useState(initialDictionaryId);

  // Alle Dictionaries laden
  const { data, loading } = useFindDictionariesQuery({ variables: { input: {} } });
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

    // Alte Beziehung löschen
    if (currentDictionaryId) {
      await deleteDictionary({
        variables: {
          input: { fromId: catalogEntryId, toId: currentDictionaryId, relationshipType: RelationshipRecordType.Dictionary }
        }
      });
    }

    // Neue Beziehung anlegen
    await setDictionary({
      variables: {
        input: { fromId: catalogEntryId, toIds: [newDictionaryId], relationshipType: RelationshipRecordType.Dictionary }
      }
    });

    setCurrentDictionaryId(newDictionaryId);
    enqueueSnackbar(<T keyName="update.update_success"/>);
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
