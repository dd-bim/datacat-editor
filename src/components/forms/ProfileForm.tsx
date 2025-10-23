import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { Controller, useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
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
  onSubmit(values: ProfileFormValues, password: string): Promise<void>;
  username: string; // Benötigt für Passwort-Validierung
};

export const ProfileForm = (props: ProfileFormProps) => {
  const { defaultValues, onSubmit, username } = props;
  const {
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    control,
  } = useForm<ProfileFormValues>({
    mode: "onChange",
    defaultValues,
  });

  // State für Passwort-Dialog
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [pendingValues, setPendingValues] = useState<ProfileFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOnCancel = () => {
    reset(defaultValues);
  };

  // Öffnet den Passwort-Dialog
  const handleFormSubmit = (values: ProfileFormValues) => {
    setPendingValues(values);
    setPassword("");
    setPasswordError("");
    setPasswordDialogOpen(true);
  };

  // Schließt den Passwort-Dialog
  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setPassword("");
    setPasswordError("");
    setPendingValues(null);
    setIsSubmitting(false);
  };

  // Bestätigt das Passwort und führt den Submit aus
  const handleConfirmPassword = async () => {
    if (!password) {
      setPasswordError("Bitte geben Sie Ihr Passwort ein.");
      return;
    }

    if (!pendingValues) return;

    setIsSubmitting(true);
    setPasswordError("");

    try {
      await onSubmit(pendingValues, password);
      handleClosePasswordDialog();
    } catch (error: any) {
      // Fehler vom Backend (z.B. falsches Passwort)
      setPasswordError(error.message || "Passwort ist ungültig.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <StyledForm onSubmit={handleSubmit(handleFormSubmit)}>
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
      
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
        <Button
          type="button"
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={handleOnCancel}
          disabled={!isDirty || isSubmitting}
        >
          <T keyName="common.reset">Zurücksetzen</T>
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={!isDirty || !isValid || isSubmitting}
        >
          <T keyName="common.save">Speichern</T>
        </Button>
      </Box>
    </StyledForm>

    <Dialog open={passwordDialogOpen} onClose={handleClosePasswordDialog}>
      <DialogTitle>
        <T keyName="profile.confirmPassword">Passwort bestätigen</T>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <T keyName="profile.confirmPasswordText">
            Bitte geben Sie Ihr Passwort ein, um die Änderungen zu speichern.
          </T>
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label={<T keyName="profile.password">Passwort</T>}
          type="password"
          fullWidth
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!passwordError}
          helperText={passwordError}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleConfirmPassword();
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClosePasswordDialog} disabled={isSubmitting}>
          <T keyName="common.cancel">Abbrechen</T>
        </Button>
        <Button onClick={handleConfirmPassword} variant="contained" disabled={isSubmitting || !password}>
          <T keyName="common.confirm">Bestätigen</T>
        </Button>
      </DialogActions>
    </Dialog>
  </>
  );
};
