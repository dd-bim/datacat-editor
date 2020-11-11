import {
    CreateOneToManyRelationshipInput,
    DocumentsPropsFragment,
    EntityTypes,
    OneToManyRelationshipType,
    useCreateOneToManyRelationshipMutation,
    useDeleteRelationshipMutation,
    useUpdateOneToManyRelationshipMutation
} from "../generated/types";
import React from "react";
import {PureQueryOptions, RefetchQueriesFunction} from "@apollo/client";
import SearchBox, {SearchBoxOption, toSearchBoxOptions} from "../components/SearchBox";

type UseDocumentsOptions = {
    id: string,
    relationships: DocumentsPropsFragment[],
    renderLabel(relationship?: DocumentsPropsFragment): React.ReactNode,
    renderHelperText?(relationship?: DocumentsPropsFragment): React.ReactNode,
    refetchQueries?: (string | PureQueryOptions)[] | RefetchQueriesFunction
}

const useDocuments = (props: UseDocumentsOptions) => {
    const {
        id,
        relationships,
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
        const inputId = `${id}-documents-new`;
        const inputProps = {
            label: renderLabel(),
            helperText: renderHelperText ? renderHelperText() : undefined
        };
        const handleOnChange = async (event: React.ChangeEvent<{}>, values: SearchBoxOption[]) => {
            const input: CreateOneToManyRelationshipInput = {
                relationshipType: OneToManyRelationshipType.Documents,
                from: id,
                to: values.map(x => x.id)
            };
            await createRelationship({variables: {input}});
        }

        return [
            <SearchBox
                key={inputId}
                id={inputId}
                multiple
                defaultValue={[]}
                searchOptions={{
                    entityTypeIn: [
                        EntityTypes.XtdObject,
                        EntityTypes.XtdCollection
                    ]
                }}
                onChange={handleOnChange}
                TextFieldProps={inputProps}
            />
        ];
    } else {
        return relationships.map(relationship => {
            const inputId = `${id}-documents-${relationship.id}`;
            const defaultValue = toSearchBoxOptions(relationship.relatedThings);
            const handleOnChange = async (event: React.ChangeEvent<{}>, values: SearchBoxOption[]) => {
                if (values.length) {
                    await update({
                        variables: {
                            oldId: relationship.id,
                            input: {
                                relationshipType: OneToManyRelationshipType.Documents,
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
                    id={inputId}
                    multiple
                    defaultValue={defaultValue}
                    searchOptions={{
                        entityTypeIn: [
                            EntityTypes.XtdObject,
                            EntityTypes.XtdCollection
                        ]
                    }}
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

export default useDocuments;
