import React, {FC, useState} from "react";
import {Controller, FormProvider, useForm} from "react-hook-form";
import TextField from "@material-ui/core/TextField";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import useFormStyles, {defaultFormFieldOptions} from "../../hooks/useFormStyles";
import ConceptNameField from "./ConceptNameField";
import useDebounce from "../../hooks/useDebounce";
import {FilterInput, useFindConceptQuery} from "../../generated/types";

export type EntryFormValues = {
    name: string,
    description: string,
    versionId: string,
    versionDate: string
}

type EntryFormProps = {
    defaultValues?: Partial<EntryFormValues>
    onSubmit?(input: EntryFormValues): void
    duplicateFilterInput?: FilterInput
}

const EntryForm: FC<EntryFormProps> = (props) => {
    const classes = useFormStyles();
    const {
        defaultValues,
        onSubmit,
        duplicateFilterInput
    } = props
    const formMethods = useForm<EntryFormValues>({
        mode: "onChange",
        defaultValues
    });
    const {
        errors,
        handleSubmit,
        reset,
        formState: {
            isDirty,
            isValid
        }
    } = formMethods;

    const [dirtyNameValue, setDirtyNameValue] = useState("");
    const debouncedDirtyNameValue = useDebounce(dirtyNameValue, 500);
    const findPossibleDuplicates = duplicateFilterInput && debouncedDirtyNameValue;
    const {data} = useFindConceptQuery({
        skip: !findPossibleDuplicates,
        variables: {
            input: {
                query: debouncedDirtyNameValue,
                ...duplicateFilterInput
            }
        }
    });
    const dupes = data?.search.nodes ?? [];

    const handleOnNameChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setDirtyNameValue(e.target.value);
    }

    const handleOnCancel = () => {
        reset(defaultValues, {isDirty: false});
        setDirtyNameValue("");
    }

    const handleOnSubmit = (values: EntryFormValues) => onSubmit?.(values);

    return (
        <FormProvider {...formMethods}>
            <form className={classes.form} onSubmit={handleSubmit(handleOnSubmit)}>
                <ConceptNameField
                    {...defaultFormFieldOptions}
                    id="name"
                    name="name"
                    label="Name"
                    helperText={"Der Name des Konzepts bzw. deren Synonyme abgetrennt durch Semikolon. Mögliche Duplikate werden an dieser Bezeichnung ermittelt."}
                    errorText={"Der Name ist für jedes Konzept zwingend anzugeben."}
                    required={true}
                    onChange={handleOnNameChange}
                    dupes={dupes}
                />

                <Controller
                    id="description"
                    name="description"
                    label="Beschreibung"
                    helperText={"Nutzen Sie die Beschreibung um das Konzept, seine Anwendung und den Kontext der Anwendung näher zu erläutern."}
                    error={errors.description}
                    as={<TextField {...defaultFormFieldOptions} />}
                />

                <Controller
                    id="versionId"
                    name="versionId"
                    label="ID der Version"
                    helperText={"Die aktuelle Versions-ID dieses Konzepts. Die Version kann je Anwendungsfeld individuell bestimmt und formatiert werden."}
                    error={errors.versionId}
                    as={<TextField {...defaultFormFieldOptions} />}
                />

                <Controller
                    id="versionDate"
                    name="versionDate"
                    label="Datum der Version"
                    helperText={"Die Datumsangabe zur aktuellen Version dieses Konzepts. Das Datum sollte i.d.R. maschinenlesbar formatiert werden."}
                    error={errors.versionDate}
                    as={<TextField {...defaultFormFieldOptions} />}
                />

                <ButtonGroup className={classes.buttonGroup}>
                    <Button
                        color="default"
                        disabled={!isDirty}
                        onClick={handleOnCancel}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        type="submit"
                        color="secondary"
                        disabled={!isDirty || !isValid}
                    >
                        Speichern
                    </Button>
                </ButtonGroup>
            </form>
        </FormProvider>
    );
}

export default EntryForm;
