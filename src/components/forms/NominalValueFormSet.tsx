import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import FormSet, { FormSetDescription, FormSetTitle } from "./FormSet";
import TextField from "@mui/material/TextField";
import { defaultFormFieldOptions } from "../../hooks/useFormStyles";
import { styled } from "@mui/material/styles";
import InlineButtonGroup from "./InlineButtonGroup";
import { ClickAwayListener } from "@mui/material";
import { T } from "@tolgee/react";
import { useMutation } from "@apollo/client/react";
import {
  UpdateNominalValueDocument,
} from "../../generated/graphql";
import {useSnackbar} from "notistack";

// Replace makeStyles with styled component
const StyledFormSetDescription = styled(FormSetDescription)(({ theme }) => ({
  marginBottom: theme.spacing(1)
}));

// Replace makeStyles with styled component
const FormContainer = styled('form')(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  "& > *": {
    marginRight: theme.spacing(1),
  },
}));

type NominalValueFormValues = {
  catalogEntryId: string;
  nominalValue: string;
};

export type NominalValueFormProps = {
  catalogEntryId: string;
  nominalValue?: string;
  refetch: () => Promise<any>;
};

const NominalValueForm = (props: NominalValueFormProps) => {
  const { catalogEntryId, nominalValue, refetch } = props;
  const [isEditMode, setIsEditMode] = useState(false);
  const {enqueueSnackbar} = useSnackbar();
  const {
    control,
    handleSubmit,
    reset,
    formState,
  } = useForm<NominalValueFormValues>({
    mode: "onChange",
    defaultValues: {
      catalogEntryId,
      nominalValue: nominalValue || "",
    },
  });
  const { isDirty } = formState;
  const [updateNominalValue] = useMutation(UpdateNominalValueDocument);

  const onEdit = () => {
    setIsEditMode(true);
  };

  const onReset = () => {
    setIsEditMode(false);
    reset({
      catalogEntryId,
      nominalValue: nominalValue ?? "",
    });
  };

  const onSave = async (values: NominalValueFormValues) => {
    await updateNominalValue({
      variables: {
        input: {
          catalogEntryId: values.catalogEntryId,
          nominalValue: values.nominalValue,
        },
      },
    });
    setIsEditMode(false);
    enqueueSnackbar("Nominalwert aktualisiert.");
    await refetch();
  };

  const onClickAway = () => {
    if (isEditMode && !isDirty) {
      onReset();
    }
  };

  return (
    <FormSet>
      <FormSetTitle>
        <b>
          <T keyName="value.nominalValue" />
        </b>
      </FormSetTitle>
      <StyledFormSetDescription>
        <T keyName="value.nominalValue_helper" />
      </StyledFormSetDescription>
      <div style={{ marginBottom: "12px" }}></div>
      <ClickAwayListener onClickAway={onClickAway}>
        <FormContainer onSubmit={handleSubmit(onSave)}>
          <Controller
            control={control}
            name="nominalValue"
            rules={{ required: true }} // Falls eine Validierung nötig ist
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                id="nominalValue" // ✅ Hier setzen
                label={<T keyName="value.nominalValue" />}
                error={!!fieldState.error}
                fullWidth
                InputProps={{
                  onFocus: !isEditMode ? onEdit : undefined,
                }}
                {...defaultFormFieldOptions}
              />
            )}
          />
          {isEditMode && (
            <InlineButtonGroup formState={formState} onReset={onReset} />
          )}
        </FormContainer>
      </ClickAwayListener>
    </FormSet>
  );
};

export default NominalValueForm;
