import React, {FC} from "react";
import {
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
import useDocumentedBy from "../../hooks/useDocumentedBy";
import {FormSet} from "../../components/forms/FormSet";
import useCollectedBy from "../../hooks/useCollectedBy";
import usePropertyAssignedTo from "../../hooks/usePropertyAssignedTo";

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

    const documentedBy = useDocumentedBy({
        relationships: entry?.documentedBy.nodes || []
    });

    const collectedBy = useCollectedBy({
        relationships: entry?.collectedBy.nodes || [],
        emptyMessage: "In keinen Merkmalsgruppen genutzt."
    });

    const assignedTo = usePropertyAssignedTo({
        relationships: entry?.assignedTo.nodes || [],
        emptyMessage: "Durch keine Klasse genutzt."
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
