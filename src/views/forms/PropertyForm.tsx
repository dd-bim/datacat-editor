import React, {FC} from "react";
import {
    PropertyDetailPropsFragment,
    RelationshipType,
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
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, {FormProps} from "./FormView";
import FormSet, {FormSetTitle} from "../../components/forms/FormSet";
import useRelated from "../../hooks/useRelated";
import {MeasureEntity} from "../../domain";
import TransferListView from "../TransferListView";

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

    const documentedBy = useRelated({
        catalogEntries: entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? [],
        emptyMessage: "Merkmal ist mit keinem Referenzdokument verlinkt."
    });

    const collectedBy = useRelated({
        catalogEntries: entry?.collectedBy.nodes.map(node => node.relatingCollection) || [],
        emptyMessage: "Merkmal kommt in keiner Sammlung vor."
    });

    const assignedTo = useRelated({
        catalogEntries: entry?.assignedTo.nodes.map(node => node.relatingObject) || [],
        emptyMessage: "Merkmal ist keinem Objekt direkt zugewiesen."
    })

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

            <VersionFormSet
                id={id}
                versionId={entry.versionId}
                versionDate={entry.versionDate}
            />

            <TransferListView
                title="Bemaßung des Merkmals"
                relatingItemId={id}
                relationshipType={RelationshipType.AssignsMeasures}
                relationships={assignsMeasuresRelationships}
                searchInput={{
                    entityTypeIn: [MeasureEntity.entityType]
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
                <FormSetTitle>Merkmalgruppen</FormSetTitle>
                {collectedBy}
            </FormSet>

            <FormSet>
                <FormSetTitle>Klassen</FormSetTitle>
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

export default PropertyForm;
