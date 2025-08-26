import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { Defer20220824Handler } from "@apollo/client/incremental";
import { LocalState } from "@apollo/client/local-state";
import { ApolloProvider } from "@apollo/client/react";
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

        clientAwareness: {
            name: import.meta.env.VITE_APP_TITLE,
            version: import.meta.env.VITE_APP_VERSION
        },

        /*
        Inserted by Apollo Client 3->4 migration codemod.
        If you are not using the `@client` directive in your application,
        you can safely remove this option.
        */
        localState: new LocalState({}),

        devtools: {
            enabled: true
        },

        /*
        Inserted by Apollo Client 3->4 migration codemod.
        If you are not using the `@defer` directive in your application,
        you can safely remove this option.
        */
        incrementalHandler: new Defer20220824Handler()
    });

    return (
        <ApolloProvider client={apolloClient}>
            {children}
        </ApolloProvider>
    )
}

/*
Start: Inserted by Apollo Client 3->4 migration codemod.
Copy the contents of this block into a `.d.ts` file in your project to enable correct response types in your custom links.
If you do not use the `@defer` directive in your application, you can safely remove this block.
*/

declare module "@apollo/client" {
    export interface TypeOverrides extends Defer20220824Handler.TypeOverrides {}
}

/*
End: Inserted by Apollo Client 3->4 migration codemod.
*/

