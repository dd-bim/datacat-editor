import {TranslationInput, TranslationPropsFragment, TranslationUpdateInput} from "../../generated/types";
import TranslationForm, {TranslationFormValues} from "./TranslationForm";
import React, {useState} from "react";
import {Dialog, TextFieldProps} from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import NewTranslationForm from "./NewTranslationForm";
import TranslateIcon from "@material-ui/icons/Translate";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";

export type TranslationFormSetProps = {
    label: string;
    translations: TranslationPropsFragment[];
    min?: number;
    onAdd(input: TranslationInput): void;
    onUpdate(input: TranslationUpdateInput): void;
    onDelete(translationId: string): void;
    TextFieldProps?: TextFieldProps;
};

const useStyle = makeStyles(() => ({
    buttonRow: {
        display: "flex",
        justifyContent: "flex-end"
    }
}));

export const sortByLanguage = ({language: a}: TranslationPropsFragment, {language: b}: TranslationPropsFragment) => {
    return a.languageTag.localeCompare(b.languageTag);
};
export default function TranslationFormSet(props: TranslationFormSetProps) {
    const {
        label,
        translations,
        min = 1,
        onAdd,
        onUpdate,
        onDelete,
        TextFieldProps
    } = props;
    const classes = useStyle();

    const [open, setOpen] = useState(false);

    const handleOnAdd = async (values: TranslationInput) => {
        await onAdd(values);
        setOpen(false);
    };

    const translationForms = [...translations]
        .sort(sortByLanguage)
        .map(translation => {
            const handleOnUpdate = ({value}: TranslationFormValues) => onUpdate({
                translationId: translation.id,
                value
            });

            const handleOnDelete = (translations.length > min)
                ? () => onDelete(translation.id)
                : undefined;

            return (
                <Grid item xs={12} key={translation.id}>
                    <TranslationForm
                        key={translation.id}
                        translation={translation}
                        onSubmit={handleOnUpdate}
                        onDelete={handleOnDelete}
                        TextFieldProps={TextFieldProps}
                    />
                </Grid>
            );
        });

    return (
        <div>
            <Grid container spacing={1}>
                {translationForms.length ? (
                    translationForms
                ): (
                    <Grid item xs={12} key="no-translation">
                        <Typography
                            variant="body2"
                            color="textSecondary"
                        >
                            Noch keine Übersetzung vorhanden.
                        </Typography>
                    </Grid>

                )}

                <Grid className={classes.buttonRow} item xs={12}>
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => setOpen(true)}
                        startIcon={<TranslateIcon/>}
                    >
                        Übersetzung hinzufügen
                    </Button>
                </Grid>
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Übersetzung hinzufügen</DialogTitle>
                <DialogContent>
                    <NewTranslationForm
                        languageFilter={{
                            excludeLanguageTags: translations.map(x => x.language.languageTag)
                        }}
                        onCancel={() => setOpen(false)}
                        onSubmit={handleOnAdd}
                        TextFieldProps={{label, ...TextFieldProps}}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};
