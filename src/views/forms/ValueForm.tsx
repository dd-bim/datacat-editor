import React, {FC} from "react";
import {
    PropertyTreeDocument,
    useDeleteEntryMutation,
    useGetValueEntryQuery,
    ValueDetailPropsFragment
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
import ToleranceFormSet from "../../components/forms/ToleranceFormSet";
import NominalValueFormSet from "../../components/forms/NominalValueFormSet";

const ValueForm: FC<FormProps<ValueDetailPropsFragment>> = (props) => {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();

    const baseOptions = {
        refetchQueries: [{query: PropertyTreeDocument}]
    };

    // fetch domain model
    const {loading, error, data} = useGetValueEntryQuery({
        fetchPolicy: "cache-and-network",
        variables: {id}
    });
    let entry = data?.node as ValueDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation(baseOptions);

    if (loading) return <Typography>Lade Wert..</Typography>;
    if (error || !entry) return <Typography>Es ist ein Fehler aufgetreten..</Typography>;

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar("Wert gelöscht.")
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

            <NominalValueFormSet
                id={id}
                valueRole={entry.valueRole}
                valueType={entry.valueType}
                nominalValue={entry.nominalValue}
            />

            <ToleranceFormSet
                id={id}
                toleranceType={entry.toleranceType}
                lowerTolerance={entry.lowerTolerance}
                upperTolerance={entry.upperTolerance}
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
        </FormView>
    );
}

export default ValueForm;
