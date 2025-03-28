import React, {FC} from "react";
import {
    MeasureDetailPropsFragment,
    RelationshipRecordType,
    useDeleteEntryMutation,
    useGetMeasureEntryQuery
} from "../../generated/types";
import {Typography, Button} from "@mui/material";
import {useSnackbar} from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, {FormProps} from "./FormView";
import TransferListView from "../TransferListView";
import {UnitEntity, ValueEntity} from "../../domain";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import {T, useTranslate} from "@tolgee/react";

const MeasureForm: FC<FormProps<MeasureDetailPropsFragment>> = (props) => {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();
    const {t} = useTranslate();

    // fetch domain model
    const {loading, error, data, refetch} = useGetMeasureEntryQuery({
        fetchPolicy: "network-only",
        variables: {id}
    });
    let entry = data?.node as MeasureDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation({
        update: cache => {
            cache.evict({id: `XtdMeasureWithUnit:${id}`});
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

    if (loading) return <Typography><T keyName="measure_form.loading">Lade Größe..</T></Typography>;
    if (error || !entry) return <Typography><T keyName="measure_form.error">Es ist ein Fehler aufgetreten..</T></Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="measure_form.update_success">Update erfolgreich.</T>);
    };

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar(<T keyName="measure_form.delete_success">Größe gelöscht.</T>);
        onDelete?.();
    };

    const assignsUnitsRelationships = entry.assignedUnits.nodes.map(({id, relatedUnits}) => ({
        relationshipId: id,
        relatedItems: relatedUnits
    }));

    const assignsValuesRelationships = entry.assignedValues.nodes.map(({id, relatedValues}) => ({
        relationshipId: id,
        relatedItems: relatedValues
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
                title={<span><T keyName="measure_form.applicable_units"></T></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.AssignsUnits}
                relationships={assignsUnitsRelationships}
                searchInput={{
                    entityTypeIn: [UnitEntity.recordType]
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <TransferListView
                title={<span><T keyName="measure_form.value_range">Wertebereich</T> <b><T keyName="measure.title">der Größe</T></b></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.AssignsValues}
                relationships={assignsValuesRelationships}
                searchInput={{
                    entityTypeIn: [ValueEntity.recordType]
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="document.titlePlural">Referenzdokumente</T></b>, <T keyName="measure_form.reference_documents">die diese Größe beschreiben</T></span>}
                emptyMessage={t("measure_form.no_reference_documents")}
                relatingRecords={entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? []}
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="property.titlePlural">Merkmale</T></b>, <T keyName="measure_form.quantified_properties">die durch diese Größe quantifiziert werden</T></span>}
                emptyMessage={t("measure_form.no_quantified_properties")}
                relatingRecords={entry?.assignedTo.nodes.map(node => node.relatingProperty) ?? []}
            />

            <MetaFormSet entry={entry}/>

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon/>}
                onClick={handleOnDelete}
            >
                <T keyName="measure_form.delete_button">Löschen</T>
            </Button>
        </FormView>
    );
}

export default MeasureForm;
