import {
    ItemPropsFragment,
    RelationshipRecordType,
    SearchInput,
    useCreateRelationshipMutation,
    useDeleteRelationshipMutation,
    useSetRelatedEntriesMutation
} from "../generated/types";
import React, {useState} from "react";
import TransferList from "../components/list/TransferList";
import EditIcon from "@material-ui/icons/Edit";
import CheckIcon from "@material-ui/icons/Check";
import {Typography} from "@material-ui/core";
import FormSet, {FormSetDescription, FormSetTitle} from "../components/forms/FormSet";
import Button from "@material-ui/core/Button";
import {ApolloCache} from "@apollo/client";
import {sortItems, useStyles} from "./TransferListView";

export type AssignsPropertyWithValuesProperties = {
    relationshipId: string;
    relatedProperty: ItemPropsFragment;
    relatedValues: ItemPropsFragment[];
}

export type AssignsPropertyWithValuesTransferListViewProps = {
    title: string;
    description?: string;
    relatingItemId: string;
    assignedProperties: ItemPropsFragment[];
    relationships: AssignsPropertyWithValuesProperties[];
    searchInput: SearchInput;
    onCreate?(): void;
    onUpdate?(): void;
    onDelete?(): void;
};

export default function AssignsPropertyWithValuesTransferListView(props: AssignsPropertyWithValuesTransferListViewProps) {
    const {
        title,
        description,
        relatingItemId,
        assignedProperties,
        relationships,
        searchInput,
        onCreate,
        onUpdate,
        onDelete,
    } = props;

    const classes = useStyles();
    const [editState, setEditState] = useState(false);

    const update = (cache: ApolloCache<any>) => cache.modify({
        id: "ROOT_QUERY",
        fields: {
            hierarchy: (value, {DELETE}) => DELETE
        }
    });
    const [createRelationship] = useCreateRelationshipMutation({update});
    const [deleteRelationship] = useDeleteRelationshipMutation({update});
    const [setRelatedEntries] = useSetRelatedEntriesMutation({update});

    const handleOnCreateRelationship = async (toIds: string[]) => {
        await createRelationship({
            variables: {
                input: {
                    relationshipType: RelationshipRecordType.AssignsPropertyWithValues,
                    fromId: relatingItemId,
                    toIds
                }
            }
        });
        onCreate?.();
    };

    const assignedPropertyIds = relationships.map(({relatedProperty}) => relatedProperty.id)
    const unassignedProperties = assignedProperties.filter(({id}) => !assignedPropertyIds.includes(id));

    const handleOnSelect = async (propertyId: string) => {
        await handleOnCreateRelationship([propertyId]);
    };

    const handleOnChangeRelationship = async (id: string, relatedPropertyId: string, relatedValueIds: string[]) => {
        await setRelatedEntries({
            variables: {
                input: {
                    relationshipId: id,
                    toIds: [relatedPropertyId, ...relatedValueIds]
                }
            }
        });
        onUpdate?.();
    };

    const handleOnDeleteRelationship = async (relationshipId: string) => {
        await deleteRelationship({
            variables: {
                input: {relationshipId}
            }
        });
        onDelete?.();
    };

    let content = relationships.map(({relationshipId, relatedProperty, relatedValues}) => {
        const items = [...relatedValues].sort(sortItems);

        const handleOnAdd = async (item: ItemPropsFragment) => {
            const relatedIds = relatedValues.map(x => x.id);
            relatedIds.push(item.id);
            await handleOnChangeRelationship(relationshipId, relatedProperty.id, relatedIds);
        };

        const handleOnRemove = async (item: ItemPropsFragment) => {
            const relatedIds = relatedValues
                .map(x => x.id)
                .filter(id => id !== item.id);
            if (relatedIds.length) {
                await handleOnChangeRelationship(relationshipId, relatedProperty.id, relatedIds);
            } else {
                await handleOnDeleteRelationship(relationshipId);
            }
        };

        return (
            <React.Fragment key={relationshipId}>
                <Typography variant="caption">AssignsPropertyWithValues-Zuordnung ({relationshipId})</Typography>
                <Typography variant="body2">Zulässige Wertelistenwerte für Merkmal {relatedProperty.name}</Typography>
                <TransferList
                    enabled={editState}
                    searchInput={searchInput}
                    items={items}
                    onAdd={handleOnAdd}
                    onRemove={handleOnRemove}
                />
            </React.Fragment>
        );
    });

    return (
        <FormSet>
            <FormSetTitle>{title}</FormSetTitle>
            {description && <FormSetDescription>{description}</FormSetDescription>}

            <FormSetDescription>Zulässige Werte des Merkmals bestimmen</FormSetDescription>
            {unassignedProperties.map((option) => (
                <Button key={option.id} onClick={() => handleOnSelect(option.id)}>
                    {option.name}
                </Button>
            ))}

            {content}

            <div className={classes.buttonRow}>
                {editState ? (
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => setEditState(false)}
                        startIcon={<CheckIcon/>}
                    >
                        Bearbeitung abschließen
                    </Button>
                ) : (
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => setEditState(true)}
                        startIcon={<EditIcon/>}
                    >
                        Zuordnung bearbeiten
                    </Button>

                )}
            </div>
        </FormSet>
    );
}
