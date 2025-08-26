import React, {useContext} from "react";
import {useProfileQuery, UserProfileFragment} from "../generated/types";
import useAuthContext from "../hooks/useAuthContext";
import { ApolloError } from "@apollo/client/v4-migration";

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
    const {token} = useAuthContext();
    const {loading, error, data} = useProfileQuery({
        skip: !token
    });

    return (
        <ProfileContext.Provider value={{loading, error, profile: data?.profile}}>
            {children}
        </ProfileContext.Provider>
    );
}
