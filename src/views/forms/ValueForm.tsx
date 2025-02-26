import React, {FC} from "react";
import {useDeleteEntryMutation, useGetValueEntryQuery, ValueDetailPropsFragment} from "../../generated/types";
import {Typography} from "@mui/material";
import {useSnackbar} from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import Button from "@mui/material/Button";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, {FormProps} from "./FormView";
import ToleranceFormSet from "../../components/forms/ToleranceFormSet";
import NominalValueFormSet from "../../components/forms/NominalValueFormSet";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";

const ValueForm: FC<FormProps<ValueDetailPropsFragment>> = (props) => {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();

    // fetch domain model
    const {loading, error, data} = useGetValueEntryQuery({
        fetchPolicy: "cache-and-network",
        variables: {id}
    });
    let entry = data?.node as ValueDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation({
        update: cache => {
            cache.evict({id: `XtdValue:${id}`});
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    hierarchy: (value, {DELETE}) => DELETE
                }
            });
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    search: (value, {DELETE}) => DELETE
                }
            });
        }
    });

    if (loading) return <Typography>Lade Wert..</Typography>;
    if (error || !entry) return <Typography>Es ist ein Fehler aufgetreten..</Typography>;

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar("Wert gelöscht.")
        onDelete?.();
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

            <CommentFormSet
                catalogEntryId={id}
                comments={entry.comments}
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

            <RelatingRecordsFormSet
                title={<span><b>Referenzdokumente</b>, die diesen Wert beschreiben</span>}
                emptyMessage={"Durch kein im Datenkatalog hinterlegtes Referenzdokument beschrieben"}
                relatingRecords={entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? []}
            />

            <RelatingRecordsFormSet
                title={<span><b>Größen</b>, denen dieser Wert zugewiesen wurde</span>}
                emptyMessage={"Der Wert wurde keiner Größe zugewiesen"}
                relatingRecords={entry?.assignedTo.nodes.map(node => node.relatingMeasure) ?? []}
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
