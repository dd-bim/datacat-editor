import {
    AssignsUnitsPropsFragment,
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

type UseAssignsUnitsOptions = {
    id: string,
    relationships: AssignsUnitsPropsFragment[],
    optionsSearchInput: SearchInput,
    renderLabel(relationship?: AssignsUnitsPropsFragment): React.ReactNode,
    renderHelperText?(relationship?: AssignsUnitsPropsFragment): React.ReactNode,
    refetchQueries?: (string | PureQueryOptions)[] | RefetchQueriesFunction
}

const useAssignsUnits = (props: UseAssignsUnitsOptions) => {
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
        const inputId = `${id}-assigns-units-new`;
        const inputProps = {
            label: renderLabel(),
            helperText: renderHelperText ? renderHelperText() : undefined
        };
        const handleOnChange = async (event: React.ChangeEvent<{}>, values: SearchBoxOption[]) => {
            const input: CreateOneToManyRelationshipInput = {
                relationshipType: OneToManyRelationshipType.AssignsUnits,
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
                defaultValue={[]}
                onChange={handleOnChange}
                searchOptions={optionsSearchInput}
                TextFieldProps={inputProps}
            />
        ];
    } else {
        return relationships.map(relationship => {
            const inputId = `${id}-assigns-units-${relationship.id}`;
            const defaultValue = toSearchBoxOptions(relationship.relatedUnits);
            const inputProps = {
                label: renderLabel(relationship),
                helperText: renderHelperText ? renderHelperText(relationship) : undefined
            };
            const handleOnChange = async (event: React.ChangeEvent<{}>, values: SearchBoxOption[]) => {
                if (values.length) {
                    await update({
                        variables: {
                            oldId: relationship.id,
                            input: {
                                relationshipType: OneToManyRelationshipType.AssignsUnits,
                                from: id,
                                to: values.map(x => x.id)
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
                    onChange={handleOnChange}
                    searchOptions={optionsSearchInput}
                    TextFieldProps={inputProps}
                />
            );
        });
    }
}

export default useAssignsUnits;
