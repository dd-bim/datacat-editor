import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import makeStyles from "@mui/styles/makeStyles";
import { Alert } from "@mui/lab";
import { TextField } from "@mui/material";
import Button from "@mui/material/Button";
import { SignupInput, useSignupFormMutation } from "../generated/types";
import { Theme } from "@mui/material/styles";
import { T } from "@tolgee/react";

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

interface SignupFormProps {
  onSignup: () => void;
}
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    "& > *": {
      marginBottom: theme.spacing(2),
    },
  },
}));

type SignupFormFields = SignupInput & { password2: string };
export default function SignupForm(props: SignupFormProps) {
  const classes = useStyles();
  const { onSignup } = props;
  const [cooldownReached, setCooldownReached] = useState(false);
  const [signup, { loading, error }] = useSignupFormMutation({
    errorPolicy: "all",
    onCompleted: (result) => result.success && onSignup(),
  });
  const {
    handleSubmit,
    register,
    formState: { errors },
    getValues,
  } = useForm<SignupFormFields>();
  const onSubmit = async ({ password2, ...profile }: SignupFormFields) => {
    if (!cooldownReached || loading) return;
    await signup({ variables: { profile } });
  };

  useEffect(() => {
    const timer = setTimeout(() => setCooldownReached(true), 5000);
    return () => clearTimeout(timer);
  });

  return (
    <form className={classes.root} onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && <Alert severity="error">{error.message}</Alert>}
      <TextField
        label={<T keyName="signup.username_label">Benutzername</T>}
        required
        error={!!errors.username}
        helperText={
          errors.username ? (
            <T keyName="signup.username_helper">
              Ein Benutzername ist erforderlich. Keine Leerzeichen. Muss mit einem Buchstaben beginnen und eine Mindestlänge von 3 haben.
            </T>
          ) : (
            <T keyName="signup.username_error">
              Der Benutzername kann nach der Registrierung nicht geändert werden.
            </T>
          )
        }
        {...register("username", {
          required: true,
          minLength: 3,
          pattern: /^[a-zA-Z][a-zA-Z0-9]+$/,
        })}
        fullWidth
      />
      <TextField
        type="password"
        label={<T keyName="signup.password_label">Passwort</T>}
        required
        error={!!errors.password}
        helperText={
          errors.password ? (
            <T keyName="signup.password_helper">
              Ein Passwort ist erforderlich und muss eine Mindestlänge von 8 haben.
            </T>
          ) : (
            ""
          )
        }
        {...register("password", {
          required: true,
          minLength: 8,
        })}
        fullWidth
      />
      <TextField
        type="password"
        label={<T keyName="signup.password_repeat_label">Passwort wiederholen</T>}
        required
        error={!!errors.password2}
        helperText={
          errors.password2 ? (
            <T keyName="signup.password_repeat_error">
              Die Eingabe stimmt nicht mit dem Passwort überein.
            </T>
          ) : (
            ""
          )
        }
        {...register("password2", {
          required: true,
          validate: (value: string) => {
            const password = getValues("password");
            return password === value;
          },
        })}
        fullWidth
      />
      <TextField
        label={<T keyName="signup.first_name_label">Vorname</T>}
        required
        error={!!errors.firstName}
        helperText={errors.firstName ? errors.firstName.message : ""}
        {...register("firstName", { required: true })}
        fullWidth
      />
      <TextField
        label={<T keyName="signup.last_name_label">Name</T>}
        required
        error={!!errors.lastName}
        helperText={errors.lastName ? errors.lastName.message : ""}
        {...register("lastName", { required: true })}
        fullWidth
      />
      <TextField
        type="email"
        label={<T keyName="signup.email_label">Email</T>}
        required
        error={!!errors.email}
        helperText={
          errors.email ? (
            <T keyName="signup.email_error">Bitte geben Sie eine gültige Email-Adresse an.</T>
          ) : (
            ""
          )
        }
        {...register("email", {
          required: true,
          pattern: emailRegex,
        })}
        fullWidth
      />
      <TextField
        label={<T keyName="signup.organization_label">Firma / Institut</T>}
        error={!!errors.organization}
        helperText={errors.organization ? errors.organization.message : ""}
        {...register("organization")}
        fullWidth
      />
      <Button type="submit">
        <T keyName="signup.signup_button">Registrieren</T>
      </Button>
    </form>
  );
}
