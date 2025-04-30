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
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import {Typography, Button} from "@mui/material";
import FormSet, {FormSetDescription, FormSetNotice, FormSetTitle} from "../components/forms/FormSet";
import { styled } from "@mui/material/styles";
import {ApolloCache} from "@apollo/client";
import {CatalogRecord} from "../types";
import {useNavigate} from "react-router-dom";
import {getEntityType} from "../domain";

export type RelationshipProperties = {
    relationshipId: string;
    relatedItems: CatalogRecord[];
}

export type TransferListViewProps = {
    title: React.ReactNode;
    description?: string;
    relatingItemId: string;
    relationshipType: RelationshipRecordType
    relationships: RelationshipProperties[];
    searchInput: SearchInput;
    onCreate?(): void;
    onUpdate?(): void;
    onDelete?(): void;
};

// Replace makeStyles with styled components
const TitleContainer = styled('div')({
    display: "flex",
    alignContent: "space-between"
});

const ButtonRow = styled('div')(({ theme }) => ({
    display: "flex",
    justifyContent: "end",
    marginTop: theme.spacing(1)
}));

export const sortItems = (a: CatalogRecord, b: CatalogRecord) => {
    const x = a.name ?? a.id;
    const y = b.name ?? b.id;
    return x.localeCompare(y);
};

export default function TransferListView(props: TransferListViewProps) {
    const {
        title,
        description,
        relatingItemId,
        relationshipType,
        relationships,
        searchInput,
        onCreate,
        onUpdate,
        onDelete,
    } = props;

    const navigate = useNavigate();
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
                    relationshipType,
                    fromId: relatingItemId,
                    toIds
                }
            }
        });
        onCreate?.();
    };

    const handleOnChangeRelationship = async (id: string, related: string[]) => {
        await setRelatedEntries({
            variables: {
                input: {
                    relationshipId: id,
                    toIds: related
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

    let content = relationships.map(({relationshipId, relatedItems}) => {
        const items = [...relatedItems].sort(sortItems);

        const handleOnAdd = async (item: ItemPropsFragment) => {
            const relatedIds = relatedItems.map(x => x.id);
            relatedIds.push(item.id);
            await handleOnChangeRelationship(relationshipId, relatedIds);
        };

        const handleOnRemove = async (item: ItemPropsFragment) => {
            const relatedIds = relatedItems
                .map(x => x.id)
                .filter(id => id !== item.id);
            if (relatedIds.length) {
                await handleOnChangeRelationship(relationshipId, relatedIds);
            } else {
                await handleOnDeleteRelationship(relationshipId);
            }
        };

        return (
            <React.Fragment key={relationshipId}>
                <Typography variant="caption">{relationshipType}-Zuordnung ({relationshipId})</Typography>
                <TransferList
                    enabled={editState}
                    searchInput={searchInput}
                    items={items}
                    onAdd={handleOnAdd}
                    onSelect={item => {
                        const definition = getEntityType(item.recordType, item.tags.map(x => x.id));
                        navigate(`/${definition.path}/${item.id}`);
                    }}
                    onRemove={handleOnRemove}
                />
            </React.Fragment>
        );
    });

    if (!content.length) {
        if (editState) {
            content = [
                <React.Fragment key="new-relationship">
                    <Typography variant="caption">Neue Zuordnung</Typography>
                    <TransferList
                        enabled={true}
                        searchInput={searchInput}
                        items={[]}
                        onAdd={async item => {
                            await handleOnCreateRelationship([item.id]);
                        }}
                    />
                </React.Fragment>
            ];
        } else {
            content = [
                <FormSetNotice key="no-relationship">Keine Zuordnung getroffen.</FormSetNotice>
            ];
        }
    }

    return (
        <FormSet>
            <FormSetTitle>{title}</FormSetTitle>
            {description && <FormSetDescription>{description}</FormSetDescription>}
            {content}
            <ButtonRow>
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
            </ButtonRow>
        </FormSet>
    );
}
