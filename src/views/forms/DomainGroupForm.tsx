import React, {FC} from "react";
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
import {ClassEntity} from "../../domain";
import {FormProps} from "./FormView";

const DomainGroupForm: FC<FormProps<CollectionDetailPropsFragment>> = (props) => {
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
            tagged: ClassEntity.tags
        },
        renderLabel(relationship?: CollectsPropsFragment): React.ReactNode {
            return relationship ? `Klassen (${relationship.id})` : `Klassen`;
        },
        refetchQueries: [
            {query: PropertyTreeDocument},
            {query: GetCollectionEntryDocument, variables: {id}}
        ]
    });

    if (loading) return <Typography>Lade Gruppe..</Typography>;
    if (error || !entry) return <Typography>Es ist ein Fehler aufgetreten..</Typography>;

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar("Gruppe gelöscht.")
        onDelete(entry!);
    };

    return (
        <React.Fragment>
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
                title="Klassen"
                description="Klassen, die dieser Gruppe zugeordnet sind."
            >
                {collectsInputs}
            </FormSet>

            <FormSet title="Verwendet durch..."
                     description="Zeigt auf, welche Konzepte sich auf dieses Konzept beziehen.">
                <ul>
                    {entry.collectedBy.nodes.map(({relatingCollection}) => {
                        return (
                            <li key={relatingCollection.id}>{relatingCollection.id}</li>
                        )
                    })}
                </ul>
            </FormSet>

            <MetaFormSet entry={entry}/>

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon/>}
                onClick={handleOnDelete}
            >
                Löschen
            </Button>
        </React.Fragment>
    );
}

export default DomainGroupForm;
