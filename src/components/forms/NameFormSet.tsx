import { useMutation } from "@apollo/client/react";
import {
  TranslationInput,
  TextPropsFragment,
  AddNameDocument,
  DeleteNameDocument,
  UpdateNameDocument,
  UpdateTextInput,
} from "../../generated/graphql";
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
  refetch: () => Promise<any>;
};

const NameFormSet = (props: NameFormSetProps) => {
  const { catalogEntryId, names, refetch } = props;

  const { enqueueSnackbar } = useSnackbar();
  const [addName] = useMutation(AddNameDocument);
  const [updateName] = useMutation(UpdateNameDocument);
  const [deleteName] = useMutation(DeleteNameDocument);

  const handleOnAdd = async (text: TranslationInput) => {
    await addName({
      variables: {
        input: {  catalogEntryId, text },
      },
    });
    enqueueSnackbar("Name hinzugefügt.");
    await refetch();
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
    await refetch();
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
