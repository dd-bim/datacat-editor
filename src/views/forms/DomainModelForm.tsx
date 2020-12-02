import React from "react";
import {
    CollectionDetailPropsFragment,
    CollectsPropsFragment,
    GetCollectionEntryDocument,
    PropertyTreeDocument,
    useDeleteEntryMutation,
    useGetCollectionEntryQuery
} from "../../generated/types";
import {Typography} from "@material-ui/core";
import useCollects from "../../hooks/useCollects";
import {useSnackbar} from "notistack";
import {FormSet} from "../../components/forms/FormSet";
import MetaFormSet from "../../components/forms/MetaFormSet";
import Button from "@material-ui/core/Button";
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import {GroupEntity} from "../../domain";
import FormView, {FormProps} from "./FormView";
import useRelated from "../../hooks/useRelated";


function DomainModelForm(props: FormProps<CollectionDetailPropsFragment>) {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();

    const baseOptions = {
        refetchQueries: [{query: PropertyTreeDocument}]
    };

    // fetch domain model
    const {loading, error, data} = useGetCollectionEntryQuery({
        fetchPolicy: "network-only",
        variables: {id}
    });
    let entry = data?.node as CollectionDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation(baseOptions);

    const collectsInputs = useCollects({
        id,
        relationships: entry?.collects.nodes || [],
        optionsSearchInput: {
            pageSize: 100,
            tagged: GroupEntity.tags
        },
        renderLabel(relationship?: CollectsPropsFragment): React.ReactNode {
            return relationship ? `Gruppen (${relationship.id})` : `Gruppen`;
        },
        refetchQueries: [
            {query: PropertyTreeDocument},
            {query: GetCollectionEntryDocument, variables: {id}}
        ]
    });

    const documentedBy = useRelated({
        catalogEntries: entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? [],
        emptyMessage: "Fachmodell ist mit keinem Referenzdokument verlinkt."
    });

    if (loading) return <Typography>Lade Fachmodel..</Typography>;
    if (error || !entry) return <Typography>Es ist ein Fehler aufgetreten..</Typography>;

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar("Fachmodell gelöscht.")
        onDelete(entry!);
    };

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

            <FormSet
                title="Gruppen"
                description="Gruppen, die diesem Fachmodell zugeordnet sind."
            >
                {collectsInputs}
            </FormSet>

            <MetaFormSet entry={entry}/>

            <FormSet title="Referenzen">
                {documentedBy}
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

export default DomainModelForm;
