import {
    ObjectPropsFragment,
    RelationshipRecordType,
    SearchInput,
    useCreateRelationshipMutation,
    useDeleteRelationshipMutation
} from "../generated/types";
import React, {JSX, useState, useEffect, useCallback} from "react";
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
import { T } from "@tolgee/react";

export type TransferListViewProps = {
    title: React.ReactNode;
    description?: string;
    relatingItemId: string;
    relationshipType: RelationshipRecordType
    relationships: CatalogRecord[];
    searchInput: SearchInput;
    showDictionaryFilter?: boolean;
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
        showDictionaryFilter = false,
        onCreate,
        onDelete,
    } = props;

    const navigate = useNavigate();
    const [editState, setEditState] = useState(false);
    const [selectedDictionaryId, setSelectedDictionaryId] = useState<string | null>(null);
    
    // Local state for optimistic updates
    const [localItems, setLocalItems] = useState<CatalogRecord[]>([...relationships].sort(sortItems));
    const [hasChanges, setHasChanges] = useState(false);

    // Sync local state when relationships prop changes (e.g., after refetch)
    useEffect(() => {
        if (!editState) {
            setLocalItems([...relationships].sort(sortItems));
        }
    }, [relationships, editState]);

    const update = (cache: ApolloCache) => cache.modify({
        id: "ROOT_QUERY",
        fields: {
            hierarchy: (value: any, {DELETE}: any) => DELETE
        }
    });
    const [createRelationship] = useCreateRelationshipMutation({update});
    const [deleteRelationship] = useDeleteRelationshipMutation({update});

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
    };

    const handleOnDeleteRelationship = async (toId: string) => {
        await deleteRelationship({
            variables: {
                input: {
                    relationshipType,
                    fromId: relatingItemId,
                    toId,
                    name: relationshipType // Use relationshipType as name
                }
            }
        });
    };

    // Close edit mode and trigger refetch if there were changes
    const handleCloseEdit = useCallback(() => {
        setEditState(false);
        if (hasChanges) {
            // Trigger refetch when closing edit mode
            onCreate?.();
            setHasChanges(false);
        }
    }, [hasChanges, onCreate]);

    let content: JSX.Element;

    const handleOnAdd = async (item: ObjectPropsFragment) => {
        // Optimistically update local state
        const newItem: CatalogRecord = {
            id: item.id,
            recordType: item.recordType,
            name: item.name ?? undefined,
            tags: item.tags ?? [],
        };
        setLocalItems(prev => [...prev, newItem].sort(sortItems));
        setHasChanges(true);
        
        // Send to server
        const relatedIds = localItems.map(x => x.id);
        relatedIds.push(item.id);
        await handleOnCreateRelationship(relatedIds);
    };

    const handleOnRemove = async (item: ObjectPropsFragment) => {
        // Optimistically update local state
        setLocalItems(prev => prev.filter(x => x.id !== item.id));
        setHasChanges(true);
        
        // Send to server
        await handleOnDeleteRelationship(item.id);
    };

    if (localItems.length === 0) {
        if (editState) {
            content = (
                <React.Fragment key="new-relationship">
                    <Typography variant="caption"><T keyName="transfer_list.new"/></Typography>
                    <TransferList
                        enabled={true}
                        searchInput={searchInput}
                        items={[]}
                        showDictionaryFilter={showDictionaryFilter}
                        selectedDictionaryId={selectedDictionaryId}
                        onDictionaryFilterChange={setSelectedDictionaryId}
                        onAdd={async item => {
                            // Optimistically update local state
                            const newItem: CatalogRecord = {
                                id: item.id,
                                recordType: item.recordType,
                                name: item.name ?? undefined,
                                tags: item.tags ?? [],
                            };
                            setLocalItems([newItem]);
                            setHasChanges(true);
                            
                            // Send to server
                            await handleOnCreateRelationship([item.id]);
                        }}
                    />
                </React.Fragment>
            );
        } else {
            content = (
                <FormSetNotice key="no-relationship"><T keyName="transfer_list.no_assignement"/></FormSetNotice>
            );
        }
    } else {
        content = (
            <React.Fragment key={relationshipType}>
                <Typography variant="caption">{relationshipType}-<T keyName="transfer_list.assignement"/></Typography>
                <TransferList
                    enabled={editState}
                    searchInput={searchInput}
                    items={localItems}
                    showDictionaryFilter={showDictionaryFilter}
                    selectedDictionaryId={selectedDictionaryId}
                    onDictionaryFilterChange={setSelectedDictionaryId}
                    onAdd={handleOnAdd}
                    onSelect={item => {
                        const definition = getEntityType(item.recordType, item.tags.map(x => x.id));
                        navigate(`/${definition.path}/${item.id}`);
                    }}
                    onRemove={handleOnRemove}
                />
            </React.Fragment>
        );
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
                        onClick={handleCloseEdit}
                        startIcon={<CheckIcon/>}
                    >
                        <T keyName="transfer_list.close"/>
                    </Button>
                ) : (
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => setEditState(true)}
                        startIcon={<EditIcon/>}
                    >
                        <T keyName="transfer_list.edit"/>
                    </Button>

                )}
            </ButtonRow>
        </FormSet>
    );
}
