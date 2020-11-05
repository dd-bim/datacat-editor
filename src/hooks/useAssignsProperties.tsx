import {
    AssignsPropertiesPropsFragment,
    CreateOneToManyRelationshipInput,
    OneToManyRelationshipType,
    SearchInput,
    useCreateOneToManyRelationshipMutation,
    useDeleteRelationshipMutation,
    useFindConceptQuery,
    useUpdateOneToManyRelationshipMutation
} from "../generated/types";
import React, {useState} from "react";
import EntrySelect, {EntrySelectOption} from "../components/forms/EntrySelect";
import useDebounce from "./useDebounce";
import {Value} from "@material-ui/lab";
import {toConceptSelectOption} from "../views/forms/utils";
import {PureQueryOptions, RefetchQueriesFunction} from "@apollo/client";

type UseAssignsPropertiesOptions = {
    id: string,
    relationships: AssignsPropertiesPropsFragment[],
    optionsSearchInput: SearchInput,
    renderLabel(relationship?: AssignsPropertiesPropsFragment): React.ReactNode,
    renderHelperText?(relationship?: AssignsPropertiesPropsFragment): React.ReactNode,
    refetchQueries?: (string | PureQueryOptions)[] | RefetchQueriesFunction
}

const useAssignsProperties = (props: UseAssignsPropertiesOptions) => {
    const {
        id,
        relationships,
        optionsSearchInput,
        renderLabel,
        renderHelperText,
        refetchQueries
    } = props;

    // query nested groups
    const [optionsQuery, setOptionsQuery] = useState("");
    const debouncedOptionsQuery = useDebounce(optionsQuery, 500);
    const {data: optionsData} = useFindConceptQuery({
        variables: {input: {...optionsSearchInput, query: debouncedOptionsQuery}}
    });
    const options = optionsData?.search.nodes.map(toConceptSelectOption) ?? [];

    const handleOnInputChange = (e: React.ChangeEvent<{}>, value: string) => {
        setOptionsQuery(value);
    };

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
        const inputId = `${id}-assigns-properties-new`;
        const inputProps = {
            label: renderLabel(),
            helperText: renderHelperText ? renderHelperText() : undefined
        };
        const handleOnChange = async (event: React.ChangeEvent<{}>, value: Value<EntrySelectOption, true, true, true>) => {
            const input: CreateOneToManyRelationshipInput = {
                relationshipType: OneToManyRelationshipType.AssignsProperties,
                from: id,
                to: (value as EntrySelectOption[]).map(x => x.id)
            };
            await createRelationship({variables: {input}});
        }

        return [
            <EntrySelect
                key={inputId}
                id={inputId}
                defaultValue={[]}
                options={options}
                onInputChange={handleOnInputChange}
                onChange={handleOnChange}
                InputProps={inputProps}
            />
        ];
    } else {
        return relationships.map(relationship => {
            const inputId = `${id}-assigns-properties-${relationship.id}`;
            const defaultValue = relationship.relatedProperties.map(toConceptSelectOption);
            const inputProps = {
                label: renderLabel(relationship),
                helperText: renderHelperText ? renderHelperText(relationship) : undefined
            };
            const handleOnChange = async (event: React.ChangeEvent<{}>, value: Value<EntrySelectOption, true, true, true>) => {
                const values = value as EntrySelectOption[];
                if (values.length) {
                    await update({
                        variables: {
                            oldId: relationship.id,
                            input: {
                                relationshipType: OneToManyRelationshipType.AssignsProperties,
                                from: id,
                                to: (value as EntrySelectOption[]).map(x => x.id)
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
                <EntrySelect
                    key={inputId}
                    id={inputId}
                    defaultValue={defaultValue}
                    options={options}
                    onInputChange={handleOnInputChange}
                    onChange={handleOnChange}
                    InputProps={inputProps}
                />
            );
        });
    }
}

export default useAssignsProperties;
