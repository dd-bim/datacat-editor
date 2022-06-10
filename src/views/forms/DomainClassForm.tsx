import React from "react";
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
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import {PropertyEntity, PropertyGroupEntity} from "../../domain";
import FormView, {FormProps} from "./FormView";
import TransferListView from "../TransferListView";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import AssignsPropertyWithValuesFormset from "./AssignsPropertyWithValuesFormset";

export default function DomainClassForm(props: FormProps<SubjectDetailPropsFragment>) {
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
                title={<span>Der Klasse <b>{entry?.name}</b> zugewiesene <b>Merkmalsgruppen</b></span>}
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
                title={<span>Direkt zugewiesene <b>Merkmale</b> der Klasse {entry.name}</span>}
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

            <AssignsPropertyWithValuesFormset
                subject={entry}
                onChange={handleOnUpdate}
            />

            <RelatingRecordsFormSet
                title={<span><b>Referenzdokumente</b>, die diese Klasse beschreiben</span>}
                emptyMessage={"Durch kein im Datenkatalog hinterlegtes Referenzdokument beschrieben"}
                relatingRecords={entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? []}
            />

            <RelatingRecordsFormSet
                title={<span><b>Gruppen</b>, die diese Klasse anwenden</span>}
                emptyMessage={"Die Klasse wird durch keine Gruppe genutzt"}
                relatingRecords={entry?.collectedBy.nodes.map(node => node.relatingCollection) ?? []}
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
