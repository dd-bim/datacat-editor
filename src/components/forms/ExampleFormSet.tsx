import {
  TranslationInput,
  TextPropsFragment,
  useAddExampleMutation,
  useDeleteExampleMutation,
  useUpdateExampleMutation,
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

export type ExampleFormSetProps = {
  catalogEntryId: string;
  examples: TextPropsFragment[];
};

const ExampleFormSet = (props: ExampleFormSetProps) => {
  const { catalogEntryId, examples } = props;

  const { enqueueSnackbar } = useSnackbar();
  const [addExample] = useAddExampleMutation();
  const [updateExample] = useUpdateExampleMutation();
  const [deleteExample] = useDeleteExampleMutation();

  const handleOnAdd = async (name: TranslationInput) => {
    await addExample({
      variables: {
        input: {  catalogEntryId, name },
      },
    });
    enqueueSnackbar("Beispiel hinzugefügt.");
  };

  const handleOnUpdate = async (example: UpdateTextInput) => {
    await updateExample({
      variables: {
        input: example
      },
    });
    enqueueSnackbar("Beispiel aktualisiert.");
  };

  const handleOnDelete = async (textId: string) => {
    await deleteExample({
      variables: {
        input: { textId },
      },
    });
    enqueueSnackbar("Beispiel gelöscht.");
  };

  return (
    <FormSet>
      <FormSetTitle>
        <b>
          <T keyName="example.title" />
        </b>
      </FormSetTitle>
      <StyledFormSetDescription>
        <T keyName="example.description" />
      </StyledFormSetDescription>
      
      <div style={{ marginBottom: "12px" }}></div>

      <TranslationFormSet
        label="Beipsiel"
        translations={examples}
        onAdd={handleOnAdd}
        onUpdate={handleOnUpdate}
        onDelete={handleOnDelete}
      />
    </FormSet>
  );
};

export default ExampleFormSet;
