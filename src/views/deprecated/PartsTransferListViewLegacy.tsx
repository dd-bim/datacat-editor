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
import { useNavigate } from "react-router-dom";
import { getEntityType } from "../domain";
import { T } from "@tolgee/react";

export type PartsTransferListViewProps = {
    title: React.ReactNode;
    description?: string;
    relatingItemId: string;
    connectingSubjects: SubjectDetailPropsFragment['connectingSubjects'];
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

export default function PartsTransferListView(props: PartsTransferListViewProps) {
    const {
        title,
        description,
        relatingItemId,
        connectingSubjects,
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

    // Filter connectingSubjects to only include "partOf" relationships (inverse)
    const partOfRelationships = useMemo(() => {
        return (connectingSubjects ?? []).filter(
            rel => rel.relationshipType?.name === "partOf"
        );
    }, [connectingSubjects]);

    // Get all connecting subjects (parts) from partOf relationships
    const parts = partOfRelationships
        .map(rel => rel.connectingSubject)
        .filter((subject): subject is SubjectDetailPropsFragment => subject !== null && subject !== undefined);

    const handleOnCreateRelationship = async (toIds: string[]) => {
        // For hasPart, we create a relationship FROM the part TO this class
        // So we need to invert fromId and toIds
        await createRelationship({
            variables: {
                input: {
                    relationshipType: RelationshipRecordType.RelationshipToSubject,
                    fromId: toIds[0], // The part is the source
                    toIds: [relatingItemId], // This class is the target (whole)
                    properties: {
                        relationshipToSubjectProperties: {
                            relationshipType: RelationshipKindEnum.XTD_SCHEMA_LEVEL,
                            name: "partOf"
                        }
                    } as any
                }
            }
        });
        onCreate?.();
    };

    const handleOnDeleteRelationship = async (partId: string) => {
        // Delete the relationship FROM part TO this class
        await deleteRelationship({
            variables: {
                input: {
                    relationshipType: RelationshipRecordType.RelationshipToSubject,
                    fromId: partId, // Part as source
                    toId: relatingItemId, // This class as target (whole)
                    name: "partOf"
                }
            }
        });
        onDelete?.();
    };

    let content: JSX.Element;

    // Filter parts by tags (only show classes)
    const items = parts.filter(
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
                <React.Fragment key="new-part-relationship">
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
                <FormSetNotice key="no-part-relationship">
                    <T keyName="class.no_parts">Keine Teile zugewiesen.</T>
                </FormSetNotice>
            );
        }
    } else {
        content = (
            <React.Fragment key="part-relationship">
                <Typography variant="caption">
                    <T keyName="class.parts_assigned">Zugewiesene Teile</T>
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
