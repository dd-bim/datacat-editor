import {ApolloClient, ApolloProvider, HttpLink, InMemoryCache} from "@apollo/client";
import possibleTypes from "../generated/possibleTypes.json";
import React from "react";
import {useKeycloak} from "@react-keycloak/web";

export type ApiProviderProps = {
    children?: React.ReactNode;
}

export default function ApiProvider(props: ApiProviderProps) {
    const {children} = props;
    const {keycloak, initialized} = useKeycloak();
    const token = keycloak?.token ?? '';

    const headers = token ? {
        'Authorization': initialized ? `Bearer ${token}` : undefined
    } : {};
    const apolloClient = new ApolloClient({
        connectToDevTools: true,
        cache: new InMemoryCache({
            typePolicies: {
                'Account': {
                    keyFields: ['username']
                },
                'Profile': {
                    keyFields: ['username']
                }
            },
            possibleTypes
        }),
        link: new HttpLink({
            uri: process.env.REACT_APP_API,
            headers
        }),
        name: process.env.REACT_APP_TITLE,
        version: process.env.REACT_APP_VERSION,
    });

    return (
        <ApolloProvider client={apolloClient}>
            {children}
        </ApolloProvider>
    )
}
