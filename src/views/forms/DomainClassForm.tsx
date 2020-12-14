import React, {FC} from "react";
import {
    RelationshipType,
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
import {PropertyEntity, PropertyGroupEntity} from "../../domain";
import FormView, {FormProps} from "./FormView";
import useRelated from "../../hooks/useRelated";
import TransferListView from "../TransferListView";
import FormSet, {FormSetTitle, useFieldSetStyles} from "../../components/forms/FormSet";

const DomainClassForm: FC<FormProps<SubjectDetailPropsFragment>> = (props) => {
    const {id, onDelete} = props;
    const classes = useFieldSetStyles();
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

    const documentedBy = useRelated({
        catalogEntries: entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? [],
        emptyMessage: "Keine Referenzdokument verlinkt."
    });

    const collectedBy = useRelated({
        catalogEntries: entry?.collectedBy.nodes.map(node => node.relatingCollection) ?? [],
        emptyMessage: "Klasse kommt in keiner Sammlung vor."
    })


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

            <VersionFormSet
                id={id}
                versionId={entry.versionId}
                versionDate={entry.versionDate}
            />

            <TransferListView
                title="Zugewiesene Merkmalgruppen"
                relatingItemId={id}
                relationshipType={RelationshipType.AssignsCollections}
                relationships={assignsCollectionsRelationships}
                searchInput={{
                    entityTypeIn: [PropertyGroupEntity.entityType],
                    tagged: PropertyGroupEntity.tags
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <TransferListView
                title="Direkt zugewiesene Merkmale"
                relatingItemId={id}
                relationshipType={RelationshipType.AssignsProperties}
                relationships={assignsPropertiesRelationships}
                searchInput={{
                    entityTypeIn: [PropertyEntity.entityType],
                    tagged: PropertyEntity.tags
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <MetaFormSet entry={entry}>
                <FormSet>
                    <FormSetTitle className={classes.gutterBottom}>Referenzen</FormSetTitle>
                    {documentedBy}
                </FormSet>

                <FormSet>
                    <FormSetTitle className={classes.gutterBottom}>Gruppen</FormSetTitle>
                    {collectedBy}
                </FormSet>
            </MetaFormSet>

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
