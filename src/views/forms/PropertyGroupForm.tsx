import React, {FC} from "react";
import {
    CollectionDetailPropsFragment,
    RelationshipRecordType,
    useDeleteEntryMutation,
    useGetCollectionEntryQuery
} from "../../generated/types";
import {Typography} from "@mui/material";
import {useSnackbar} from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import Button from "@mui/material/Button";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, {FormProps} from "./FormView";
import {PropertyEntity} from "../../domain";
import TransferListView from "../TransferListView";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import { T, useTranslate } from "@tolgee/react";

const PropertyGroupForm: FC<FormProps<CollectionDetailPropsFragment>> = (props) => {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();
    const { t } = useTranslate();

    // fetch domain model
    const {loading, error, data, refetch} = useGetCollectionEntryQuery({
        fetchPolicy: "network-only",
        variables: {id}
    });
    let entry = data?.node as CollectionDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation({
        update: cache => {
            cache.evict({id: `XtdNest:${id}`});
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    hierarchy: (value, {DELETE}) => DELETE
                }
            });
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    search: (value, {DELETE}) => DELETE
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
        await deleteEntry({variables: {id}});
        enqueueSnackbar(<T keyName="property_group_form.delete_success"></T>);
        onDelete?.();
    };

    const collectsRelationships = entry.collects.nodes.map(({id, relatedThings}) => ({
        relationshipId: id,
        relatedItems: relatedThings
    }));

    return (
        <FormView>
            <NameFormSet
                catalogEntryId={id}
                names={entry.names}
            />

            <DescriptionFormSet
                catalogEntryId={id}
                descriptions={entry.descriptions}
            />

            <CommentFormSet
                catalogEntryId={id}
                comments={entry.comments}
            />

            <VersionFormSet
                id={id}
                versionId={entry.versionId}
                versionDate={entry.versionDate}
            />

            <TransferListView
                title={<span><T keyName="property_group_form.grouped_properties"></T></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.Collects}
                relationships={collectsRelationships}
                searchInput={{entityTypeIn: [PropertyEntity.recordType]}}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="document.titlePlural"></T></b>, <T keyName="property_group_form.reference_documents"></T></span>}
                emptyMessage={t("property_group_form.no_reference_documents", "Durch kein im Datenkatalog hinterlegtes Referenzdokument beschrieben")}
                relatingRecords={entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? []}
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="class.titlePlural">Klassen</T></b>, <T keyName="property_group_form.assigned_classes"></T></span>}
                emptyMessage={t("property_group_form.no_assigned_classes", "Diese Merkmalsgruppe wurde keiner Klasse zugewiesen")}
                relatingRecords={entry?.assignedTo.nodes.map(node => node.relatingObject) ?? []}
            />

            <MetaFormSet entry={entry}/>

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon/>}
                onClick={handleOnDelete}
            >
                <T keyName="property_group_form.delete_button">Löschen</T>
            </Button>
        </FormView>
    );
}

export default PropertyGroupForm;
