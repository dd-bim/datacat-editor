import React, {FC} from "react";
import {UnitDetailPropsFragment, useDeleteEntryMutation, useGetUnitEntryQuery} from "../../generated/types";
import {Typography} from "@material-ui/core";
import {useSnackbar} from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import Button from "@material-ui/core/Button";
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, {FormProps} from "./FormView";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";

const UnitForm: FC<FormProps<UnitDetailPropsFragment>> = (props) => {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();

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
        }
    });

    if (loading) return <Typography>Lade Maßeinheit..</Typography>;
    if (error || !entry) return <Typography>Es ist ein Fehler aufgetreten..</Typography>;

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar("Maßeinheit gelöscht.")
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
                title={<span><b>Referenzdokumente</b>, die diese Einheit beschreiben</span>}
                emptyMessage={"Durch kein im Datenkatalog hinterlegtes Referenzdokument beschrieben"}
                relatingRecords={entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? []}
            />

            <RelatingRecordsFormSet
                title={<span><b>Größen</b>, denen diese Einheit zugewiesen wurde</span>}
                emptyMessage={"Die Einheit wird durch keine Größe genutzt"}
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

export default UnitForm;
