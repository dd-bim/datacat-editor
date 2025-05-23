import React, {FC} from "react";
import {ValueDetailPropsFragment, useDeleteEntryMutation, useGetValueEntryQuery} from "../../generated/types";
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
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import NominalValueFormSet from "../../components/forms/NominalValueFormSet";
import ToleranceFormSet from "../../components/forms/ToleranceFormSet";
import {T, useTranslate} from "@tolgee/react";

const ValueForm: FC<FormProps<ValueDetailPropsFragment>> = (props) => {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();
    const {t} = useTranslate();

    // fetch value
    const {loading, error, data, refetch} = useGetValueEntryQuery({
        fetchPolicy: "network-only",
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

    if (loading) return <Typography><T keyName="value_form.loading">Lade Wert..</T></Typography>;
    if (error || !entry) return <Typography><T keyName="value_form.error">Es ist ein Fehler aufgetreten..</T></Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="value_form.update_success">Update erfolgreich.</T>);
    };

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar(<T keyName="value_form.delete_success">Wert gelöscht.</T>);
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
                title={<span><b><T keyName="document.titlePlural">Referenzdokumente</T></b>, <T keyName="value_form.reference_documents">die diesen Wert beschreiben</T></span>}
                emptyMessage={t("value_form.no_reference_documents")}
                relatingRecords={entry?.documentedBy?.nodes.map(node => node.relatingDocument) ?? []}
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="measure.titlePlural">Größen</T></b>, <T keyName="value_form.assigned_measures">denen dieser Wert zugewiesen wurde</T></span>}
                emptyMessage={t("value_form.no_assigned_measures")}
                relatingRecords={entry?.assignedTo?.nodes.map(node => node.relatingMeasure) ?? []}
            />

            <MetaFormSet entry={entry}/>

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon/>}
                onClick={handleOnDelete}
            >
                <T keyName="value_form.delete_button">Löschen</T>
            </Button>
        </FormView>
    );
}

export default ValueForm;
