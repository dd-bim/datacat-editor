import {ApolloClient, ApolloProvider, HttpLink, InMemoryCache} from "@apollo/client";
import possibleTypes from "../generated/possibleTypes.json";
import React from "react";
import useAuthContext from "../hooks/useAuthContext";

export type ApiProviderProps = {
    children?: React.ReactNode;
}

export default function ApiProvider(props: ApiProviderProps) {
    const { children } = props;
    const { token } = useAuthContext();
    const headers = token ? {
        'Authorization': `Bearer ${token}`
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
