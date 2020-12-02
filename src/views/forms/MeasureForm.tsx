import React, {FC} from "react";
import {MeasureDetailPropsFragment, useDeleteEntryMutation, useGetMeasureEntryQuery} from "../../generated/types";
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
import useRelated from "../../hooks/useRelated";

const MeasureForm: FC<FormProps<MeasureDetailPropsFragment>> = (props) => {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();

    // fetch domain model
    const {loading, error, data} = useGetMeasureEntryQuery({
        fetchPolicy: "network-only",
        variables: {id}
    });
    let entry = data?.node as MeasureDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation();

    const documentedBy = useRelated({
        catalogEntries: entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? [],
        emptyMessage: "Bemaßung ist mit keinem Referenzdokument verlinkt."
    });

    const assignedTo = useRelated({
        catalogEntries: entry?.assignedTo.nodes.map(node => node.relatingProperty) || [],
        emptyMessage: "Bemaßung wird durch kein Merkmal referenziert."
    });

    if (loading) return <Typography>Lade Bemaßung..</Typography>;
    if (error || !entry) return <Typography>Es ist ein Fehler aufgetreten..</Typography>;

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar("Bemaßung gelöscht.")
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

            <FormSet title="Merkmale...">
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

export default MeasureForm;
