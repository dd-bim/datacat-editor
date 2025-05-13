import {
  TranslationInput,
  TranslationPropsFragment,
  TranslationUpdateInput,
  useAddNameMutation,
  useDeleteNameMutation,
  useUpdateNameMutation,
} from "../../generated/types";
import React from "react";
import FormSet, { FormSetDescription, FormSetTitle } from "./FormSet";
import { useSnackbar } from "notistack";
import TranslationFormSet from "./TranslationFormSet";
import { styled } from "@mui/material/styles";
import { T } from "@tolgee/react";

// Replace makeStyles with styled component
const StyledFormSetDescription = styled(FormSetDescription)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

export type NameFormSetProps = {
  catalogEntryId: string;
  names: TranslationPropsFragment[];
};

const NameFormSet = (props: NameFormSetProps) => {
  const { catalogEntryId, names } = props;

  const { enqueueSnackbar } = useSnackbar();
  const [addName] = useAddNameMutation();
  const [updateName] = useUpdateNameMutation();
  const [deleteName] = useDeleteNameMutation();

  const handleOnAdd = async (name: TranslationInput) => {
    await addName({
      variables: {
        input: { catalogEntryId, name },
      },
    });
    enqueueSnackbar("Name hinzugefügt.");
  };

  const handleOnUpdate = async (name: TranslationUpdateInput) => {
    await updateName({
      variables: {
        input: { catalogEntryId, name },
      },
    });
    enqueueSnackbar("Name aktualisiert.");
  };

  const handleOnDelete = async (nameId: string) => {
    await deleteName({
      variables: {
        input: { catalogEntryId, nameId },
      },
    });
    enqueueSnackbar("Name gelöscht.");
  };

  return (
    <FormSet>
      <FormSetTitle>
        <b>
          <T keyName="name.title" />
        </b>
      </FormSetTitle>
      <StyledFormSetDescription>
        <T keyName="name.description" />
      </StyledFormSetDescription>
      
      <div style={{ marginBottom: "12px" }}></div>

      <TranslationFormSet
        label="Bezeichnung"
        translations={names}
        onAdd={handleOnAdd}
        onUpdate={handleOnUpdate}
        onDelete={handleOnDelete}
      />
    </FormSet>
  );
};

export default NameFormSet;
