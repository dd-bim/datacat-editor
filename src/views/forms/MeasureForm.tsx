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
import FormSet, {FormSetTitle} from "../../components/forms/FormSet";
import useRelated from "../../hooks/useRelated";
import TransferListView from "../TransferListView";
import {UnitEntity, ValueEntity} from "../../domain";

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

    const documentedBy = useRelated({
        catalogEntries: entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? [],
        emptyMessage: "Bemaßung ist mit keinem Referenzdokument verlinkt."
    });

    const assignedTo = useRelated({
        catalogEntries: entry?.assignedTo.nodes.map(node => node.relatingProperty) || [],
        emptyMessage: "Bemaßung wird durch kein Merkmal referenziert."
    });

    if (loading) return <Typography>Lade Bemaßung..</Typography>;
    if (error || !entry) return <Typography>Es ist ein Fehler aufgetreten..</Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar("Update erfolgreich.");
    };

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar("Bemaßung gelöscht.")
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
                title="Anwendbare Maßeinheiten"
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
                title="Wertebereich der Bemaßung"
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

            <MetaFormSet entry={entry}/>

            <FormSet>
                <FormSetTitle>Referenzen</FormSetTitle>
                {documentedBy}
            </FormSet>

            <FormSet>
                <FormSetTitle>Merkmale</FormSetTitle>
                {assignedTo}
            </FormSet>

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
