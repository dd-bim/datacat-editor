import {
    ObjectPropsFragment,
    RelationshipRecordType,
    SearchInput,
    useCreateRelationshipMutation,
    useDeleteRelationshipMutation,
    RelationshipKindEnum,
    SubjectDetailPropsFragment
} from "../generated/types";
import React, { JSX, useState, useMemo } from "react";
import TransferList from "../components/list/TransferList";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { Typography, Button } from "@mui/material";
import FormSet, { FormSetDescription, FormSetNotice, FormSetTitle } from "../components/forms/FormSet";
import { styled } from "@mui/material/styles";
import { ApolloCache } from "@apollo/client";
import { CatalogRecord } from "../types";
import { useNavigate } from "react-router-dom";
import { getEntityType } from "../domain";
import { T } from "@tolgee/react";

export type SubClassesTransferListViewProps = {
    title: React.ReactNode;
    description?: string;
    relatingItemId: string;
    connectedSubjects: SubjectDetailPropsFragment['connectedSubjects'];
    searchInput: SearchInput;
    onCreate?(): void;
    onUpdate?(): void;
    onDelete?(): void;
};

const ButtonRow = styled('div')(({ theme }) => ({
    display: "flex",
    justifyContent: "end",
    marginTop: theme.spacing(1)
}));

export default function SubClassesTransferListView(props: SubClassesTransferListViewProps) {
    const {
        title,
        description,
        relatingItemId,
        connectedSubjects,
        searchInput,
        onCreate,
        onDelete,
    } = props;

    const navigate = useNavigate();
    const [editState, setEditState] = useState(false);

    const update = (cache: ApolloCache) => cache.modify({
        id: "ROOT_QUERY",
        fields: {
            hierarchy: (value: any, { DELETE }: any) => DELETE
        }
    });
    const [createRelationship] = useCreateRelationshipMutation({ update });
    const [deleteRelationship] = useDeleteRelationshipMutation({ update });

    // Filter connectedSubjects to only include "specializes" relationships
    const specializesRelationships = useMemo(() => {
        return (connectedSubjects ?? []).filter(
            rel => rel.relationshipType?.name === "specializes"
        );
    }, [connectedSubjects]);

    // Get the first specializes relationship (should only be one)
    const specializesRelationship = specializesRelationships[0];
    const relationshipId = specializesRelationship?.id;
    const subClasses = specializesRelationship?.targetSubjects ?? [];

    const handleOnCreateRelationship = async (toIds: string[]) => {
        await createRelationship({
            variables: {
                input: {
                    relationshipType: RelationshipRecordType.RelationshipToSubject,
                    fromId: relatingItemId,
                    toIds,
                    properties: {
                        id: relationshipId, // Reuse existing relationship or create new one
                        relationshipToSubjectProperties: {
                            relationshipType: RelationshipKindEnum.XTD_SCHEMA_LEVEL,
                            name: "specializes"
                        }
                    } as any
                }
            }
        });
        onCreate?.();
    };

    const handleOnDeleteRelationship = async (toId: string) => {
        await deleteRelationship({
            variables: {
                input: {
                    relationshipType: RelationshipRecordType.RelationshipToSubject,
                    fromId: relatingItemId,
                    toId,
                    name: "specializes"
                }
            }
        });
        onDelete?.();
    };

    let content: JSX.Element;

    // Filter subClasses by tags (only show classes)
    const items = subClasses.filter(
        item => item.tags && item.tags.some(tag => searchInput.tagged?.includes(tag.id))
    );

    const handleOnAdd = async (item: ObjectPropsFragment) => {
        await handleOnCreateRelationship([item.id]);
    };

    const handleOnRemove = async (item: ObjectPropsFragment) => {
        await handleOnDeleteRelationship(item.id);
    };

    if (items.length === 0) {
        if (editState) {
            content = (
                <React.Fragment key="new-subclass-relationship">
                    <Typography variant="caption"><T keyName="transfer_list.new"/></Typography>
                    <TransferList
                        enabled={true}
                        searchInput={searchInput}
                        items={[]}
                        onAdd={async item => {
                            await handleOnCreateRelationship([item.id]);
                        }}
                    />
                </React.Fragment>
            );
        } else {
            content = (
                <FormSetNotice key="no-subclass-relationship">
                    <T keyName="class.no_subclasses">Keine Subklassen zugewiesen.</T>
                </FormSetNotice>
            );
        }
    } else {
        content = (
            <React.Fragment key="subclass-relationship">
                <Typography variant="caption">
                    <T keyName="class.subclasses_assigned">Zugewiesene Subklassen</T>
                </Typography>
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
                        startIcon={<CheckIcon />}
                    >
                        <T keyName="transfer_list.close">Schließen</T>
                    </Button>
                ) : (
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => setEditState(true)}
                        startIcon={<EditIcon />}
                    >
                        <T keyName="transfer_list.edit">Bearbeiten</T>
                    </Button>
                )}
            </ButtonRow>
        </FormSet>
    );
}
