import React, {FC} from "react";
import {
    RelationshipRecordType,
    SubjectDetailPropsFragment,
    useDeleteEntryMutation,
    useGetSubjectEntryQuery
} from "../../generated/types";
import {Typography} from "@material-ui/core";
import {useSnackbar} from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import Button from "@material-ui/core/Button";
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import {PropertyEntity, PropertyGroupEntity, ValueEntity} from "../../domain";
import FormView, {FormProps} from "./FormView";
import TransferListView from "../TransferListView";
import AssignsPropertyWithValuesTransferListView from "../AssignsPropertyWithValuesTransferListView";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";

const DomainClassForm: FC<FormProps<SubjectDetailPropsFragment>> = (props) => {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();

    // fetch domain model
    const {loading, error, data, refetch} = useGetSubjectEntryQuery({
        fetchPolicy: "network-only",
        variables: {id}
    });
    let entry = data?.node as SubjectDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation({
        update: cache => {
            cache.evict({id: `XtdSubject:${id}`});
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    hierarchy: (value, {DELETE}) => DELETE
                }
            });
        }
    });

    if (loading) return <Typography>Lade Klasse..</Typography>;
    if (error || !entry) return <Typography>Es ist ein Fehler aufgetreten..</Typography>;

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar("Klasse gelöscht.")
        onDelete?.();
    };

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar("Update erfolgreich.");
    }

    const assignsCollectionsRelationships = entry.assignedCollections.nodes.map(({id, relatedCollections}) => ({
        relationshipId: id,
        relatedItems: relatedCollections
    }));

    const assignsPropertiesRelationships = entry.assignedProperties.nodes.map(({id, relatedProperties}) => ({
        relationshipId: id,
        relatedItems: relatedProperties
    }));

    const assignsPropertyWithValuesRelationships = entry.assignedPropertiesWithValues.nodes.map(({id, relatedProperty, relatedValues}) => ({
        relationshipId: id, relatedProperty, relatedValues
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
                title="Zugewiesene Merkmalgruppen"
                relatingItemId={id}
                relationshipType={RelationshipRecordType.AssignsCollections}
                relationships={assignsCollectionsRelationships}
                searchInput={{
                    entityTypeIn: [PropertyGroupEntity.recordType],
                    tagged: PropertyGroupEntity.tags
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <TransferListView
                title={`Direkt zugewiesene Merkmale von ${entry.name}`}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.AssignsProperties}
                relationships={assignsPropertiesRelationships}
                searchInput={{
                    entityTypeIn: [PropertyEntity.recordType],
                    tagged: PropertyEntity.tags
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <AssignsPropertyWithValuesTransferListView
                title="Gültige Wertelistenwerte, der zugewiesenen Merkmale"
                relatingItemId={id}
                assignedProperties={entry.properties}
                relationships={assignsPropertyWithValuesRelationships}
                searchInput={{
                    entityTypeIn: [ValueEntity.recordType],
                    tagged: ValueEntity.tags
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />


            <MetaFormSet entry={entry}/>

            <RelatingRecordsFormSet
                title={"Zugewiesene Referenzdokumente"}
                emptyMessage={"Durch kein Referenzdokument beschrieben"}
                relatingRecords={entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? []}
            />

            <RelatingRecordsFormSet
                title={"Zugewiesen Gruppen"}
                emptyMessage={"In keiner Gruppe aufgeführt"}
                relatingRecords={entry?.collectedBy.nodes.map(node => node.relatingCollection) ?? []}
            />

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

export default DomainClassForm;
