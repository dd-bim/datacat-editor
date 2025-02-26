import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ConfirmEmailMutationVariables, useConfirmEmailMutation } from "../generated/types";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import useLocationQueryParam from "../hooks/useLocationQueryParam";
import { Alert } from "@mui/lab";
import { Navigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme: { spacing: (factor: number) => number }) => ({
    paper: {
        padding: theme.spacing(2),
    },
    paragraph: {
        marginBottom: theme.spacing(3)
    },
    form: {
        "& > *": {
            marginBottom: theme.spacing(1.5)
        }
    }
}));

export default function ConfirmationView() {
    const classes = useStyles();
    const token = useLocationQueryParam('token', '');
    const { register, handleSubmit, formState: { errors } } = useForm<ConfirmEmailMutationVariables>();
    const [success, setSuccess] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const [confirm, { error }] = useConfirmEmailMutation({
        errorPolicy: "all",
        onCompleted: (result) => {
            if (result.success) {
                enqueueSnackbar('Ihre Email-Adresse wurde bestätigt. Bitte nutzen Sie Ihren gewählten Benutzernamen und Ihr Password um sich anzumelden.');
                setSuccess(true);
            }
        }
    });
    const onSubmit = async (value: ConfirmEmailMutationVariables) => {
        await confirm({ variables: value });
    }

    if (success) {
        return <Navigate to="/" />;
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper className={classes.paper} variant="outlined">
                    <Typography variant="h4">
                        Bestätigen Sie Ihre Email-Adresse
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs={6}>
                <Paper className={classes.paper}>
                    <Typography className={classes.paragraph}>
                        Danke für Ihr Interesse am datacat editor. Bitte geben Sie im folgenden Formular den Bestätigungscode an, den Sie per Email erhalten haben.
                        Anschließend können Sie auf Ihren Account zugreifen und erhalten Leserechte für den Datenkatalog.
                    </Typography>
                    <Typography className={classes.paragraph}>
                        Möchten Sie auch schreibenden Zugriff auf den Datenkatalog erhalten, informieren Sie bitte den Administrator der Anwendung über die unten genannten Kontaktdaten.
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs={6}>
                <Paper className={classes.paper}>
                    <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
                        {error && <Alert severity="error">{error.message}</Alert>}

                        <TextField
                            name="token"
                            label="Bestätigungstoken"
                            defaultValue={token}
                            required
                            error={!!errors.token}
                            helperText={errors.token ? 'Der Bestätigungstoken ist notwendig um Ihre Email-Adresse zu bestätigen und wird Ihrem Postfach zugestellt.' : ''}
                            inputRef={register("token", { required: true }).ref}
                            fullWidth
                        />
                        <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                        >
                            Absenden
                        </Button>
                    </form>
                </Paper>
            </Grid>
        </Grid>
    )
}
