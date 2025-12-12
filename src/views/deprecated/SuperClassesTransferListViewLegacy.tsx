import { useMutation } from "@apollo/client/react";
import {
    ObjectPropsFragment,
    RelationshipRecordType,
    SearchInput,
    CreateRelationshipDocument,
    DeleteRelationshipDocument,
    RelationshipKindEnum,
    SubjectDetailPropsFragment
} from "../generated/graphql";
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

export type SuperClassesTransferListViewProps = {
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

export default function SuperClassesTransferListView(props: SuperClassesTransferListViewProps) {
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
    const [createRelationship] = useMutation(CreateRelationshipDocument, { update });
    const [deleteRelationship] = useMutation(DeleteRelationshipDocument, { update });

    // Filter connectingSubjects to only include "specializes" relationships (inverse)
    const specializesRelationships = useMemo(() => {
        return (connectingSubjects ?? []).filter(
            rel => rel.relationshipType?.name === "specializes"
        );
    }, [connectingSubjects]);

    // Get all connecting subjects (superclasses) from specializes relationships
    const superClasses = specializesRelationships
        .map(rel => rel.connectingSubject)
        .filter((subject): subject is SubjectDetailPropsFragment => subject !== null && subject !== undefined);

    const handleOnCreateRelationship = async (toIds: string[]) => {
        // For superclasses, we create a relationship FROM the superclass TO this class
        // So we need to invert fromId and toIds
        await createRelationship({
            variables: {
                input: {
                    relationshipType: RelationshipRecordType.RelationshipToSubject,
                    fromId: toIds[0], // Superclass as source
                    toIds: [relatingItemId], // This class as target
                    properties: {
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

    const handleOnDeleteRelationship = async (superClassId: string) => {
        // Delete the relationship FROM superclass TO this class
        await deleteRelationship({
            variables: {
                input: {
                    relationshipType: RelationshipRecordType.RelationshipToSubject,
                    fromId: superClassId, // Superclass as source
                    toId: relatingItemId, // This class as target
                    name: "specializes"
                }
            }
        });
        onDelete?.();
    };

    let content: JSX.Element;

    // Filter superClasses by tags (only show classes)
    const items = superClasses.filter(
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
                <React.Fragment key="new-superclass-relationship">
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
                <FormSetNotice key="no-superclass-relationship">
                    <T keyName="class.no_superclasses">Keine Superklassen zugewiesen.</T>
                </FormSetNotice>
            );
        }
    } else {
        content = (
            <React.Fragment key="superclass-relationship">
                <Typography variant="caption">
                    <T keyName="class.superclasses_assigned">Zugewiesene Superklassen</T>
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
