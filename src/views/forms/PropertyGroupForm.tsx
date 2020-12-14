import React, {FC} from "react";
import {
    CollectionDetailPropsFragment,
    RelationshipType,
    useDeleteEntryMutation,
    useGetCollectionEntryQuery
} from "../../generated/types";
import {Typography} from "@material-ui/core";
import {useSnackbar} from "notistack";
import FormSet, {FormSetTitle} from "../../components/forms/FormSet";
import MetaFormSet from "../../components/forms/MetaFormSet";
import Button from "@material-ui/core/Button";
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, {FormProps} from "./FormView";
import useRelated from "../../hooks/useRelated";
import {PropertyEntity} from "../../domain";
import TransferListView from "../TransferListView";

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
        }
    });

    const documentedBy = useRelated({
        catalogEntries: entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? [],
        emptyMessage: "Merkmalsgruppe ist mit keinem Referenzdokument verlinkt."
    });

    const collectionAssignedTo = useRelated({
        catalogEntries: entry?.assignedTo.nodes.map(node => node.relatingObject) ?? [],
        emptyMessage: "Merkmalsgruppe ist keiner Klasse zugewiesen."
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

            <VersionFormSet
                id={id}
                versionId={entry.versionId}
                versionDate={entry.versionDate}
            />

            <TransferListView
                title="Gruppierte Merkmale"
                relatingItemId={id}
                relationshipType={RelationshipType.Collects}
                relationships={collectsRelationships}
                searchInput={{entityTypeIn: [PropertyEntity.entityType]}}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <MetaFormSet entry={entry}/>

            <FormSet>
                <FormSetTitle>Referenzen..."</FormSetTitle>
                {documentedBy}
            </FormSet>

            <FormSet>
                <FormSetTitle>Klassen..."</FormSetTitle>
                {collectionAssignedTo}
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

export default PropertyGroupForm;
