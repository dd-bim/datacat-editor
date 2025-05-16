import React, {FC} from "react";
import {
    RelationshipRecordType,
    useDeleteEntryMutation
} from "../../generated/types";
import {Button, Typography} from "@mui/material";
import {useSnackbar} from "notistack";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, {FormProps} from "./FormView";
import MetaFormSet from "../../components/forms/MetaFormSet";
import {ClassEntity} from "../../domain";
// import TransferListView from "../TransferListView";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import {T, useTranslate} from "@tolgee/react";

const DomainGroupForm: FC<FormProps<CollectionDetailPropsFragment>> = (props) => {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();
    const { t } = useTranslate(); // Moved to top level

    // fetch domain model
    const {loading, error, data, refetch} = useGetCollectionEntryQuery({
        fetchPolicy: "network-only",
        variables: {id}
    });
    let entry = data?.node as CollectionDetailPropsFragment | undefined;
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

    if (loading) return <Typography><T keyName={"group.loading"}/></Typography>;
    if (error || !entry) return <Typography><T keyName={"error.error"}/></Typography>;

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar(<T keyName="domain_group_form.delete_success">Gruppe gelöscht.</T>)
        onDelete?.();
    };

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="domain_group_form.update_success">Update erfolgreich.</T>);
    }

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
                majorVersion={entry.majorVersion}
                minorVersion={entry.minorVersion}
            />

            {/* <TransferListView
                title={<span><T keyName={"group.TransferList"}/> <b><T keyName={"group.TransferList2"}/></b></span>}
                description={t("domain_group_form.grouped_classes_description", "Klassen, die dieser Gruppe zugeordnet sind.")}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.Collects}
                relationships={collectsRelationships}
                searchInput={{tagged: ClassEntity.tags}}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="document.titlePlural"/></b>, <T keyName="domain_group_form.reference_documents">die diese Gruppe beschreiben</T></span>}
                emptyMessage={t("domain_group_form.no_reference_documents", "Durch kein im Datenkatalog hinterlegtes Referenzdokument beschrieben")}
                relatingRecords={entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? []}
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="model.titlePlural"/></b>, <T keyName="domain_group_form.domain_models_using_group">die diese Gruppe anwenden</T></span>}
                emptyMessage={t("domain_group_form.no_domain_models_using_group", "Durch kein im Datenkatalog hinterlegtes Referenzdokument beschrieben")}
                relatingRecords={entry?.collectedBy.nodes.map(node => node.relatingCollection) ?? []}
            /> */}

            <MetaFormSet entry={entry}/>

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon/>}
                onClick={handleOnDelete}
            >
                <T keyName="domain_group_form.delete_button">Löschen</T>
            </Button>
        </FormView>
    );
}

export default DomainGroupForm;
