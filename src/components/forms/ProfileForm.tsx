import React, {FC} from "react";
import useFormStyles, {defaultFormFieldOptions} from "../../hooks/useFormStyles";
import {Controller, useForm} from "react-hook-form";
import TextField from "@material-ui/core/TextField";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";

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
        errors,
        reset,
        control,
        formState: {
            isDirty,
            isValid
        }
    } = useForm<ProfileFormValues>({
        mode: "onChange",
        defaultValues
    });

    const handleOnCancel = () => {
        reset(defaultValues, {isDirty:false});
    }

    return (
        <form
            className={classes.form}
            onSubmit={handleSubmit(onSubmit)}
        >
            <Controller
                id="firstName"
                name="firstName"
                label="Vorname"
                required
                control={control}
                helperText={errors.firstName && "Die Angabe Ihres Vornamens ist zwingend notwendig. Er wird anderen Katalog-Nutzern angezeigt, um Einträge und Änderungen zuzuordnen und die Zusammenarbeit zu erleichtern."}
                error={errors.firstName}
                rules={{
                    minLength: 2,
                    required: true
                }}
                as={<TextField {...defaultFormFieldOptions} />}
            />

            <Controller
                id="lastName"
                name="lastName"
                label="Name"
                required
                control={control}
                helperText={errors.lastName && "Die Angabe Ihres Nachnamens ist zwingend notwendig. Er wird anderen Katalog-Nutzern angezeigt, um Einträge und Änderungen zuzuordnen und die Zusammenarbeit zu erleichtern."}
                error={errors.lastName}
                rules={{
                    minLength: 3,
                    required: true
                }}
                as={<TextField {...defaultFormFieldOptions} />}
            />

            <Controller
                id="email"
                name="email"
                label="Email"
                required
                control={control}
                helperText={errors.email && "Die Angabe einer gültigen Email-Adresse ist zwingend notwendig. Sie wird genutzt, um Ihr Benutzerkonto zu validieren und Sie über Änderungen im Katalog zu informieren."}
                error={errors.email}
                rules={{
                    required: true,
                    pattern: emailRegex
                }}
                as={<TextField {...defaultFormFieldOptions} />}
            />

            <Controller
                id="organization"
                name="organization"
                label="Organisation"
                helperText="Wenn zutreffend, geben Sie bitte die Firma, die Organization oder das Institut an, für das Sie tätig sind."
                error={errors.organization}
                control={control}
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
                    color="primary"
                    disabled={!isDirty || !isValid}
                >
                    Speichern
                </Button>
            </ButtonGroup>
        </form>
    );
}
