import React from "react";
import {
    SubjectDetailPropsFragment,
    useGetSubjectEntryQuery,
    RelationshipRecordType,
    useDeleteEntryMutation
} from "../../generated/types";
import { Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import Button from "@mui/material/Button";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, { FormProps } from "./FormView";
import { PropertyEntity, DocumentEntity } from "../../domain";
import TransferListView from "../TransferListView";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import { T, useTranslate } from "@tolgee/react";
import StatusFormSet from "../../components/forms/StatusFormSet";
import DefinitionFormSet from "../../components/forms/DefinitionFormSet";
import ExampleFormSet from "../../components/forms/ExampleFormSet";

const PropertyGroupForm = (props: FormProps<SubjectDetailPropsFragment>) => {
    const { id, onDelete } = props;
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslate();

    // fetch domain model
    const { loading, error, data, refetch } = useGetSubjectEntryQuery({
        fetchPolicy: "network-only",
        variables: { id }
    });
    let entry = data?.node as SubjectDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation({
        update: cache => {
            cache.evict({ id: `XtdNest:${id}` });
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    hierarchy: (value, { DELETE }) => DELETE
                }
            });
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    search: (value, { DELETE }) => DELETE
                }
            });
        }
    });

    if (loading) return <Typography><T keyName="property_group_form.loading"></T></Typography>;
    if (error || !entry) return <Typography><T keyName="property_group_form.error"></T></Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="property_group_form.update_success"></T>);
    };

    const handleOnDelete = async () => {
        await deleteEntry({ variables: { id } });
        enqueueSnackbar(<T keyName="property_group_form.delete_success"></T>);
        onDelete?.();
    };

    // const collectsRelationships = entry.collects.nodes.map(({id, relatedThings}) => ({
    //     relationshipId: id,
    //     relatedItems: relatedThings
    // }));
    const relatedDocuments = entry.referenceDocuments ?? [];
    const descriptions = entry.descriptions?.[0]?.texts ?? [];
    const comments = entry.comments?.[0]?.texts ?? [];


    return (
        <FormView>
            <StatusFormSet
                catalogEntryId={id}
                status={entry.status}
            />

            <NameFormSet
                catalogEntryId={id}
                names={entry.names[0].texts}
            />

            <DescriptionFormSet
                catalogEntryId={id}
                descriptions={descriptions}
            />

            <CommentFormSet
                catalogEntryId={id}
                comments={comments}
            />

            <VersionFormSet
                id={id}
                majorVersion={entry.majorVersion}
                minorVersion={entry.minorVersion}
            />

            <DefinitionFormSet
                catalogEntryId={id}
                definitions={entry.definition?.texts ?? []}
            />

            <ExampleFormSet
                catalogEntryId={id}
                examples={entry.examples?.[0]?.texts ?? []}
            />

            <TransferListView
                title={<span><T keyName={"domain_class_form.reference_documents"} /></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.ReferenceDocuments}
                relationships={relatedDocuments}
                searchInput={{
                    entityTypeIn: [DocumentEntity.recordType],
                    tagged: DocumentEntity.tags
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />
            {/* <TransferListView
                title={<span><T keyName="property_group_form.grouped_properties"></T></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.}
                relationships={collectsRelationships}
                searchInput={{entityTypeIn: [PropertyEntity.recordType]}}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            /> */}

            {/* <RelatingRecordsFormSet
                title={<span><b><T keyName="document.titlePlural"></T></b>, <T keyName="property_group_form.reference_documents"></T></span>}
                emptyMessage={t("property_group_form.no_reference_documents", "Durch kein im Datenkatalog hinterlegtes Referenzdokument beschrieben")}
                relatingRecords={entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? []}
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="class.titlePlural">Klassen</T></b>, <T keyName="property_group_form.assigned_classes"></T></span>}
                emptyMessage={t("property_group_form.no_assigned_classes", "Diese Merkmalsgruppe wurde keiner Klasse zugewiesen")}
                relatingRecords={entry?.assignedTo.nodes.map(node => node.relatingObject) ?? []}
            /> */}

            <MetaFormSet entry={entry} />

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon />}
                onClick={handleOnDelete}
            >
                <T keyName="property_group_form.delete_button">Löschen</T>
            </Button>
        </FormView>
    );
}

export default PropertyGroupForm;
