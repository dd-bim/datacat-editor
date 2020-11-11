import {
    CollectsPropsFragment,
    CreateOneToManyRelationshipInput,
    OneToManyRelationshipType,
    SearchInput,
    useCreateOneToManyRelationshipMutation,
    useDeleteRelationshipMutation,
    useUpdateOneToManyRelationshipMutation
} from "../generated/types";
import React from "react";
import {PureQueryOptions, RefetchQueriesFunction} from "@apollo/client";
import SearchBox, {SearchBoxOption, toSearchBoxOptions} from "../components/SearchBox";

type UseCollectsOptions = {
    id: string,
    relationships: CollectsPropsFragment[],
    optionsSearchInput: SearchInput,
    renderLabel(relationship?: CollectsPropsFragment): React.ReactNode,
    renderHelperText?(relationship?: CollectsPropsFragment): React.ReactNode,
    refetchQueries?: (string | PureQueryOptions)[] | RefetchQueriesFunction
}

const useCollects = (props: UseCollectsOptions) => {
    const {
        id,
        relationships,
        optionsSearchInput,
        renderLabel,
        renderHelperText,
        refetchQueries
    } = props;

    const [createRelationship] = useCreateOneToManyRelationshipMutation({
        refetchQueries
    });
    const [update] = useUpdateOneToManyRelationshipMutation({
        refetchQueries
    })
    const [deleteRelationship] = useDeleteRelationshipMutation({
        refetchQueries
    });

    const hasRelationship = !!relationships.length;
    if (!hasRelationship) {
        const inputId = `${id}-collects-new`;
        const inputProps = {
            label: renderLabel(),
            helperText: renderHelperText ? renderHelperText() : undefined
        };
        const handleOnChange = async (event: React.ChangeEvent<{}>, values: SearchBoxOption[]) => {
            const input: CreateOneToManyRelationshipInput = {
                relationshipType: OneToManyRelationshipType.Collects,
                from: id,
                to: values.map(x => x.id)
            };
            await createRelationship({variables: {input}});
        }

        return [
            <SearchBox
                key={inputId}
                multiple
                id={inputId}
                searchOptions={optionsSearchInput}
                onChange={handleOnChange}
                TextFieldProps={inputProps}
            />
        ];
    } else {
        return relationships.map(relationship => {
            const inputId = `${id}-collects-${relationship.id}`;
            const defaultValue = toSearchBoxOptions(relationship.relatedThings);
            const handleOnChange = async (event: React.ChangeEvent<{}>, values: SearchBoxOption[]) => {
                if (values.length) {
                    await update({
                        variables: {
                            oldId: relationship.id,
                            input: {
                                relationshipType: OneToManyRelationshipType.Collects,
                                from: id,
                                to: (values).map(x => x.id)
                            }

                        }
                    })
                } else {
                    await deleteRelationship({
                        variables: {input: {id: relationship.id}}
                    });
                }
            };

            return (
                <SearchBox
                    key={inputId}
                    multiple
                    id={inputId}
                    defaultValue={defaultValue}
                    searchOptions={optionsSearchInput}
                    onChange={handleOnChange}
                    TextFieldProps={{
                        label: renderLabel(relationship),
                        helperText: renderHelperText ? renderHelperText(relationship) : undefined
                    }}
                />
            );
        });
    }
}

export default useCollects;
