import {Controller, useForm} from "react-hook-form";
import TextField, {TextFieldProps} from "@material-ui/core/TextField";
import {defaultFormFieldOptions} from "../../hooks/useFormStyles";
import LanguageSelectField from "./LanugageSelectField";
import InlineButtonGroup from "./InlineButtonGroup";
import React, {FC, useEffect} from "react";
import {LanguageFilterInput, LanguagePropsFragment} from "../../generated/types";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        "& > *": {
            marginBottom: theme.spacing(1)
        }
    }
}));

type NewTranslationFormValues = {
    id: string
    languageTag: string
    value: string
}

type NewTranslationFormProps = {
    languageFilter?: LanguageFilterInput
    onCancel(): void
    onSubmit(values: NewTranslationFormValues): void
    TextFieldProps: Partial<Pick<TextFieldProps, 'label' & 'multiline' & 'rows' & 'maxRows'>>
}

const NewTranslationForm: FC<NewTranslationFormProps> = (props) => {
    const {
        languageFilter,
        onCancel,
        onSubmit,
        TextFieldProps
    } = props;
    const classes = useStyles();
    const {
        watch,
        register,
        control,
        setValue,
        setError,
        handleSubmit,
        errors,
        formState
    } = useForm<NewTranslationFormValues>({
        mode: "onChange",
        defaultValues: {id: "", languageTag: "", value: ""}
    });

    useEffect(() => {
        register({name: "id"});
        register({name: "languageTag"}, {required: true});
    }, [register])

    const lang = watch("languageTag");

    const onChange = (value: LanguagePropsFragment) => {
        if (value) {
            setValue("languageTag", value.languageTag, {shouldValidate: true, shouldDirty: true});
        } else {
            setError("languageTag", {message: "Bitte wählen Sie eine Sprache.", type: "required"});
        }
    };
    return (
        <form className={classes.root} onSubmit={handleSubmit(onSubmit)} lang={lang}>
            <LanguageSelectField
                filter={languageFilter}
                onChange={onChange}
                TextFieldProps={{
                    focused: true,
                    id: "languageTag",
                    required: true,
                    label: "Sprache",
                    helperText: "Sprache in der die Übersetzung angelegt wird."
                }}
            />
            <Controller
                control={control}
                name="value"
                error={!!errors.value}
                required={true}
                rules={{ required: true}}
                {...TextFieldProps}
                as={<TextField {...defaultFormFieldOptions}/>}
            />
            <div>
                <InlineButtonGroup
                    formState={formState}
                    onReset={onCancel}
                />
            </div>
        </form>
    );
}

export default NewTranslationForm;
