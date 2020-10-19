import React, {FC} from "react";
import {Controller, useForm} from "react-hook-form";
import TextField from "@material-ui/core/TextField";
import {defaultFormFieldOptions} from "../../hooks/useFormStyles";
import {Button} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme => ({
    root: {
        "& > *": {
            marginBottom: theme.spacing(1.5)
        }
    }
}));


export type CreateEntryFormValues = {
    id: string,
    versionId: string,
    versionDate: string,
    name: string,
    description: string
}

export type CreateEntryFormProps = {
    defaultValues: CreateEntryFormValues,
    onSubmit(values: CreateEntryFormValues): void
}

const CreateEntryForm: FC<CreateEntryFormProps> = (props) => {
    const {
        defaultValues,
        onSubmit
    } = props;
    const classes = useStyles();
    const {
        control,
        errors,
        handleSubmit
    } = useForm({
        defaultValues
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={classes.root}>
            <Controller
                name="name"
                label="Name (de)"
                helperText="Benennen Sie das Konzept im fachlichen Kontext und möglichst genau. Trennen Sie Synonyme durch Semikolon voneinander ab."
                focused
                control={control}
                error={errors.name}
                required={true}
                rules={{required: true}}
                as={<TextField {...defaultFormFieldOptions}/>}
            />
            <Controller
                name="description"
                label="Beschreibung (de)"
                helperText="Beschreiben Sie das Konzept in seiner Bedeutung. Nutzen Sie die Beschreibung insbesondere, um es von womöglich gleich benannten, aber fachlich verschiedenen Konzepten abzugrenzen."
                control={control}
                error={errors.description}
                as={<TextField {...defaultFormFieldOptions}/>}
            />
            <Controller
                name="id"
                label="ID"
                helperText="Die ID wird in der Regel automatisch generiert. Eine ID kann angegeben werden, wenn diese bereits in einem übergeordnetem Kontext für das Konzept vergeben wurde."
                control={control}
                error={errors.name}
                as={<TextField {...defaultFormFieldOptions}/>}
            />
            <Controller
                name="versionId"
                label="Version ID"
                control={control}
                error={errors.name}
                as={<TextField {...defaultFormFieldOptions}/>}
            />
            <Controller
                name="versionDate"
                label="Version date"
                control={control}
                error={errors.name}
                as={<TextField {...defaultFormFieldOptions}/>}
            />

            <Button type="submit" variant="contained">Speichern</Button>
        </form>
    );
}

export default CreateEntryForm;
