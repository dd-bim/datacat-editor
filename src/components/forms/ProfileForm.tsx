import React from "react";
import { styled } from "@mui/material/styles";
import { Controller, useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import { T } from "@tolgee/react";

// Create styled component for the form
const StyledForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

// Define default form field options
export const defaultFormFieldOptions = {
  fullWidth: true,
  variant: "outlined" as const,
};

export const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export type ProfileFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
};

export type ProfileFormProps = {
  defaultValues: Partial<ProfileFormValues>;
  onSubmit(values: ProfileFormValues): void;
};

export const ProfileForm = (props: ProfileFormProps) => {
  const { defaultValues, onSubmit } = props;
  const {
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    control,
  } = useForm<ProfileFormValues>({
    mode: "onChange",
    defaultValues,
  });

  const handleOnCancel = () => {
    reset(defaultValues);
  };

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="firstName"
        control={control}
        rules={{ minLength: 2, required: true }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            id="firstName"
            label={<T keyName="profile.form.first_name">Vorname</T>}
            required
            error={!!fieldState.error}
            helperText={
              fieldState.error ? (
                <T keyName="profile.form.first_name_helper">
                  Die Angabe Ihres Vornamens ist zwingend notwendig. Er wird anderen Katalog-Nutzern angezeigt, um Einträge und Änderungen zuzuordnen und die Zusammenarbeit zu erleichtern.
                </T>
              ) : (
                ""
              )
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
            label={<T keyName="profile.form.last_name">Name</T>}
            required
            error={!!fieldState.error}
            helperText={
              fieldState.error ? (
                <T keyName="profile.form.last_name_helper">
                  Die Angabe Ihres Nachnamens ist zwingend notwendig. Er wird anderen Katalog-Nutzern angezeigt, um Einträge und Änderungen zuzuordnen und die Zusammenarbeit zu erleichtern.
                </T>
              ) : (
                ""
              )
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
            label={<T keyName="profile.form.email">Email</T>}
            required
            error={!!fieldState.error}
            helperText={
              fieldState.error ? (
                <T keyName="profile.form.email_helper">
                  Die Angabe einer gültigen Email-Adresse ist zwingend notwendig. Sie wird genutzt, um Ihr Benutzerkonto zu validieren und Sie über Änderungen im Katalog zu informieren.
                </T>
              ) : (
                ""
              )
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
            label={<T keyName="profile.form.organization">Organisation</T>}
            error={!!fieldState.error}
            helperText={
              <T keyName="profile.form.organization_helper">
                Wenn zutreffend, geben Sie bitte die Firma, die Organisation oder das Institut an, für das Sie tätig sind.
              </T>
            }
            margin="normal"
            {...defaultFormFieldOptions}
          />
        )}
      />
    </StyledForm>
  );
};
