import React from "react";
import {
    RelationshipRecordType,
    useDeleteEntryMutation,
    useGetSubjectEntryQuery,
    SubjectDetailPropsFragment
} from "../../generated/types";
import {Typography, Button} from "@mui/material";
import {useSnackbar} from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import {GroupEntity} from "../../domain";
import FormView, {FormProps} from "./FormView";
// import TransferListView from "../TransferListView";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import {T, useTranslate} from "@tolgee/react";


function DomainModelForm(props: FormProps<SubjectDetailPropsFragment>) {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();
    const { t } = useTranslate(); // Moved to top level

    // fetch domain model
    const {loading, error, data, refetch} = useGetSubjectEntryQuery({
        fetchPolicy: "network-only",
        variables: {id}
    });
    let entry = data?.node as SubjectDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation({
        update: cache => {
            cache.evict({id: `XtdBag:${id}`});
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

    if (loading) return <Typography><T keyName={"model.loading"}/></Typography>;
    if (error || !entry) return <Typography><T keyName={"error.error"}/></Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="domain_model_form.update_success">Update erfolgreich.</T>);
    }

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar(<T keyName="domain_model_form.delete_success">Fachmodell gelöscht.</T>);
        onDelete?.();
    };

    // const collectsRelationships = entry.collects.nodes.map(({id, relatedThings}) => ({
    //     relationshipId: id,
    //     relatedItems: relatedThings
    // }));

    return (
        <FormView>
            <NameFormSet
                catalogEntryId={id}
                names={entry.names}
            />

            {/* <DescriptionFormSet
                catalogEntryId={id}
                descriptions={entry.descriptions}
            />

            <CommentFormSet
                catalogEntryId={id}
                comments={entry.comments}
            /> */}

            <VersionFormSet
                id={id}
                majorVersion={entry.majorVersion}
                minorVersion={entry.minorVersion}
            />

            {/* <TransferListView
                title={<Typography><T keyName={"model.TransferList"}/><b><T keyName={"model.TransferList2"}/></b></Typography>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.Collects}
                relationships={collectsRelationships}
                searchInput={{
                    entityTypeIn: [GroupEntity.recordType],
                    tagged: GroupEntity.tags
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            /> */}

            {/* <RelatingRecordsFormSet
                title={<Typography><b><T keyName="document.titlePlural"/></b>, <T keyName="domain_model_form.reference_documents">die dieses Fachmodell beschreiben</T></Typography>}
                emptyMessage={t('domain_model_form.no_reference_documents')}
                relatingRecords={entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? []}
            /> */}

            <MetaFormSet entry={entry}/>

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon/>}
                onClick={handleOnDelete}
            >
                <T keyName="domain_model_form.delete_button">Löschen</T>
            </Button>
        </FormView>
    );
}

export default DomainModelForm;