import React, {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import makeStyles from "@mui/styles/makeStyles";
import {Alert} from "@mui/lab";
import {TextField} from "@mui/material";
import Button from "@mui/material/Button";
import {SignupInput, useSignupFormMutation} from "../generated/types";

const usernameHelperText = "A username is required. No whitespace. Must start with a letter and have a minimum length of 3."
const passwordHelperText = "A password is required and must have a minimum lenght of 8."
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

interface SignupFormProps {
    onSignup: () => void;
}

const useStyles = makeStyles(theme => ({
    root: {
        "display": "flex",
        "flex-direction": "column",
        "& > *": {
            "margin-bottom": theme.spacing(2)
        }
    }
}));

type SignupFormFields = SignupInput & { password2: string };
export default function SignupForm(props: SignupFormProps) {
    const classes = useStyles();
    const {onSignup} = props;
    const [cooldownReached, setCooldownReached] = useState(false);
    const [signup, {loading, error}] = useSignupFormMutation({
        errorPolicy: 'all',
        onCompleted: (result) => result.success && onSignup()
    });
    const {handleSubmit, register, errors, getValues} = useForm<SignupFormFields>();
    const onSubmit = async ({password2, ...profile}: SignupFormFields) => {
        if (!cooldownReached || loading) return;
        await signup({variables: {profile}});
    }

    useEffect(() => {
        const timer = setTimeout(() => setCooldownReached(true), 5000);
        return () => clearTimeout(timer);
    });

    return (
        (<form className={classes.root} onSubmit={handleSubmit(onSubmit)} noValidate>
            {error && <Alert severity="error">{error.message}</Alert>}
            <TextField
                name="username"
                label="Benutername"
                required
                error={!!errors.username}
                helperText={errors.username ? usernameHelperText : 'Der Benutername kann nach der Registrierung nicht geändert werden.'}
                inputRef={register({
                    required: true,
                    minLength: 3,
                    pattern: /^[a-zA-Z][a-zA-Z0-9]+$/
                })}
                fullWidth
            />
            <TextField
                type="password"
                name="password"
                label="Passwort"
                required
                error={!!errors.password}
                helperText={errors.password ? passwordHelperText : ''}
                inputRef={register({
                    required: true,
                    minLength: 8
                })}
                fullWidth
            />
            <TextField
                type="password"
                name="password2"
                label="Password wiederholen"
                required
                error={!!errors.password2}
                helperText={errors.password2 ? 'Die Eingabe stimmt nicht mit dem Passwort überein.' : ''}
                inputRef={register({
                    required: true,
                    validate: (value: string) => {
                        const password = getValues('password');
                        return password === value;
                    }
                })}
                fullWidth
            />
            <TextField
                name="firstName"
                label="Vorname"
                required
                error={!!errors.firstName}
                helperText={errors.firstName ? errors.firstName.message : ''}
                inputRef={register({required: true})}
                fullWidth
            />
            <TextField
                name="lastName"
                label="Name"
                required
                error={!!errors.lastName}
                helperText={errors.lastName ? errors.lastName.message : ''}
                inputRef={register({required: true})}
                fullWidth
            />
            <TextField
                type="email"
                name="email"
                label="Email"
                required
                error={!!errors.email}
                helperText={errors.email ? 'Please provide a valid email address.' : ''}
                inputRef={register({
                    required: true,
                    pattern: emailRegex
                })}
                fullWidth
            />
            <TextField
                name="organization"
                label="Firma / Institut"
                error={!!errors.organization}
                helperText={errors.organization ? errors.organization.message : ''}
                inputRef={register()}
                fullWidth
            />
            <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={loading}
            >
                Signup
            </Button>
        </form>)
    );
}
