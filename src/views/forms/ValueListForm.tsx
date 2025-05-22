import {
    ValueListDetailPropsFragment,
    RelationshipRecordType,
    useDeleteEntryMutation,
    useGetValueListEntryQuery
} from "../../generated/types";
import { Typography, Button } from "@mui/material";
import { useSnackbar } from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, { FormProps } from "./FormView";
import TransferListView from "../TransferListView";
import { UnitEntity, ValueEntity, DocumentEntity } from "../../domain";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import { T, useTranslate } from "@tolgee/react";
import { FC } from "react";
import TransferListViewOrderedValues from "../TransferListViewOrderedValues";
import StatusFormSet from "../../components/forms/StatusFormSet";
import DefinitionFormSet from "../../components/forms/DefinitionFormSet";
import ExampleFormSet from "../../components/forms/ExampleFormSet";

const ValueListForm: FC<FormProps<ValueListDetailPropsFragment>> = (props) => {
    const { id, onDelete } = props;
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslate();

    // fetch domain model
    const { loading, error, data, refetch } = useGetValueListEntryQuery({
        fetchPolicy: "network-only",
        variables: { id }
    });
    console.log("ValueListForm error", error);

    let entry = data?.node as ValueListDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation({
        update: cache => {
            cache.evict({ id: `XtdValueList:${id}` });
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    hierarchy: (value, { DELETE }) => DELETE
                }
            });
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    search: (value, { DELETE }) => DELETE
                }
            });
        }
    });

    if (loading) return <Typography><T keyName="valuelist_form.loading">Lade Werteliste..</T></Typography>;
    if (error || !entry) return <Typography><T keyName="valuelist_form.error">Es ist ein Fehler aufgetreten..</T></Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="valuelist_form.update_success">Update erfolgreich.</T>);
    };

    const handleOnDelete = async () => {
        await deleteEntry({ variables: { id } });
        enqueueSnackbar(<T keyName="valuelist_form.delete_success">Werteliste gelöscht.</T>);
        onDelete?.();
    };

    const relatedUnits = entry.unit ? [entry.unit] : [];

    const relatedValues = entry.values ?? [];
    const values = relatedValues.map(rel => ({
        order: rel.order,
        orderedValue: rel.orderedValue
    }));

    const relatedDocuments = entry.referenceDocuments ?? [];
    const descriptions = entry.descriptions?.[0]?.texts ?? [];
    const comments = entry.comments?.[0]?.texts ?? [];

    return (
        <FormView>
            <StatusFormSet
                catalogEntryId={id}
                status={entry.status}
            />

            <NameFormSet
                catalogEntryId={id}
                names={entry.names[0].texts}
            />

            <DescriptionFormSet
                catalogEntryId={id}
                descriptions={descriptions}
            />

            <CommentFormSet
                catalogEntryId={id}
                comments={comments}
            />

            <VersionFormSet
                id={id}
                majorVersion={entry.majorVersion}
                minorVersion={entry.minorVersion}
            />

            <DefinitionFormSet
                catalogEntryId={id}
                definitions={entry.definition?.texts ?? []}
            />

            <ExampleFormSet
                catalogEntryId={id}
                examples={entry.examples?.[0]?.texts ?? []}
            />

            <TransferListView
                title={<span><T keyName="valuelist_form.applicable_units"></T></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.Unit}
                relationships={relatedUnits}
                searchInput={{
                    entityTypeIn: [UnitEntity.recordType]
                    // tagged: UnitEntity.tags
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <TransferListViewOrderedValues
                title={<span><T keyName="valuelist_form.value_range"></T></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.Values}
                relationships={values}
                searchInput={{
                    entityTypeIn: [ValueEntity.recordType],
                    tagged: ValueEntity.tags
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />
            <TransferListView
                title={<span><T keyName={"domain_class_form.reference_documents"} /></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.ReferenceDocuments}
                relationships={relatedDocuments}
                searchInput={{
                    entityTypeIn: [DocumentEntity.recordType],
                    tagged: DocumentEntity.tags
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />
            {/* <RelatingRecordsFormSet
                title={<span><b><T keyName="document.titlePlural">Referenzdokumente</T></b>, <T keyName="valuelist_form.reference_documents">die diese Größe beschreiben</T></span>}
                emptyMessage={t("valuelist_form.no_reference_documents")}
                relatingRecords={entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? []}
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="property.titlePlural">Merkmale</T></b>, <T keyName="valuelist_form.quantified_properties">die durch diese Größe quantifiziert werden</T></span>}
                emptyMessage={t("valuelist_form.no_quantified_properties")}
                relatingRecords={entry?.assignedTo.nodes.map(node => node.relatingProperty) ?? []}
            /> */}

            <MetaFormSet entry={entry} />

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon />}
                onClick={handleOnDelete}
            >
                <T keyName="valuelist_form.delete_button">Löschen</T>
            </Button>
        </FormView>
    );
}

export default ValueListForm;
