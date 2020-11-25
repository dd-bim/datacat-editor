import {
    TranslationInput,
    TranslationPropsFragment,
    TranslationUpdateInput,
    useAddNameMutation,
    useDeleteNameMutation,
    useUpdateNameMutation
} from "../../generated/types";
import TranslationForm from "./TranslationForm";
import React, {FC, useState} from "react";
import {Dialog} from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import NewTranslationForm from "./NewTranslationForm";
import Link from "@material-ui/core/Link";
import TranslateIcon from "@material-ui/icons/Translate";
import {FormSet, sortByLanguage, useFormSetStyles} from "./FormSet";
import {useSnackbar} from "notistack";

type NameFormSetProps = {
    catalogEntryId: string,
    names: TranslationPropsFragment[]
}

const NameFormSet: FC<NameFormSetProps> = (props) => {
    const {catalogEntryId, names} = props;
    const classes = useFormSetStyles();

    const {enqueueSnackbar} = useSnackbar();

    const [open, setOpen] = useState(false);

    const [addName] = useAddNameMutation();
    const [updateName] = useUpdateNameMutation();
    const [deleteName] = useDeleteNameMutation();

    const onSubmitNewName = async (values: TranslationInput) => {
        await addName({
            variables: {
                input: {catalogEntryId, name: {...values}}
            }
        });
        setOpen(false);
        enqueueSnackbar("Name hinzugefügt.");
    };
    const nameForms = [...names]
        .sort(sortByLanguage)
        .map(translation => {
            const onSubmit = async (values: TranslationUpdateInput) => {
                await updateName({
                    variables: {
                        input: {
                            catalogEntryId, name: {id: translation.id, value: values.value}
                        }
                    }
                });
                enqueueSnackbar("Name aktualisiert.");
            }
            const onDelete = async () => {
                await deleteName({
                    variables: {
                        input: {catalogEntryId, nameId: translation.id}
                    }
                });
                enqueueSnackbar("Name gelöscht.")
            }

            return (
                <TranslationForm
                    key={translation.id}
                    translation={translation}
                    onSubmit={onSubmit}
                    onDelete={names.length > 1 ? onDelete : undefined}
                />
            );
        });

    return (
        <FormSet
            title="Name"
            description="Identifiziert das Konzept in der jeweiligen Sprache."
        >
            {nameForms}

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Namen hinzufügen..</DialogTitle>
                <DialogContent>
                    <NewTranslationForm
                        languageFilter={{
                            excludeLanguageTags: names.map(x => x.language.languageTag)
                        }}
                        onCancel={() => setOpen(false)}
                        onSubmit={onSubmitNewName}
                        TextFieldProps={{
                            label: "Name"
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
                <TranslateIcon fontSize="inherit"/> Namen übersetzen
            </Link>
        </FormSet>
    );
};

export  default NameFormSet;
