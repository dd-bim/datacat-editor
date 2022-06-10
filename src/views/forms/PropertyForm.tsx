import React, {FC} from "react";
import {
    PropertyDetailPropsFragment,
    RelationshipRecordType,
    useDeleteEntryMutation,
    useGetPropertyEntryQuery
} from "../../generated/types";
import {Typography} from "@material-ui/core";
import {useSnackbar} from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import Button from "@material-ui/core/Button";
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, {FormProps} from "./FormView";
import {MeasureEntity} from "../../domain";
import TransferListView from "../TransferListView";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";

const PropertyForm: FC<FormProps<PropertyDetailPropsFragment>> = (props) => {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();

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
        }
    });

    if (loading) return <Typography>Lade Merkmal..</Typography>;
    if (error || !entry) return <Typography>Es ist ein Fehler aufgetreten..</Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar("Update erfolgreich.");
    };

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar("Merkmal gelöscht.")
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
                title={<span><b>Größe</b> des Merkmals</span>}
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
                title={<span><b>Referenzdokumente</b>, die dieses Merkmal beschreiben</span>}
                emptyMessage={"Durch kein im Datenkatalog hinterlegtes Referenzdokument beschrieben"}
                relatingRecords={entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? []}
            />

            <RelatingRecordsFormSet
                title={<span><b>Merkmalsgruppen</b>, die dieses Merkmal aggregieren</span>}
                emptyMessage={"Das Merkmal wird in keiner Merkmalsgruppe genutzt"}
                relatingRecords={entry?.collectedBy.nodes.map(node => node.relatingCollection) ?? []}
            />

            <RelatingRecordsFormSet
                title={<span><b>Klassen</b>, denen dieses Merkmal direkt zugewiesen wurde</span>}
                emptyMessage={"Das Merkmal wurde keiner Klasse direkt zugewiesen"}
                relatingRecords={entry?.assignedTo.nodes.map(node => node.relatingObject) ?? []}
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

export default PropertyForm;
