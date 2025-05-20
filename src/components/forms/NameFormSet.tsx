import {
  TranslationInput,
  TextPropsFragment,
  useAddNameMutation,
  useDeleteNameMutation,
  useUpdateNameMutation,
  UpdateTextInput,
} from "../../generated/types";
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
  names: TextPropsFragment[];
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
        input: {  catalogEntryId, name },
      },
    });
    enqueueSnackbar("Name hinzugefügt.");
  };

  const handleOnUpdate = async (name: UpdateTextInput) => {
    await updateName({
      variables: {
        input: name
      },
    });
    enqueueSnackbar("Name aktualisiert.");
  };

  const handleOnDelete = async (textId: string) => {
    await deleteName({
      variables: {
        input: { textId },
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
