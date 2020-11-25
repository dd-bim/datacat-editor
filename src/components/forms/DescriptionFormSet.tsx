import React, {FC, useState} from "react";
import {Dialog, Typography} from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import NewTranslationForm from "./NewTranslationForm";
import Link from "@material-ui/core/Link";
import TranslateIcon from "@material-ui/icons/Translate";
import {FormSet, sortByLanguage} from "./FormSet";
import {
    TranslationInput,
    TranslationPropsFragment,
    TranslationUpdateInput,
    useAddDescriptionMutation,
    useDeleteDescriptionMutation,
    useUpdateDescriptionMutation
} from "../../generated/types";
import TranslationForm from "./TranslationForm";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {useSnackbar} from "notistack";

const useStyles = makeStyles(() => ({
    addButton: {
        textAlign: "right"
    }
}));

type DescriptionFormSetProps = {
    catalogEntryId: string,
    descriptions: TranslationPropsFragment[]
}

const DescriptionFormSet: FC<DescriptionFormSetProps> = (props) => {
    const {catalogEntryId, descriptions} = props;
    const classes = useStyles();

    const {enqueueSnackbar} = useSnackbar();

    const [open, setOpen] = useState(false);

    const [addDescription] = useAddDescriptionMutation();
    const [updateDescription] = useUpdateDescriptionMutation();
    const [deleteDescription] = useDeleteDescriptionMutation();
    const onSubmitNewDescription = async (values: TranslationInput) => {
        await addDescription({
            variables: {
                input: {catalogEntryId, description: {...values}}
            }
        });
        setOpen(false);
        enqueueSnackbar("Beschreibung hinzugefügt.");
    };

    const descriptionForms = [...descriptions]
        .sort(sortByLanguage)
        .map(translation => {
            const onSubmit = async (values: TranslationUpdateInput) => {
                await updateDescription({
                    variables: {
                        input: {
                            catalogEntryId,
                            description: {
                                translationId: translation.id, value: values.value
                            }
                        }
                    }
                });
                enqueueSnackbar("Beschreibung aktualisiert.");
            }
            const onDelete = async () => {
                await deleteDescription({
                    variables: {
                        input: {catalogEntryId, descriptionId: translation.id}
                    }
                });
                enqueueSnackbar("Beschreibung gelöscht.");
            }

            return (
                <TranslationForm
                    key={translation.id}
                    translation={translation}
                    onSubmit={onSubmit}
                    onDelete={onDelete}
                    TextFieldProps={{
                        multiline: true,
                        rowsMax: 10,
                    }}
                />
            );
        });

    if (!descriptionForms.length) {
        descriptionForms.push(
            <Typography key="no-translation" variant="body2" color="textSecondary">Kein Beschreibung
                vorhanden.</Typography>
        )
    }

    return (
        <FormSet
            title="Beschreibung"
            description="Charakterisiert das Konzept in Ausprägung und Anwendungskonzept näher."
        >
            {descriptionForms}

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Beschreibung hinzufügen..</DialogTitle>
                <DialogContent>
                    <NewTranslationForm
                        languageFilter={{
                            excludeLanguageTags: descriptions.map(x => x.language.languageTag)
                        }}
                        onCancel={() => setOpen(false)}
                        onSubmit={onSubmitNewDescription}
                        TextFieldProps={{
                            label: "Beschreibung",
                            multiline: true,
                            rows: 5
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Link
                className={classes.addButton}
                component="button"
                variant="body2"
                onClick={() => setOpen(true)}
            >
                <TranslateIcon
                    fontSize="inherit"/> {descriptionForms.length ? "Beschreibung übersetzen" : "Beschreibung hinzufügen"}
            </Link>
        </FormSet>
    );
};

export default DescriptionFormSet;
