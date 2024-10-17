import {useForm} from "react-hook-form";
import React, {useState} from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import TextField from "@material-ui/core/TextField";
import {Button, IconButton, InputAdornment} from "@material-ui/core";
import {Visibility, VisibilityOff} from "@material-ui/icons";
import {Alert} from "@material-ui/lab";
import {LoginInput, useLoginFormMutation} from "../generated/types";
import {JwtToken} from "../providers/AuthProvider";

interface LoginFormProps {
    onLogin: (token: JwtToken) => void;
}

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        "& > *": {
            marginBottom: theme.spacing(2)
        }
    }
}));

export default function LoginForm(props: LoginFormProps) {
    const classes = useStyles();
    const {onLogin} = props;
    const [showPassword, setShowPassword] = useState(false);
    const [login, {error}] = useLoginFormMutation({
        errorPolicy: 'all',
        onCompleted: (result) => {
            result.token && onLogin(result.token);
        }
    });
    const {handleSubmit, register, errors} = useForm<LoginInput>();
    const onSubmit = async (input: LoginInput) => {
        await login({variables: {credentials: input}}).catch(e => console.warn(e.message));
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
                name="username"
                label="Benutzername"
                required
                error={!!errors.username}
                helperText={errors.username ? errors.username.message : ''}
                inputRef={register({required: true})}
                fullWidth
            />

            <TextField
                type={showPassword ? "text" : "password"}
                name="password"
                label="Passwort"
                required
                error={!!errors.password}
                helperText={errors.password ? errors.password.message : ''}
                inputRef={register({required: true})}
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
                    )
                }}
            />

            <Button
                color="primary"
                type="submit"
                variant="contained"
            >
                Login
            </Button>
        </form>
    );
}
