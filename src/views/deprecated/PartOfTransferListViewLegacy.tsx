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
import { useNavigate } from "react-router-dom";
import { getEntityType } from "../domain";
import { T } from "@tolgee/react";

export type PartOfTransferListViewProps = {
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

export default function PartOfTransferListView(props: PartOfTransferListViewProps) {
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
    const [createRelationship] = useMutation(CreateRelationshipDocument, { update });
    const [deleteRelationship] = useMutation(DeleteRelationshipDocument, { update });

    // Filter connectedSubjects to only include "partOf" relationships
    const partOfRelationships = useMemo(() => {
        return (connectedSubjects ?? []).filter(
            rel => rel.relationshipType?.name === "partOf"
        );
    }, [connectedSubjects]);

    // Get the first partOf relationship (should only be one)
    const partOfRelationship = partOfRelationships[0];
    const relationshipId = partOfRelationship?.id;
    const wholes = partOfRelationship?.targetSubjects ?? [];

    const handleOnCreateRelationship = async (toIds: string[]) => {
        await createRelationship({
            variables: {
                input: {
                    relationshipType: RelationshipRecordType.RelationshipToSubject,
                    fromId: relatingItemId,
                    toIds,
                    properties: {
                        id: relationshipId,
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

    const handleOnDeleteRelationship = async (toId: string) => {
        await deleteRelationship({
            variables: {
                input: {
                    relationshipType: RelationshipRecordType.RelationshipToSubject,
                    fromId: relatingItemId,
                    toId,
                    name: "partOf"
                }
            }
        });
        onDelete?.();
    };

    let content: JSX.Element;

    // Filter wholes by tags (only show classes)
    const items = wholes.filter(
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
                <React.Fragment key="new-partof-relationship">
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
                <FormSetNotice key="no-partof-relationship">
                    <T keyName="class.no_partof">Nicht Teil von anderen Klassen.</T>
                </FormSetNotice>
            );
        }
    } else {
        content = (
            <React.Fragment key="partof-relationship">
                <Typography variant="caption">
                    <T keyName="class.partof_assigned">Teil von</T>
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
