import {
    CreateOneToManyRelationshipInput,
    DocumentsPropsFragment,
    EntityTypes,
    OneToManyRelationshipType,
    useCreateOneToManyRelationshipMutation,
    useFindConceptQuery
} from "../generated/types";
import React, {useState} from "react";
import EntrySelect, {EntrySelectOption} from "../components/forms/EntrySelect";
import useDebounce from "./useDebounce";
import {Value} from "@material-ui/lab";
import {toConceptSelectOption} from "../views/forms/utils";
import {PureQueryOptions, RefetchQueriesFunction} from "@apollo/client";
import ConceptChip from "../components/ConceptChip";
import {DocumentEntity} from "../domain";

type UseDocumentedByOptions = {
    id: string,
    relationships: DocumentsPropsFragment[],
    label: React.ReactNode,
    helperText?: React.ReactNode,
    refetchQueries?: (string | PureQueryOptions)[] | RefetchQueriesFunction
}

const useDocumentedBy = (props: UseDocumentedByOptions) => {
    const {
        id,
        relationships,
        label,
        helperText,
        refetchQueries
    } = props;

    // query nested groups
    const [optionsQuery, setOptionsQuery] = useState("");
    const debouncedOptionsQuery = useDebounce(optionsQuery, 500);
    const {data: optionsData} = useFindConceptQuery({
        variables: {
            input: {
                query: debouncedOptionsQuery,
                entityTypeIn: [EntityTypes.XtdExternalDocument],
                idNotIn: relationships.map(x => x.relatingDocument.id),
                pageSize: 100
            }
        }
    });
    const options = optionsData?.search.nodes.map(toConceptSelectOption) ?? [];

    const handleOnInputChange = (e: React.ChangeEvent<{}>, value: string) => {
        setOptionsQuery(value);
    };

    const [createRelationship] = useCreateOneToManyRelationshipMutation({
        refetchQueries
    });

    const handleOnChange = async (event: React.ChangeEvent<{}>, value: Value<EntrySelectOption, true, true, true>) => {
        const input: CreateOneToManyRelationshipInput = {
            relationshipType: OneToManyRelationshipType.Documents,
            from: id,
            to: (value as EntrySelectOption[]).map(x => x.id)
        };
        await createRelationship({variables: {input}});
    }

    return (
        <React.Fragment>
            <EntrySelect
                id="documentedBy"
                defaultValue={[]}
                options={options}
                onInputChange={handleOnInputChange}
                onChange={handleOnChange}
                InputProps={{
                    label: label,
                    helperText: helperText
                }}
            />
            <div>
                {relationships.map(({relatingDocument: x}) => (
                    <ConceptChip
                        key={x.id}
                        conceptType={DocumentEntity}
                        id={x.id}
                        label={x.name ?? x.id}
                        title={x.description ?? undefined}
                    />
                ))}
            </div>
        </React.Fragment>
    );
}

export default useDocumentedBy;
