import React, {FC} from "react";
import {
    AssignsMeasuresPropsFragment,
    EntityTypes,
    GetPropertyEntryDocument,
    PropertyDetailPropsFragment,
    PropertyTreeDocument,
    useDeleteEntryMutation,
    useGetPropertyEntryQuery
} from "../../generated/types";
import {Typography} from "@material-ui/core";
import {useSnackbar} from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import Button from "@material-ui/core/Button";
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, {FormProps} from "./FormView";
import {FormSet} from "../../components/forms/FormSet";
import useAssignsMeasures from "../../hooks/useAssignsMeasures";
import useRelated from "../../hooks/useRelated";

const PropertyForm: FC<FormProps<PropertyDetailPropsFragment>> = (props) => {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();

    const baseOptions = {
        refetchQueries: [{query: PropertyTreeDocument}]
    };

    // fetch domain model
    const {loading, error, data} = useGetPropertyEntryQuery({
        fetchPolicy: "network-only",
        variables: {id}
    });
    let entry = data?.node as PropertyDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation(baseOptions);

    const assignedMeasures = useAssignsMeasures({
        id,
        relationships: entry?.assignedMeasures.nodes || [],
        optionsSearchInput: {
            pageSize: 100,
            entityTypeIn: [EntityTypes.XtdMeasureWithUnit]
        },
        renderLabel(relationship?: AssignsMeasuresPropsFragment): React.ReactNode {
            return relationship ? `Bemaßungen (${relationship.id})` : `Bemaßungen`;
        },
        refetchQueries: [
            {query: PropertyTreeDocument},
            {query: GetPropertyEntryDocument, variables: {id}}
        ]
    });

    const documentedBy = useRelated({
        catalogEntries: entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? [],
        emptyMessage: "Merkmal ist mit keinem Referenzdokument verlinkt."
    });

    const collectedBy = useRelated({
        catalogEntries: entry?.collectedBy.nodes.map(node => node.relatingCollection) || [],
        emptyMessage: "Merkmal kommt in keiner Sammlung vor."
    });

    const assignedTo = useRelated({
        catalogEntries: entry?.assignedTo.nodes.map(node => node.relatingObject) || [],
        emptyMessage: "Merkmal ist keinem Objekt direkt zugewiesen."
    })

    if (loading) return <Typography>Lade Merkmal..</Typography>;
    if (error || !entry) return <Typography>Es ist ein Fehler aufgetreten..</Typography>;

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar("Merkmal gelöscht.")
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
                title="Bemaßungen"
                description="Bemaßungen, die diesem Merkmal zugeordnet sind."
            >
                {assignedMeasures}
            </FormSet>

            <MetaFormSet entry={entry}/>

            <FormSet title="Referenzen...">
                {documentedBy}
            </FormSet>

            <FormSet title="Merkmalsgruppen...">
                {collectedBy}
            </FormSet>

            <FormSet title="Klassen...">
                {assignedTo}
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

export default PropertyForm;
