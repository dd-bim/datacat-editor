import React, {FC} from "react";
import {useDeleteEntryMutation, useGetValueEntryQuery, ValueDetailPropsFragment} from "../../generated/types";
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
import useRelated from "../../hooks/useRelated";
import FormSet, {FormSetTitle} from "../../components/forms/FormSet";

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
        }
    });

    const documentedBy = useRelated({
        catalogEntries: entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? [],
        emptyMessage: "Gruppe ist mit keinem Referenzdokument verlinkt."
    });

    const assignedTo = useRelated({
        catalogEntries: entry?.assignedTo.nodes.map(node => node.relatingMeasure) ?? [],
        emptyMessage: "Wert ist keiner Bemaßung zugewiesen."
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

            <FormSet>
                <FormSetTitle>Referenzen</FormSetTitle>
                {documentedBy}
            </FormSet>

            <FormSet>
                <FormSetTitle>Bemaßungen</FormSetTitle>
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

export default ValueForm;
