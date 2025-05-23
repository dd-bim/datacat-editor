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
  refetch: () => Promise<any>;
};

const ExampleFormSet = (props: ExampleFormSetProps) => {
  const { catalogEntryId, examples, refetch } = props;

  const { enqueueSnackbar } = useSnackbar();
  const [addExample] = useAddExampleMutation();
  const [updateExample] = useUpdateExampleMutation();
  const [deleteExample] = useDeleteExampleMutation();

  const handleOnAdd = async (text: TranslationInput) => {
    await addExample({
      variables: {
        input: {  catalogEntryId, text },
      },
    });
    enqueueSnackbar("Beispiel hinzugefügt.");
    await refetch();
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
    await refetch();
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
        min={0}
        onAdd={handleOnAdd}
        onUpdate={handleOnUpdate}
        onDelete={handleOnDelete}
      />
    </FormSet>
  );
};

export default ExampleFormSet;
