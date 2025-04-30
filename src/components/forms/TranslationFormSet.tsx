import {TranslationInput, TranslationPropsFragment, TranslationUpdateInput} from "../../generated/types";
import TranslationForm, {TranslationFormValues} from "./TranslationForm";
import React, {useState} from "react";
import {Dialog, TextFieldProps} from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import NewTranslationForm from "./NewTranslationForm";
import TranslateIcon from "@mui/icons-material/Translate";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { T } from "@tolgee/react";

// Replace makeStyles with styled component
const ButtonRowGrid = styled(Grid)({
    display: "flex",
    justifyContent: "flex-end"
});

export type TranslationFormSetProps = {
    label: string;
    translations: TranslationPropsFragment[];
    min?: number;
    onAdd(input: TranslationInput): void;
    onUpdate(input: TranslationUpdateInput): void;
    onDelete(translationId: string): void;
    TextFieldProps?: TextFieldProps;
};

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
                <Grid key={translation.id}>
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
                    <Grid key="no-translation">
                        <Typography
                            variant="body2"
                            color="textSecondary"
                        >
                            <T keyName="translation_form.no_translations" />
                        </Typography>
                    </Grid>

                )}

                <ButtonRowGrid>
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => setOpen(true)}
                        startIcon={<TranslateIcon/>}
                    >
                        <T keyName="translation_form.add_translation" />
                    </Button>
                </ButtonRowGrid>
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle><T keyName="translation_form.add_translation_title" /></DialogTitle>
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
