import React, { FC } from "react";
import FormSet, { FormSetDescription, FormSetTitle } from "./FormSet";
import {
  TranslationInput,
  TranslationPropsFragment,
  TranslationUpdateInput,
  useAddDescriptionMutation,
  useDeleteDescriptionMutation,
  useUpdateDescriptionMutation,
} from "../../generated/types";
import { useSnackbar } from "notistack";
import TranslationFormSet from "./TranslationFormSet";
import { styled } from "@mui/material/styles";
import { T } from "@tolgee/react";

// Replace makeStyles with styled component
const StyledFormSetDescription = styled(FormSetDescription)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

type DescriptionFormSetProps = {
  catalogEntryId: string;
  descriptions: TranslationPropsFragment[];
};

const DescriptionFormSet: FC<DescriptionFormSetProps> = (props) => {
  const { catalogEntryId, descriptions } = props;

  const { enqueueSnackbar } = useSnackbar();
  const [addDescription] = useAddDescriptionMutation();
  const [updateDescription] = useUpdateDescriptionMutation();
  const [deleteDescription] = useDeleteDescriptionMutation();

  const handleOnAdd = async (description: TranslationInput) => {
    await addDescription({
      variables: {
        input: { catalogEntryId, description },
      },
    });
    enqueueSnackbar("Beschreibung hinzugefügt.");
  };

  const handleOnUpdate = async (description: TranslationUpdateInput) => {
    await updateDescription({
      variables: {
        input: { catalogEntryId, description },
      },
    });
    enqueueSnackbar("Beschreibung aktualisiert.");
  };

  const handleOnDelete = async (descriptionId: string) => {
    await deleteDescription({
      variables: {
        input: { catalogEntryId, descriptionId },
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
        }}
      />
    </FormSet>
  );
};

export default DescriptionFormSet;
