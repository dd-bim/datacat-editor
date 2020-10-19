import React, {FC, useEffect, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import TextField, {TextFieldProps} from "@material-ui/core/TextField";
import {defaultFormFieldOptions} from "../../hooks/useFormStyles";
import {makeStyles} from "@material-ui/core/styles";
import InlineButtonGroup from "./InlineButtonGroup";
import {ClickAwayListener} from "@material-ui/core";
import {TranslationPropsFragment} from "../../generated/types";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "end",
        "& > *": {
            marginBottom: theme.spacing(1)
        }
    }
}));

type TranslationFormValues = {
    value: string
}

type TranslationFormProps = {
    translation: TranslationPropsFragment,
    onSubmit(values: TranslationFormValues): void
    onDelete?(): void
    TextFieldProps?: Partial<Omit<TextFieldProps, "name" | "onFocus">>
}

const TranslationForm: FC<TranslationFormProps> = (props) => {
    const {
        translation,
        onSubmit,
        onDelete,
        TextFieldProps
    } = props;
    const defaultValues = {
        ...translation
    }
    const classes = useStyles();
    const [isEditMode, setIsEditMode] = useState(false);
    const {
        control,
        handleSubmit,
        errors,
        reset,
        formState
    } = useForm<TranslationFormValues>({
        mode: "onChange",
        defaultValues
    });

    const [submittedData, setSubmittedData] = useState<TranslationFormValues>({...defaultValues});

    const onEdit = () => {
        setIsEditMode(true);
    };

    const onReset = () => {
        setIsEditMode(false);
        reset()
    };

    const onSave = async (values: TranslationFormValues) => {
        setSubmittedData(values);
        await onSubmit(values);
        setIsEditMode(false);
        reset();
    };

    const onClickAway = () => {
        if (!formState.isDirty) {
            setIsEditMode(false);
            reset();
        }
    };

    const textFieldProps = {
        id: `${translation.id}-value`,
        label: `${translation.language.displayLanguage} / ${translation.language.displayCountry}`,
        required: true,
        // variant: isEditMode ? "outlined" : "standard",
        InputProps: {
            lang: translation.language.languageTag,
            readOnly: !isEditMode,
            onFocus: !isEditMode ? onEdit : undefined
        }
    };

    useEffect(() => {
        if (formState.isSubmitSuccessful) {
            reset({...submittedData});
        }
    }, [formState.isSubmitSuccessful, submittedData, reset]);

    return (
        <ClickAwayListener onClickAway={onClickAway}>
            <form className={classes.root} onSubmit={handleSubmit(onSave)}>
                <Controller
                    name="value"
                    control={control}
                    error={!!errors.value}
                    rules={{required: true}}
                    {...TextFieldProps}
                    {...textFieldProps}
                    as={<TextField {...defaultFormFieldOptions}/>}
                />
                {isEditMode && (
                        <InlineButtonGroup
                            formState={formState}
                            onReset={onReset}
                            onDelete={onDelete}
                        />
                )}
            </form>
        </ClickAwayListener>
    );
}

export default TranslationForm;
