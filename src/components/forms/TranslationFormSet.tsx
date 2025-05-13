import {TranslationInput, TranslationPropsFragment, TranslationUpdateInput} from "../../generated/types";
import TranslationForm, {TranslationFormValues} from "./TranslationForm";
import React, {useState} from "react";
import {Dialog, TextFieldProps, Stack, Box} from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import NewTranslationForm from "./NewTranslationForm";
import TranslateIcon from "@mui/icons-material/Translate";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { T } from "@tolgee/react";

// Ersatz für Grid in MUI v7
const ButtonContainer = styled(Box)({
    display: "flex",
    justifyContent: "flex-end",
    width: "100%"
});

// Container für das gesamte Formular
const FullWidthContainer = styled('div')({
    width: '100%',
    maxWidth: '100%',
});

// Styling für den Stack, der alle Übersetzungen enthält
const TranslationsStack = styled(Stack)({
    width: '100%',
    maxWidth: '100%',
});

// Container für einzelne Übersetzungen
const TranslationContainer = styled('div')({
    width: '100%',
    maxWidth: '100%',
    marginBottom: '8px',
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
                <TranslationContainer key={translation.id}>
                    <TranslationForm
                        key={translation.id}
                        translation={translation}
                        onSubmit={handleOnUpdate}
                        onDelete={handleOnDelete}
                        TextFieldProps={TextFieldProps}
                    />
                </TranslationContainer>
            );
        });

    return (
        <FullWidthContainer>
            <TranslationsStack spacing={1} direction="column">
                {translationForms.length ? (
                    translationForms
                ): (
                    <Box key="no-translation" width="100%">
                        <Typography
                            variant="body2"
                            color="textSecondary"
                        >
                            <T keyName="translation_form.no_translations" />
                        </Typography>
                    </Box>
                )}

                <ButtonContainer>
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => setOpen(true)}
                        startIcon={<TranslateIcon/>}
                        sx={{ marginLeft: 'auto' }} // Button nach rechts schieben
                    >
                        <T keyName="translation_form.add_translation" />
                    </Button>
                </ButtonContainer>
            </TranslationsStack>

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
        </FullWidthContainer>
    );
};
