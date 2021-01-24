import React, {FC} from "react";
import {
    CollectionDetailPropsFragment,
    RelationshipRecordType,
    useDeleteEntryMutation,
    useGetCollectionEntryQuery
} from "../../generated/types";
import {Button, Typography} from "@material-ui/core";
import {useSnackbar} from "notistack";
import FormSet, {FormSetDescription, FormSetTitle} from "../../components/forms/FormSet";
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, {FormProps} from "./FormView";
import useRelated from "../../hooks/useRelated";
import MetaFormSet from "../../components/forms/MetaFormSet";
import {ClassEntity} from "../../domain";
import TransferListView from "../TransferListView";

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
        }
    });

    const documentedBy = useRelated({
        catalogEntries: entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? [],
        emptyMessage: "Gruppe ist mit keinem Referenzdokument verlinkt."
    });

    const collectedBy = useRelated({
        catalogEntries: entry?.collectedBy.nodes.map(node => node.relatingCollection) ?? [],
        emptyMessage: "Gruppe kommt in keiner Sammlung vor."
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

            <VersionFormSet
                id={id}
                versionId={entry.versionId}
                versionDate={entry.versionDate}
            />

            <TransferListView
                title="Gruppierte Klassen"
                description="Klassen, die dieser Gruppe zugeordnet sind."
                relatingItemId={id}
                relationshipType={RelationshipRecordType.Collects}
                relationships={collectsRelationships}
                searchInput={{tagged: ClassEntity.tags}}
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
                <FormSetTitle>Fachmodelle</FormSetTitle>
                <FormSetDescription>Zeigt auf, welche Fachmodelle diese Gruppe nutzen.</FormSetDescription>
                <div>{collectedBy}</div>
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

export default DomainGroupForm;
