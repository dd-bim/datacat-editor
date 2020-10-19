import React, {FC} from "react";
import {
    AssignsCollectionsPropsFragment,
    AssignsPropertiesPropsFragment,
    EntityTypes,
    GetObjectEntryDocument,
    ObjectDetailPropsFragment,
    PropertyTreeDocument,
    useDeleteEntryMutation,
    useGetObjectEntryQuery
} from "../../../generated/types";
import {Typography} from "@material-ui/core";
import {useSnackbar} from "notistack";
import {FormSet} from "../../forms/FormSet";
import MetaFormSet from "../../forms/MetaFormSet";
import Button from "@material-ui/core/Button";
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import NameFormSet from "../../forms/NameFormSet";
import DescriptionFormSet from "../../forms/DescriptionFormSet";
import VersionFormSet from "../../forms/VersionFormSet";
import useAssignsCollections from "../../../hooks/useAssignsCollections";
import useAssignsProperties from "../../../hooks/useAssignsProperties";
import {PropertyGroupEntity} from "../../../domain";
import {FormProps} from "./FormView";

const DomainClassForm: FC<FormProps<ObjectDetailPropsFragment>> = (props) => {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();

    const baseOptions = {
        refetchQueries: [{query: PropertyTreeDocument}]
    };

    // fetch domain model
    const {loading, error, data} = useGetObjectEntryQuery({
        fetchPolicy: "network-only",
        variables: {id}
    });
    let entry = data?.node as ObjectDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation(baseOptions);

    const assignedCollections = useAssignsCollections({
        id,
        relationships: entry?.assignedCollections.nodes || [],
        optionsSearchInput: {
            pageSize: 100,
            tagged: PropertyGroupEntity.tags
        },
        renderLabel(relationship?: AssignsCollectionsPropsFragment): React.ReactNode {
            return relationship ? `Merkmalsgruppen (${relationship.id})` : `Merkmalsgruppen`;
        },
        refetchQueries: [
            {query: PropertyTreeDocument},
            {query: GetObjectEntryDocument, variables: {id}}
        ]
    });

    const assignedProperties = useAssignsProperties({
        id,
        relationships: entry?.assignedProperties.nodes || [],
        optionsSearchInput: {
            pageSize: 100,
            entityTypeIn: [EntityTypes.XtdProperty]
        },
        renderLabel(relationship?: AssignsPropertiesPropsFragment): React.ReactNode {
            return relationship ? `Merkmale (${relationship.id})` : `Merkmale`;
        },
        refetchQueries: [
            {query: PropertyTreeDocument},
            {query: GetObjectEntryDocument, variables: {id}}
        ]
    });

    if (loading) return <Typography>Lade Klasse..</Typography>;
    if (error || !entry) return <Typography>Es ist ein Fehler aufgetreten..</Typography>;

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar("Klasse gelöscht.")
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
                title="Merkmalsgruppen"
                description="Merkmalsgruppen, die dieser Klasse zugeordnet sind."
            >
                {assignedCollections}
            </FormSet>

            <FormSet
                title="Merkmale"
                description="Merkmale, die dieser Klasse direkt zugeordnet sind."
            >
                {assignedProperties}
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

export default DomainClassForm;
