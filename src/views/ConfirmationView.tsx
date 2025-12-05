import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client/react";
import { ConfirmEmailMutationVariables, ConfirmEmailDocument } from "../generated/graphql";
import TextField from "@mui/material/TextField";
import { Button, Alert, Grid, Paper } from "@mui/material";
import useLocationQueryParam from "../hooks/useLocationQueryParam";
import { Navigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { styled } from "@mui/material/styles";
import { T, useTranslate } from "@tolgee/react";

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
}));

const ParagraphTypography = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    width: '100%',
    textAlign: 'justify',
}));

const StyledForm = styled('form')(({ theme }) => ({
    "& > *": {
        marginBottom: theme.spacing(1.5),
    },
}));

export default function ConfirmationView() {
    const token = useLocationQueryParam('token', '');
    const { t } = useTranslate();
    const { register, handleSubmit, formState: { errors } } = useForm<ConfirmEmailMutationVariables>();
    const [success, setSuccess] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const [confirm, { error }] = useMutation(ConfirmEmailDocument, {
        errorPolicy: "all",
        onCompleted: (result: any) => {
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
                    <Typography variant="h4">
                        Bestätigen Sie Ihre Email-Adresse
                    </Typography>
                <StyledPaper>
                    <ParagraphTypography>
                        Danke für Ihr Interesse am datacat editor. Bitte geben Sie im folgenden Formular den Bestätigungscode an, den Sie per Email erhalten haben.
                        Anschließend können Sie auf Ihren Account zugreifen und erhalten Leserechte für den Datenkatalog.
                        <br />
                        Möchten Sie auch schreibenden Zugriff auf den Datenkatalog erhalten, informieren Sie bitte den Administrator der Anwendung über die unten genannten Kontaktdaten.
                    </ParagraphTypography>

                    <StyledForm onSubmit={handleSubmit(onSubmit)}>
                        {error && <Alert severity="error">{error.message}</Alert>}

                        <div style={{ display: "flex", alignItems: "center" }}>
                            <TextField
                                name="token"
                                label={<T keyName="confirmation.token_label" />}
                                defaultValue={token}
                                required
                                error={!!errors.token}
                                helperText={errors.token ? <T keyName="confirmation.token_helper_text" /> : ''}
                                inputRef={register("token", { required: true }).ref}
                                size="small"
                                sx={{ width: 'fit-content', minWidth: 180 }}
                            />
                            <Button
                                color="primary"
                                type="submit"
                                variant="contained"
                                sx={{ ml: 2, height: 40 }}
                            >
                                Absenden
                            </Button>
                        </div>
                    </StyledForm>
                </StyledPaper>
        </Grid>
    )
}
