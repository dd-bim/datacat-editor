import React, {FC} from "react";
import useFormStyles, {defaultFormFieldOptions} from "../../hooks/useFormStyles";
import {Controller, useForm} from "react-hook-form";
import TextField from "@mui/material/TextField";

export const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export type ProfileFormValues = {
    firstName: string,
    lastName: string,
    email: string,
    organization: string
}

export type ProfileFormProps = {
    defaultValues: Partial<ProfileFormValues>,
    onSubmit(values: ProfileFormValues): void
}
export const ProfileForm: FC<ProfileFormProps> = (props) => {
    const classes = useFormStyles();
    const {
        defaultValues,
        onSubmit
    } = props;
    const {
        handleSubmit,
        formState: { errors, isDirty, isValid },
        reset,
        control
    } = useForm<ProfileFormValues>({
        mode: "onChange",
        defaultValues
    });

    const handleOnCancel = () => {
        reset(defaultValues);
    }

    return (
        <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="firstName"
                control={control}
                rules={{ minLength: 2, required: true }}
                render={({ field, fieldState }) => (
                    <TextField
                        {...field}
                        id="firstName"
                        label="Vorname"
                        required
                        error={!!fieldState.error}
                        helperText={
                            fieldState.error
                                ? "Die Angabe Ihres Vornamens ist zwingend notwendig. Er wird anderen Katalog-Nutzern angezeigt, um Einträge und Änderungen zuzuordnen und die Zusammenarbeit zu erleichtern."
                                : ""
                        }
                         margin="normal"
                        {...defaultFormFieldOptions}
                    />
                )}
            />
    
            <Controller
                name="lastName"
                control={control}
                rules={{ minLength: 3, required: true }}
                render={({ field, fieldState }) => (
                    <TextField
                        {...field}
                        id="lastName"
                        label="Name"
                        required
                        error={!!fieldState.error}
                        helperText={
                            fieldState.error
                                ? "Die Angabe Ihres Nachnamens ist zwingend notwendig. Er wird anderen Katalog-Nutzern angezeigt, um Einträge und Änderungen zuzuordnen und die Zusammenarbeit zu erleichtern."
                                : ""
                        }
                         margin="normal"
                        {...defaultFormFieldOptions}
                    />
                )}
            />
    
            <Controller
                name="email"
                control={control}
                rules={{ required: true, pattern: emailRegex }}
                render={({ field, fieldState }) => (
                    <TextField
                        {...field}
                        id="email"
                        label="Email"
                        required
                        error={!!fieldState.error}
                        helperText={
                            fieldState.error
                                ? "Die Angabe einer gültigen Email-Adresse ist zwingend notwendig. Sie wird genutzt, um Ihr Benutzerkonto zu validieren und Sie über Änderungen im Katalog zu informieren."
                                : ""
                        }
                         margin="normal"
                        {...defaultFormFieldOptions}
                    />
                )}
            />
    
            <Controller
                name="organization"
                control={control}
                render={({ field, fieldState }) => (
                    <TextField
                        {...field}
                        id="organization"
                        label="Organisation"
                        error={!!fieldState.error}
                        helperText="Wenn zutreffend, geben Sie bitte die Firma, die Organisation oder das Institut an, für das Sie tätig sind."
                         margin="normal"
                        {...defaultFormFieldOptions}
                    />
                )}
            />
        </form>
    );
    
}
