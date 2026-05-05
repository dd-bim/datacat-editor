import React from "react";
import {Maybe} from "../generated/graphql";
import useLocalStorage from "../hooks/useLocalStorage";

export type JwtToken = string;

export type JwtTokenPayload = {
    sub: string;
    roles?: string[]; // Optional für Traditional tokens
    realm_access?: {  // Optional für Keycloak tokens
        roles: string[];
    };
    iss: string;
    exp: Date;
    iat: Date;
}

export enum AuthMethod {
    TRADITIONAL = 'traditional',
    KEYCLOAK = 'keycloak'
}

export type UserAuthentication = {
    token: Maybe<JwtToken>;
    payload: Maybe<JwtTokenPayload>;
    authMethod: Maybe<AuthMethod>;
    hasRole(role: string): boolean;
    login(token: JwtToken, method?: AuthMethod): void;
    logout(): void;
};

export const AuthContext = React.createContext<UserAuthentication>({
    token: null,
    payload: null,
    authMethod: null,
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
    const [authMethod, setAuthMethod] = useLocalStorage<AuthMethod | null>("authMethod", null);
    const payload = token ? parseJwtToken(token) : null;
    const exp = payload?.exp;

    if (exp && exp.getTime() < new Date().getTime()) {
        setToken(null);
        setAuthMethod(null);
    }

    return (
        <AuthContext.Provider value={{
            token,
            payload,
            authMethod,
            hasRole: (role: string) => {
                if (!payload) return false;
                
                // Unterstütze beide Token-Formate:
                // 1. Traditional: payload.roles = ["ROLE_USER", ...]
                // 2. Keycloak: payload.realm_access.roles = ["admin", "user", ...]
                const roles = payload.roles || payload.realm_access?.roles || [];
                
                // Prüfe mit und ohne "ROLE_" Prefix
                return roles.includes('ROLE_' + role) || roles.includes(role);
            },
            login: (token, method = AuthMethod.TRADITIONAL) => {
                setToken(token);
                setAuthMethod(method);
            },
            logout: () => {
                setToken(null);
                setAuthMethod(null);
            }
        }}>
            {children}
        </AuthContext.Provider>
    );
}
