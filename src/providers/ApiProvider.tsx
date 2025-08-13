import {ApolloClient, ApolloProvider, HttpLink, InMemoryCache} from "@apollo/client";
import possibleTypes from "../generated/possibleTypes.json";
import React from "react";
import useAuthContext from "../hooks/useAuthContext";

export type ApiProviderProps = {
    children?: React.ReactNode;
}

export default function ApiProvider(props: ApiProviderProps) {
    const {children} = props;
    const {token} = useAuthContext();
    const headers: Record<string, string> = token ? {
        'Authorization': `Bearer ${token}`
    } : {};
    const apolloClient = new ApolloClient({
        connectToDevTools: true,
        cache: new InMemoryCache({
            typePolicies: {
                Query: {
                    fields: {
                        search: {
                            keyArgs: [
                                "input"
                            ],
                            merge(existing, incoming, {args}) {
                                const nodes = existing ? [...existing.nodes] : [];
                                const start = args ? args.pageSize * args.pageNumber : nodes.length;
                                const end = start + incoming.nodes.length;
                                for (let i = start; i < end; ++i) {
                                    nodes[i] = incoming.nodes[i - start];
                                }
                                return {
                                    __typename: "SearchResultConnection",
                                    nodes,
                                    pageInfo: {...incoming.pageInfo},
                                    totalElements: incoming.totalElements
                                };
                            }
                        },
                        // Enhanced caching for countries
                        findCountries: {
                            keyArgs: ["input", ["query"]],
                            merge(existing, incoming) {
                                return incoming;
                            }
                        }
                    }
                },
                'Account': {
                    keyFields: ['username']
                },
                'Profile': {
                    keyFields: ['username']
                },
                // Better caching for country data
                'Country': {
                    keyFields: ['id'],
                    fields: {
                        name: {
                            merge: false
                        },
                        code: {
                            merge: false
                        }
                    }
                }
            },
            possibleTypes
        }),
        link: new HttpLink({
            uri: import.meta.env.VITE_API_URL,
            headers
        }),
        name: import.meta.env.VITE_APP_TITLE,
        version: import.meta.env.VITE_APP_VERSION,
    });

    return (
        <ApolloProvider client={apolloClient}>
            {children}
        </ApolloProvider>
    )
}
