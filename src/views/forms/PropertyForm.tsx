import React, {FC} from "react";
import {
    ObjectDetailPropsFragment,
    PropertyTreeDocument,
    useDeleteEntryMutation,
    useGetObjectEntryQuery
} from "../../generated/types";
import {Typography} from "@material-ui/core";
import {useSnackbar} from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import Button from "@material-ui/core/Button";
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import {FormProps} from "./FormView";

const PropertyForm: FC<FormProps<ObjectDetailPropsFragment>> = (props) => {
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

    if (loading) return <Typography>Lade Merkmal..</Typography>;
    if (error || !entry) return <Typography>Es ist ein Fehler aufgetreten..</Typography>;

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar("Merkmal gelöscht.")
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

export default PropertyForm;
