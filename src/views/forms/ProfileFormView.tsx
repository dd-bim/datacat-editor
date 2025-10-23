import React, { FC, useEffect } from "react";
import { useProfileQuery, useUpdateProfileMutation, LoginFormDocument, LoginFormMutation, LoginFormMutationVariables } from "../../generated/types";
import LinearProgress from "@mui/material/LinearProgress";
import { useSnackbar } from "notistack";
import { ProfileForm, ProfileFormValues } from "../../components/forms/ProfileForm";
import View from "../View";
import { T } from "@tolgee/react";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { useNavigate } from "react-router-dom";

const ProfileFormView: FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { loading, error, data } = useProfileQuery();
  const [updateMutation] = useUpdateProfileMutation();
  const navigate = useNavigate();

  // Redirect to home if user is "student"
  useEffect(() => {
    if (data?.profile.username === "student") {
      enqueueSnackbar(<T keyName="profile.student_access_denied">Als Student können Sie Ihr Profil nicht bearbeiten.</T>, { variant: "warning" });
      navigate("/");
    }
  }, [data, navigate, enqueueSnackbar]);

  const handleOnSubmit = async (values: ProfileFormValues, password: string) => {
    // Verify password using a separate Apollo Client without authentication
    // This way we don't interfere with the current session
    const verificationClient = new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({
        uri: import.meta.env.VITE_API_URL,
        // No Authorization header - just verify password
      }),
    });

    try {
      const loginResult = await verificationClient.mutate<LoginFormMutation, LoginFormMutationVariables>({
        mutation: LoginFormDocument,
        variables: {
          credentials: {
            username: data!.profile.username,
            password: password,
          },
        },
      });

      if (!loginResult.data?.token) {
        throw new Error("Ungültiges Passwort");
      }
    } catch (error: any) {
      // Password verification failed
      throw new Error(error.message || "Passwort-Verifikation fehlgeschlagen");
    } finally {
      // Clean up the verification client
      await verificationClient.clearStore();
    }

    // Password is correct, proceed with profile update using the authenticated session
    const input = {
      username: data!.profile.username,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      organization: values.organization,
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
    content = (
      <ProfileForm 
        defaultValues={data!.profile} 
        username={data!.profile.username}
        onSubmit={handleOnSubmit} 
      />
    );
  }

  return (
    <View heading={<T keyName="profile.heading">Benutzerprofil bearbeiten</T>}>
      {content}
    </View>
  );
};

export default ProfileFormView;
