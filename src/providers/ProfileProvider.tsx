import React, {useContext} from "react";
import {useProfileQuery, UserProfileFragment} from "../generated/types";
import {ApolloError} from "@apollo/client";
import {useKeycloak} from "@react-keycloak/web";

type ProfileContextState = {
    loading: boolean,
    error?: ApolloError,
    profile?: UserProfileFragment
}

export const ProfileContext = React.createContext<ProfileContextState>({loading: false});

export function useProfile() {
    return useContext(ProfileContext);
}

export default function ProfileProvider({children}: { children: React.ReactNode }) {
    const {keycloak} = useKeycloak();
    const {loading, error, data} = useProfileQuery({
        skip: !keycloak.authenticated
    });

    return (
        <ProfileContext.Provider value={{loading, error, profile: data?.profile}}>
            {children}
        </ProfileContext.Provider>
    );
}
