import React, {useContext} from "react";
import { useQuery } from "@apollo/client/react";
import {ProfileDocument, UserProfileFragment} from "../generated/graphql";
import useAuthContext from "../hooks/useAuthContext";

type ProfileContextState = {
    loading: boolean,
    error?: Error,
    profile?: UserProfileFragment
}

export const ProfileContext = React.createContext<ProfileContextState>({loading: false});

export function useProfile() {
    return useContext(ProfileContext);
}

export default function ProfileProvider({children}: { children: React.ReactNode }) {
    const {token} = useAuthContext();
    const {loading, error, data} = useQuery(ProfileDocument, {
        skip: !token
    });

    return (
        <ProfileContext.Provider value={{loading, error, profile: data?.profile}}>
            {children}
        </ProfileContext.Provider>
    );
}
