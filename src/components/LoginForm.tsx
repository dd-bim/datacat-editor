import { useForm } from "react-hook-form";
import React, { useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import TextField from "@mui/material/TextField";
import { Button, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Alert } from '@mui/material';
import { LoginInput, useLoginFormMutation } from "../generated/types";
import { JwtToken } from "../providers/AuthProvider";
import { T } from "@tolgee/react";

interface LoginFormProps {
  onLogin: (token: JwtToken) => void;
}

const useStyles = makeStyles((theme: any) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    "& > *": {
      marginBottom: theme.spacing(2),
    },
  },
}));

export default function LoginForm(props: LoginFormProps) {
  const classes = useStyles();
  const { onLogin } = props;
  const [showPassword, setShowPassword] = useState(false);
  const [login, { error }] = useLoginFormMutation({
    errorPolicy: "all",
    onCompleted: (result) => {
      result.token && onLogin(result.token);
    },
  });
  const { handleSubmit, register, formState: { errors } } = useForm<LoginInput>();
  const onSubmit = async (input: LoginInput) => {
    await login({ variables: { credentials: input } }).catch(e => console.warn(e.message));
  };

  const handleMouseDownPassword = () => {
    setShowPassword(true);
  };

  const handleMouseUpPassword = () => {
    setShowPassword(false);
  };

  return (
    <form className={classes.root} onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && <Alert severity="error">{error.message}</Alert>}

      <TextField
        label={<T keyName="login.username_label">Benutzername</T>}
        required
        error={!!errors.username}
        helperText={errors.username ? errors.username.message : ""}
        {...register("username", { required: true })}
        fullWidth
      />

      <TextField
        type={showPassword ? "text" : "password"}
        label={<T keyName="login.password_label">Passwort</T>}
        required
        error={!!errors.password}
        helperText={errors.password ? errors.password.message : ""}
        {...register("password", { required: true })}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onMouseDown={handleMouseDownPassword}
                onMouseUp={handleMouseUpPassword}
                edge="end"
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        color="primary"
        type="submit"
        variant="contained"
      >
        <T keyName="login.login_button">Anmelden</T>
      </Button>
    </form>
  );
}
