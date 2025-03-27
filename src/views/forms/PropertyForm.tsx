import React, {FC} from "react";
import {
    PropertyDetailPropsFragment,
    RelationshipRecordType,
    useDeleteEntryMutation,
    useGetPropertyEntryQuery
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
import {MeasureEntity} from "../../domain";
import TransferListView from "../TransferListView";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import { T, useTranslate } from "@tolgee/react";

const PropertyForm: FC<FormProps<PropertyDetailPropsFragment>> = (props) => {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();
    const { t } = useTranslate();

    // fetch domain model
    const {loading, error, data, refetch} = useGetPropertyEntryQuery({
        fetchPolicy: "network-only",
        variables: {id}
    });
    let entry = data?.node as PropertyDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation({
        update: cache => {
            cache.evict({id: `XtdProperty:${id}`});
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

    if (loading) return <Typography><T keyName="property_form.loading">Lade Merkmal..</T></Typography>;
    if (error || !entry) return <Typography><T keyName="property_form.error">Es ist ein Fehler aufgetreten..</T></Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="property_form.update_success">Update erfolgreich.</T>);
    };

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar(<T keyName="property_form.delete_success">Merkmal gelöscht.</T>);
        onDelete?.();
    };

    const assignsMeasuresRelationships = entry.assignedMeasures.nodes.map(({id, relatedMeasures}) => ({
        relationshipId: id,
        relatedItems: relatedMeasures
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
                title={<span><b><T keyName="measure.title">Größe</T></b> <T keyName="property_form.property_measure">des Merkmals</T></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.AssignsMeasures}
                relationships={assignsMeasuresRelationships}
                searchInput={{
                    entityTypeIn: [MeasureEntity.recordType]
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="document.titlePlural">Referenzdokumente</T></b>, <T keyName="property_form.reference_documents">die dieses Merkmal beschreiben</T></span>}
                emptyMessage={t("property_form.no_reference_documents", "Durch kein im Datenkatalog hinterlegtes Referenzdokument beschrieben")}
                relatingRecords={entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? []}
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="propertyGroup.titlePlural">Merkmalsgruppen</T></b>, <T keyName="property_form.aggregating_property_groups">die dieses Merkmal aggregieren</T></span>}
                emptyMessage={t("property_form.no_aggregating_property_groups", "Das Merkmal wird in keiner Merkmalsgruppe genutzt")}
                relatingRecords={entry?.collectedBy.nodes.map(node => node.relatingCollection) ?? []}
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="class.titlePlural">Klassen</T></b>, <T keyName="property_form.assigned_classes">denen dieses Merkmal direkt zugewiesen wurde</T></span>}
                emptyMessage={t("property_form.no_assigned_classes", "Das Merkmal wurde keiner Klasse direkt zugewiesen")}
                relatingRecords={entry?.assignedTo.nodes.map(node => node.relatingObject) ?? []}
            />

            <MetaFormSet entry={entry}/>

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon/>}
                onClick={handleOnDelete}
            >
                <T keyName="property_form.delete_button">Löschen</T>
            </Button>
        </FormView>
    );
}

export default PropertyForm;
