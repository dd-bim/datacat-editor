import {
  TranslationInput,
  TextPropsFragment,
  useAddDefinitionMutation,
  useDeleteDefinitionMutation,
  useUpdateDefinitionMutation,
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

export type DefinitionFormSetProps = {
  catalogEntryId: string;
  definitions: TextPropsFragment[];
  refetch: () => Promise<any>;
};

const DefinitionFormSet = (props: DefinitionFormSetProps) => {
  const { catalogEntryId, definitions, refetch } = props;

  const { enqueueSnackbar } = useSnackbar();
  const [addDefinition] = useAddDefinitionMutation();
  const [updateDefinition] = useUpdateDefinitionMutation();
  const [deleteDefinition] = useDeleteDefinitionMutation();

  const handleOnAdd = async (text: TranslationInput) => {
    await addDefinition({
      variables: {
        input: {  catalogEntryId, text },
      },
    });
    enqueueSnackbar("Definition hinzugefügt.");
    await refetch();
  };

  const handleOnUpdate = async (definition: UpdateTextInput) => {
    await updateDefinition({
      variables: {
        input: definition
      },
    });
    enqueueSnackbar("Definition aktualisiert.");
  };

  const handleOnDelete = async (textId: string) => {
    await deleteDefinition({
      variables: {
        input: { textId },
      },
    });
    enqueueSnackbar("Definition gelöscht.");
    await refetch();
  };

  return (
    <FormSet>
      <FormSetTitle>
        <b>
          <T keyName="definition.title" />
        </b>
      </FormSetTitle>
      <StyledFormSetDescription>
        <T keyName="definition.description" />
      </StyledFormSetDescription>
      
      <div style={{ marginBottom: "12px" }}></div>

      <TranslationFormSet
        label="Definition"
        translations={definitions}
        min={0}
        onAdd={handleOnAdd}
        onUpdate={handleOnUpdate}
        onDelete={handleOnDelete}
      />
    </FormSet>
  );
};

export default DefinitionFormSet;
