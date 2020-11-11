import React, {FC} from "react";
import {
    CollectionDetailPropsFragment,
    CollectsPropsFragment,
    EntityTypes,
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
import FormView, {FormProps} from "./FormView";
import useDocumentedBy from "../../hooks/useDocumentedBy";
import useCollectionAssignedTo from "../../hooks/useCollectionAssignedTo";

const PropertyGroupForm: FC<FormProps<CollectionDetailPropsFragment>> = (props) => {
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
            entityTypeIn: [EntityTypes.XtdProperty]
        },
        renderLabel(relationship?: CollectsPropsFragment): React.ReactNode {
            return relationship ? `Merkmale (${relationship.id})` : `Merkmale`;
        },
        refetchQueries: [
            {query: PropertyTreeDocument},
            {query: GetCollectionEntryDocument, variables: {id}}
        ]
    });

    const documentedByInputs = useDocumentedBy({
        relationships: entry?.documentedBy.nodes ?? []
    });

    const collectionAssignedTo = useCollectionAssignedTo({
        relationships: entry?.assignedTo.nodes ?? [],
        emptyMessage: "Merkmalsgruppe ist keiner Klasse zugewiesen."
    });

    if (loading) return <Typography>Lade Merkmalsgruppe..</Typography>;
    if (error || !entry) return <Typography>Es ist ein Fehler aufgetreten..</Typography>;

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar("Merkmalsgruppe gelöscht.")
        onDelete(entry!);
    };

    return (
        <FormView>
            <NameFormSet
                entryId={id}
                names={entry.names}
            />

            <DescriptionFormSet
                entryId={id}
                descriptions={entry.descriptions}
            />

            <VersionFormSet
                id={id}
                versionId={entry.versionId}
                versionDate={entry.versionDate}
            />

            <FormSet
                title="Merkmale"
                description="Merkmale, die dieser Merkmalsgruppe zugeordnet sind."
            >
                {collectsInputs}
            </FormSet>

            <MetaFormSet entry={entry}/>

            <FormSet title="Referenzen...">
                {documentedByInputs}
            </FormSet>

            <FormSet title="Klassen...">
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
