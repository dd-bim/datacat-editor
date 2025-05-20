import { FC } from "react";
import FormSet, { FormSetDescription, FormSetTitle } from "./FormSet";
import {
  TranslationInput,
  TextPropsFragment,
  UpdateTextInput,
  useAddDescriptionMutation,
  useDeleteDescriptionMutation,
  useUpdateDescriptionMutation,
} from "../../generated/types";
import { useSnackbar } from "notistack";
import TranslationFormSet from "./TranslationFormSet";
import { styled } from "@mui/material/styles";
import { T } from "@tolgee/react";
import { Box } from "@mui/material";

// Replace makeStyles with styled component
const StyledFormSetDescription = styled(FormSetDescription)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

// Container for the description form to ensure proper width
const DescriptionFormContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  '& .MuiFormControl-root': {
    width: '100%',
  },
  '& .MuiInputBase-root': {
    width: '100%',
  },
  // Make the translation form fields wider to utilize available space
  '& .MuiGrid-container': {
    width: '100%',
  },
  // Ensure the text field has enough space for the button
  '& .MuiGrid-item': {
    '&:first-of-type': {
      flex: 1, // Take all available space
      minWidth: '60%', // Ensure minimum width
    }
  }
}));

type DescriptionFormSetProps = {
  catalogEntryId: string;
  descriptions: TextPropsFragment[];
};

const DescriptionFormSet: FC<DescriptionFormSetProps> = (props) => {
  const { catalogEntryId, descriptions } = props;

  const { enqueueSnackbar } = useSnackbar();
  const [addDescription] = useAddDescriptionMutation();
  const [updateDescription] = useUpdateDescriptionMutation();
  const [deleteDescription] = useDeleteDescriptionMutation();

  const handleOnAdd = async (name: TranslationInput) => {
    await addDescription({
      variables: {
        input: { catalogEntryId, name },
      },
    });
    enqueueSnackbar("Beschreibung hinzugefügt.");
  };

  const handleOnUpdate = async (description: UpdateTextInput) => {
    await updateDescription({
      variables: {
        input: description,
      },
    });
    enqueueSnackbar("Beschreibung aktualisiert.");
  };

  const handleOnDelete = async (textId: string) => {
    await deleteDescription({
      variables: {
        input: { textId },
      },
    });
    enqueueSnackbar("Beschreibung gelöscht.");
  };

  return (
    <FormSet>
      <FormSetTitle>
        <b>
          <T keyName={"description.title"} />
        </b>
      </FormSetTitle>
      <StyledFormSetDescription>
        <T keyName={"description.description"} />
      </StyledFormSetDescription>

      <div style={{ marginBottom: "12px" }}></div>

      <DescriptionFormContainer>
        <TranslationFormSet
          label="Beschreibung"
          translations={descriptions}
          min={0}
          onAdd={handleOnAdd}
          onUpdate={handleOnUpdate}
          onDelete={handleOnDelete}
          TextFieldProps={{
            multiline: true,
            maxRows: 10,
            fullWidth: true, // Ensure the text field takes full width
            sx: { flexGrow: 1 } // Grow to fill available space
          }}
          // The width is already handled by DescriptionFormContainer
        />
      </DescriptionFormContainer>
    </FormSet>
  );
};

export default DescriptionFormSet;
