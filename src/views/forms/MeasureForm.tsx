import React, {FC} from "react";
import {
    MeasureDetailPropsFragment,
    RelationshipRecordType,
    useDeleteEntryMutation,
    useGetMeasureEntryQuery
} from "../../generated/types";
import {Typography} from "@material-ui/core";
import {useSnackbar} from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import Button from "@material-ui/core/Button";
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, {FormProps} from "./FormView";
import TransferListView from "../TransferListView";
import {UnitEntity, ValueEntity} from "../../domain";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";

const MeasureForm: FC<FormProps<MeasureDetailPropsFragment>> = (props) => {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();

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
        }
    });

    if (loading) return <Typography>Lade Größe..</Typography>;
    if (error || !entry) return <Typography>Es ist ein Fehler aufgetreten..</Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar("Update erfolgreich.");
    };

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar("Größe gelöscht.")
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

            <VersionFormSet
                id={id}
                versionId={entry.versionId}
                versionDate={entry.versionDate}
            />

            <TransferListView
                title={<span>Auf die Größe anwendbare <b>Maßeinheiten</b></span>}
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
                title={<span><b>Wertebereich</b> der Größe</span>}
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
                title={<span><b>Referenzdokumente</b>, die diese Größe beschreiben</span>}
                emptyMessage={"Durch kein im Datenkatalog hinterlegtes Referenzdokument beschrieben"}
                relatingRecords={entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? []}
            />

            <RelatingRecordsFormSet
                title={<span><b>Merkmale</b>, die durch diese Größe quantifiziert werden</span>}
                emptyMessage={"Die Größe wird durch kein Merkmal genutzt"}
                relatingRecords={entry?.assignedTo.nodes.map(node => node.relatingProperty) ?? []}
            />

            <MetaFormSet entry={entry}/>

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon/>}
                onClick={handleOnDelete}
            >
                Löschen
            </Button>
        </FormView>
    );
}

export default MeasureForm;
