import React, { FC } from "react";
import { useProfileQuery, useUpdateProfileMutation } from "../../generated/types";
import LinearProgress from "@mui/material/LinearProgress";
import { useSnackbar } from "notistack";
import { ProfileForm, ProfileFormValues } from "../../components/forms/ProfileForm";
import View from "../View";
import { T } from "@tolgee/react";

const ProfileFormView: FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { loading, error, data } = useProfileQuery();
  const [updateMutation] = useUpdateProfileMutation();

  const handleOnSubmit = async (values: ProfileFormValues) => {
    const input = {
      username: data!.profile.username,
      ...values,
    };
    await updateMutation({
      variables: {
        input,
      },
    });
    enqueueSnackbar(<T keyName="profile.update_success">Benutzerprofil aktualisiert!</T>);
  };

  let content: React.ReactNode;

  if (loading) {
    content = <LinearProgress />;
  } else if (error) {
    content = <p><T keyName="profile.error">Beim Aufrufen des Benutzerprofils ist ein Fehler aufgetreten.</T></p>;
  } else {
    content = <ProfileForm defaultValues={data!.profile} onSubmit={handleOnSubmit} />;
  }

  return (
    <View heading={<T keyName="profile.heading">Benutzerprofil bearbeiten</T>}>
      {content}
    </View>
  );
};

export default ProfileFormView;
