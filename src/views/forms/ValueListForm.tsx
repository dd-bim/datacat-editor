import {
    ValueListDetailPropsFragment,
    RelationshipRecordType,
    useGetValueListEntryQuery
} from "../../generated/types";
import { useDeleteEntry } from "../../hooks/useDeleteEntry";
import { Typography, Button, Box } from "@mui/material";
import { useSnackbar } from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, { FormProps } from "./FormView";
import TransferListView from "../TransferListView";
import { ValueEntity, PropertyEntity, DocumentEntity, PropertyGroupEntity, ClassEntity, ValueListEntity, UnitEntity } from "../../domain";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import { T } from "@tolgee/react";
import { FC } from "react";
import TransferListViewOrderedValues from "../TransferListViewOrderedValues";
import StatusFormSet from "../../components/forms/StatusFormSet";
import DefinitionFormSet from "../../components/forms/DefinitionFormSet";
import ExampleFormSet from "../../components/forms/ExampleFormSet";
import FormSet, { FormSetTitle } from "../../components/forms/FormSet";
import { useNavigate } from "react-router-dom";
import DictionaryFormSet from "../../components/forms/DictionaryFormSet";

const ValueListForm: FC<FormProps<ValueListDetailPropsFragment>> = (props) => {
    const { id } = props;
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    // fetch value lists
    const { loading, error, data, refetch } = useGetValueListEntryQuery({
        fetchPolicy: "cache-and-network",
        variables: { id }
    });

    let entry = data?.node as ValueListDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntry({
        cacheTypename: 'XtdValueList',
        id
    });

    if (loading) return <Typography><T keyName="valuelist.loading">Lade Werteliste..</T></Typography>;
    if (error || !entry) return <Typography><T keyName="error.error">Es ist ein Fehler aufgetreten..</T></Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="update.update_success">Update erfolgreich.</T>);
    };

    const handleOnDelete = async () => {
        await deleteEntry({ variables: { id } });
        enqueueSnackbar(<T keyName="valuelist.delete_success">Werteliste gelöscht.</T>);
        navigate(`/${ValueListEntity.path}`, { replace: true });
    };

    const relatedUnits = entry.unit ? [entry.unit] : [];

    const relatedValues = entry.values ?? [];
    console.log(relatedValues);
    const values = relatedValues.map(rel => ({
        order: rel.order,
        orderedValue: rel.orderedValue
    }));

    return (
        <FormView>
            <Box display="flex" gap={2}>
                <StatusFormSet
                    catalogEntryId={id}
                    status={entry.status}
                />
                <DictionaryFormSet
                    catalogEntryId={id}
                    dictionaryId={entry.dictionary?.id ?? ""}
                />
            </Box>

            <NameFormSet
                catalogEntryId={id}
                names={entry.names[0].texts}
                refetch={refetch}
            />

            <DescriptionFormSet
                catalogEntryId={id}
                descriptions={entry.descriptions?.[0]?.texts ?? []}
                refetch={refetch}
            />

            <CommentFormSet
                catalogEntryId={id}
                comments={entry.comments?.[0]?.texts ?? []}
                refetch={refetch}
            />

            <VersionFormSet
                id={id}
                majorVersion={entry.majorVersion}
                minorVersion={entry.minorVersion}
            />

            <DefinitionFormSet
                catalogEntryId={id}
                definitions={entry.definition?.texts ?? []}
                refetch={refetch}
            />

            <ExampleFormSet
                catalogEntryId={id}
                examples={entry.examples?.[0]?.texts ?? []}
                refetch={refetch}
            />

            <FormSet>
                <FormSetTitle>
                    <b>
                        <T keyName="document.more_infos" />
                    </b>
                </FormSetTitle>
                <Typography sx={{ mt: 2 }}>
                    <T keyName="create_entry_form.languageOfCreator"/>: {entry.languageOfCreator ? entry.languageOfCreator.code : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <T keyName="valuelist.language_helper"/>: {entry.language ? entry.language.code : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <T keyName="create_entry_form.countryOfOrigin"/>: {entry.countryOfOrigin ? entry.countryOfOrigin.name + " (" + entry.countryOfOrigin.code + ")" : "-"}
                </Typography>
            </FormSet>

            <TransferListView
                title={<span><b><T keyName="unit.titlePlural" /></b><T keyName="valuelist.applicable_units"></T></span>}
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
                title={<span><b><T keyName="value.titlePlural" /></b><T keyName="valuelist.value_range"></T></span>}
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
                title={<span><b><T keyName="document.titlePlural" /></b><T keyName={"concept.reference_documents"} /></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.ReferenceDocuments}
                relationships={entry.referenceDocuments ?? []}
                searchInput={{
                    entityTypeIn: [DocumentEntity.recordType],
                    tagged: DocumentEntity.tags
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <TransferListView
                title={<span><b><T keyName={"concept.similar_concepts"} /></b></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.SimilarTo}
                relationships={entry.similarTo ?? []}
                searchInput={{
                    entityTypeIn: [DocumentEntity.recordType, PropertyEntity.recordType, ValueListEntity.recordType, UnitEntity.recordType, ClassEntity.recordType],
                    tagged: [
                        ...(DocumentEntity.tags ?? []),
                        ...(PropertyEntity.tags ?? []),
                        ...(ValueListEntity.tags ?? []),
                        ...(UnitEntity.tags ?? []),
                        ...(ClassEntity.tags ?? [])
                    ]
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="property.titlePlural" /></b>, <T keyName="valuelist.assigned_properties" /></span>}
                emptyMessage={<T keyName="valuelist.no_assigned_properties" />}
                relatingRecords={entry.properties ?? []}
            />

            <MetaFormSet entry={entry} />

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon />}
                onClick={handleOnDelete}
            >
                <T keyName="delete.delete_button">Löschen</T>
            </Button>
        </FormView>
    );
}

export default ValueListForm;
