import React from "react";
import {Maybe} from "../generated/types";
import useLocalStorage from "../hooks/useLocalStorage";

export type JwtToken = string;

export type JwtTokenPayload = {
    sub: string;
    roles: string[];
    iss: string;
    exp: Date;
    iat: Date;
}

export type UserAuthentication = {
    token: Maybe<JwtToken>;
    payload: Maybe<JwtTokenPayload>;
    hasRole(role: string): boolean;
    login(token: JwtToken): void;
    logout(): void;
};

export const AuthContext = React.createContext<UserAuthentication>({
    token: null,
    payload: null,
    hasRole() { return false; },
    login() { console.warn("Missing auth provider."); },
    logout() { console.warn("Missing auth provider."); }
});

type AuthProviderProps = {
    children?: React.ReactNode
}

const parseJwtToken = (token: JwtToken): JwtTokenPayload => {
    const [, payload] = token.split(".");
    const decoded = atob(payload);
    const json = JSON.parse(decoded);
    json.exp = new Date(json.exp * 1000);
    json.iat = new Date(json.iat * 1000);
    return json;
}

export default function AuthProvider(props: AuthProviderProps) {
    const { children } = props;
    const [token, setToken] = useLocalStorage<string | null>("token", null);
    const payload = token ? parseJwtToken(token) : null;
    const exp = payload?.exp;

    if (exp && exp.getTime() < new Date().getTime()) {
        setToken(null);
    }

    return (
        <AuthContext.Provider value={{
            token,
            payload,
            hasRole: (role: string) => {
                return payload ? payload.roles.includes('ROLE_' + role) : false;
            },
            login: (token) => setToken(token),
            logout: () => setToken(null)
        }}>
            {children}
        </AuthContext.Provider>
    );
}
