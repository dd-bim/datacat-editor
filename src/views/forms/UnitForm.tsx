import React, {FC} from "react";
import {UnitDetailPropsFragment, useDeleteEntryMutation, useGetUnitEntryQuery} from "../../generated/types";
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
import {T, useTranslate} from "@tolgee/react";

const UnitForm: FC<FormProps<UnitDetailPropsFragment>> = (props) => {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();
    const {t} = useTranslate();

    // fetch domain model
    const {loading, error, data} = useGetUnitEntryQuery({
        fetchPolicy: "network-only",
        variables: {id}
    });
    let entry = data?.node as UnitDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation({
        update: cache => {
            cache.evict({id: `XtdUnit:${id}`});
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

    if (loading) return <Typography><T keyName="unit_form.loading">Lade Maßeinheit..</T></Typography>;
    if (error || !entry) return <Typography><T keyName="unit_form.error">Es ist ein Fehler aufgetreten..</T></Typography>;

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar(<T keyName="unit_form.delete_success">Maßeinheit gelöscht.</T>);
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

            <RelatingRecordsFormSet
                title={<span><b><T keyName="document.titlePlural">Referenzdokumente</T></b>, <T keyName="unit_form.reference_documents">die diese Einheit beschreiben</T></span>}
                emptyMessage={t("unit_form.no_reference_documents")}
                relatingRecords={entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? []}
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="measure.titlePlural">Größen</T></b>, <T keyName="unit_form.assigned_measures">denen diese Einheit zugewiesen wurde</T></span>}
                emptyMessage={t("unit_form.no_assigned_measures")}
                relatingRecords={entry?.assignedTo.nodes.map(node => node.relatingMeasure) ?? []}
            />

            <MetaFormSet entry={entry}/>

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon/>}
                onClick={handleOnDelete}
            >
                <T keyName="unit_form.delete_button">Löschen</T>
            </Button>
        </FormView>
    );
}

export default UnitForm;
