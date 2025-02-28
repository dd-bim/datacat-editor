import React, {FC} from "react";
import {useProfileQuery, useUpdateProfileMutation} from "../../generated/types";
import LinearProgress from "@mui/material/LinearProgress";
import {useSnackbar} from "notistack";
import {ProfileForm, ProfileFormValues} from "../../components/forms/ProfileForm";
import View from "../View";

const ProfileFormView: FC = () => {
    const {enqueueSnackbar} = useSnackbar();
    const {loading, error, data} = useProfileQuery();
    const [updateMutation] = useUpdateProfileMutation();

    const handleOnSubmit = async (values: ProfileFormValues) => {
        const input = {
            username: data!.profile.username,
            ...values
        }
        await updateMutation({
            variables: {
                input
            }
        });
        enqueueSnackbar("Benutzerprofil aktualisiert!");
    };

    let content: React.ReactNode;

    if (loading) {
        content = (
            <LinearProgress/>
        );
    } else if (error) {
        content = (
            <p>Beim Aufrufen des Benutzerprofils ist ein Fehler aufgetreten.</p>
        );
    } else {
        content = (
            <ProfileForm
                defaultValues={data!.profile}
                onSubmit={handleOnSubmit}
            />
        );
    }

    return (
        <View heading="Benutzerprofil bearbeiten">
            {content}
        </View>
    )
}

export default ProfileFormView;
