import React, {FC} from "react";
import FormSet, {FormSetDescription, FormSetTitle} from "./FormSet";
import {
    TranslationInput,
    TranslationPropsFragment,
    TranslationUpdateInput,
    useAddDescriptionMutation,
    useDeleteDescriptionMutation,
    useUpdateDescriptionMutation
} from "../../generated/types";
import {useSnackbar} from "notistack";
import TranslationFormSet from "./TranslationFormSet";
import makeStyles from "@material-ui/core/styles/makeStyles";

type DescriptionFormSetProps = {
    catalogEntryId: string,
    descriptions: TranslationPropsFragment[]
}

const useStyles = makeStyles(theme => ({
    description: {
        marginBottom: theme.spacing(1)
    }
}));

const DescriptionFormSet: FC<DescriptionFormSetProps> = (props) => {
    const {catalogEntryId, descriptions} = props;
    const classes = useStyles();

    const {enqueueSnackbar} = useSnackbar();
    const [addDescription] = useAddDescriptionMutation();
    const [updateDescription] = useUpdateDescriptionMutation();
    const [deleteDescription] = useDeleteDescriptionMutation();

    const handleOnAdd = async (description: TranslationInput) => {
        await addDescription({
            variables: {
                input: {catalogEntryId, description}
            }
        });
        enqueueSnackbar("Name hinzugefügt.");
    };

    const handleOnUpdate = async (description: TranslationUpdateInput) => {
        await updateDescription({
            variables: {
                input: {catalogEntryId, description}
            }
        });
        enqueueSnackbar("Name aktualisiert.");
    };

    const handleOnDelete = async (descriptionId: string) => {
        await deleteDescription({
            variables: {
                input: {catalogEntryId, descriptionId}
            }
        });
        enqueueSnackbar("Name gelöscht.")
    };

    return (
        <FormSet>
            <FormSetTitle>Beschreibung</FormSetTitle>
            <FormSetDescription className={classes.description}>
                Charakterisiert das Konzept in Ausprägung und Anwendungskonzept näher.
            </FormSetDescription>
            <TranslationFormSet
                label="Beschreibung"
                translations={descriptions}
                min={0}
                onAdd={handleOnAdd}
                onUpdate={handleOnUpdate}
                onDelete={handleOnDelete}
                TextFieldProps={{
                    multiline: true,
                    rowsMax: 10,
                }}
            />
        </FormSet>
    );
};

export default DescriptionFormSet;
