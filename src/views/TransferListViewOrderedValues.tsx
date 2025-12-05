import { useMutation } from "@apollo/client/react";
import {
    ObjectPropsFragment,
    RelationshipRecordType,
    SearchInput,
    CreateRelationshipDocument,
    DeleteRelationshipDocument
} from "../generated/graphql";
import React, { JSX, useState } from "react";
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

export type ValueProps = {
    order: number;
    orderedValue: CatalogRecord;
};

export type TransferListViewProps = {
    title: React.ReactNode;
    description?: string;
    relatingItemId: string;
    relationshipType: RelationshipRecordType
    relationships: ValueProps[];
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

export default function TransferListView(props: TransferListViewProps) {
    const {
        title,
        description,
        relatingItemId,
        relationshipType,
        relationships,
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

    const handleOnDeleteRelationship = async (toId: string) => {
        await deleteRelationship({
            variables: {
                input: {
                    relationshipType,
                    fromId: relatingItemId,
                    toId
                }
            }
        });
        onDelete?.();
    };

    let content: JSX.Element;

    const items = relationships
        .map(({ order, orderedValue }) => ({
            ...orderedValue,
            name: `${order != null ? order + ". " : ""}${orderedValue.name ?? orderedValue.id}`,
        }));

    const handleOnAdd = async (item: ObjectPropsFragment) => {
        const relatedIds = items.map(x => x.id);
        relatedIds.push(item.id);
        await handleOnCreateRelationship([item.id]);
    };

    const handleOnRemove = async (item: ObjectPropsFragment) => {
        await handleOnDeleteRelationship(item.id);
    };

    if (items.length === 0) {
        if (editState) {
            content = (
                <React.Fragment key="new-relationship">
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
                        <T keyName="transfer_list.close"/>
                    </Button>
                ) : (
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => setEditState(true)}
                        startIcon={<EditIcon />}
                    >
                        <T keyName="transfer_list.edit"/>
                    </Button>

                )}
            </ButtonRow>
        </FormSet>
    );
}
