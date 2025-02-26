import React, {FC} from "react";
import {
    CollectionDetailPropsFragment,
    RelationshipRecordType,
    useDeleteEntryMutation,
    useGetCollectionEntryQuery
} from "../../generated/types";
import {Button, Typography} from "@mui/material";
import {useSnackbar} from "notistack";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, {FormProps} from "./FormView";
import MetaFormSet from "../../components/forms/MetaFormSet";
import {ClassEntity} from "../../domain";
import TransferListView from "../TransferListView";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";

const DomainGroupForm: FC<FormProps<CollectionDetailPropsFragment>> = (props) => {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();

    // fetch domain model
    const {loading, error, data, refetch} = useGetCollectionEntryQuery({
        fetchPolicy: "network-only",
        variables: {id}
    });
    let entry = data?.node as CollectionDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation({
        update: cache => {
            cache.evict({id: `XtdBag:${id}`});
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

    if (loading) return <Typography>Lade Gruppe..</Typography>;
    if (error || !entry) return <Typography>Es ist ein Fehler aufgetreten..</Typography>;

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar("Gruppe gelöscht.")
        onDelete?.();
    };

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar("Update erfolgreich.");
    }

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
                title={<span>Gruppierte <b>Klassen</b></span>}
                description="Klassen, die dieser Gruppe zugeordnet sind."
                relatingItemId={id}
                relationshipType={RelationshipRecordType.Collects}
                relationships={collectsRelationships}
                searchInput={{tagged: ClassEntity.tags}}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <RelatingRecordsFormSet
                title={<span><b>Referenzdokumente</b>, die diese Gruppe beschreiben</span>}
                emptyMessage={"Durch kein im Datenkatalog hinterlegtes Referenzdokument beschrieben"}
                relatingRecords={entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? []}
            />

            <RelatingRecordsFormSet
                title={<span><b>Fachmodelle</b>, die diese Gruppe anwenden</span>}
                emptyMessage={"Die Gruppe wird durch kein Fachmodell genutzt"}
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

export default DomainGroupForm;
