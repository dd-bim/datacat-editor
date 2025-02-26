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

const PropertyGroupForm: FC<FormProps<CollectionDetailPropsFragment>> = (props) => {
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

    if (loading) return <Typography>Lade Merkmalsgruppe..</Typography>;
    if (error || !entry) return <Typography>Es ist ein Fehler aufgetreten..</Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar("Update erfolgreich.");
    };

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar("Merkmalsgruppe gelöscht.")
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
                title={<span>In der Merkmalsgruppe gruppierte <b>Merkmale</b></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.Collects}
                relationships={collectsRelationships}
                searchInput={{entityTypeIn: [PropertyEntity.recordType]}}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <RelatingRecordsFormSet
                title={<span><b>Referenzdokumente</b>, die diese Merkmalsgruppe beschreiben</span>}
                emptyMessage={"Durch kein im Datenkatalog hinterlegtes Referenzdokument beschrieben"}
                relatingRecords={entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? []}
            />

            <RelatingRecordsFormSet
                title={<span><b>Klassen</b>, denen diese Merkmalsgruppe zugewiesen wurde</span>}
                emptyMessage={"Diese Merkmalsgruppe wurde keiner Klasse zugewiesen"}
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

export default PropertyGroupForm;
