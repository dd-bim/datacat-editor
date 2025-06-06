import {
    PropertyDetailPropsFragment,
    RelationshipRecordType,
    useDeleteEntryMutation,
    useGetPropertyEntryQuery
} from "../../generated/types";
import { Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import Button from "@mui/material/Button";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, { FormProps } from "./FormView";
import { PropertyEntity, DocumentEntity, PropertyGroupEntity, ClassEntity, ValueListEntity, UnitEntity } from "../../domain";
import TransferListView from "../TransferListView";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import { T } from "@tolgee/react";
import StatusFormSet from "../../components/forms/StatusFormSet";
import FormSet, { FormSetTitle } from "../../components/forms/FormSet";
import DefinitionFormSet from "../../components/forms/DefinitionFormSet";
import ExampleFormSet from "../../components/forms/ExampleFormSet";
import { useNavigate } from "react-router-dom";
import DataTypeFormSet from "../../components/forms/DataTypeFormSet";
import Box from "@mui/material/Box";

const PropertyForm = (props: FormProps<PropertyDetailPropsFragment>) => {
    const { id } = props;
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const PropertyDataType: Record<string, string> = {
        XTD_BOOLEAN: "Boolean",
        XTD_DATE: "Date",
        XTD_DATETIME: "DateTime",
        XTD_INTEGER: "Integer",
        XTD_RATIONAL: "Rational",
        XTD_STRING: "String",
        XTD_REAL: "Real",
        XTD_COMPLEX: "Complex"
    };
    // fetch domain model
    const { loading, error, data, refetch } = useGetPropertyEntryQuery({
        fetchPolicy: "network-only",
        variables: { id }
    });
    console.log("Property Error", error);

    let entry = data?.node as PropertyDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation({
        update: cache => {
            cache.evict({ id: `XtdProperty:${id}` });
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

    if (loading) return <Typography><T keyName="property_form.loading">Lade Merkmal..</T></Typography>;
    if (error || !entry) return <Typography><T keyName="error.error">Es ist ein Fehler aufgetreten..</T></Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="update.update_success">Update erfolgreich.</T>);
    };

    const handleOnDelete = async () => {
        await deleteEntry({ variables: { id } });
        enqueueSnackbar(<T keyName="property_form.delete_success">Merkmal gelöscht.</T>);
        navigate(`/${PropertyEntity.path}`, { replace: true });
    };

    return (
        <FormView>
            <Box display="flex" gap={2}>
                <StatusFormSet
                    catalogEntryId={id}
                    status={entry.status}
                />
                <DataTypeFormSet
                    catalogEntryId={id}
                    dataType={entry.dataType}
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
                <Typography sx={{ mt: 1 }}>
                    Datenformat: {entry.dataFormat ? entry.dataFormat : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Sprache des Erstellers: {entry.languageOfCreator ? entry.languageOfCreator.code : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Herkunftsland: {entry.countryOfOrigin ? entry.countryOfOrigin.name + " (" + entry.countryOfOrigin.code + ")" : "-"}
                </Typography>
            </FormSet>

            <TransferListView
                title={<span><b><T keyName="valuelist.title" /></b> <T keyName="property_form.property_measure" /></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.PossibleValues}
                relationships={entry.possibleValues ?? []}
                searchInput={{
                    entityTypeIn: [ValueListEntity.recordType]
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />
            <TransferListView
                title={<span><T keyName={"domain_class_form.reference_documents"} /></span>}
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
                title={<span><b><T keyName="unit.titlePlural" /></b> <T keyName="property_form.property_measure" /></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.Units}
                relationships={entry.units ?? []}
                searchInput={{
                    entityTypeIn: [DocumentEntity.recordType],
                    tagged: UnitEntity.tags
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <TransferListView
                title={<span><T keyName={"domain_class_form.similar_concepts"} /></span>}
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
                title={<span><b><T keyName="propertyGroup.titlePlural">Merkmalsgruppen</T></b>, <T keyName="property_form.aggregating_property_groups">die dieses Merkmal aggregieren</T></span>}
                emptyMessage={<T keyName="property_form.no_aggregating_property_groups" />}
                relatingRecords={entry.subjects ?? []}
                tagged="a27c8e3c-5fd1-47c9-806a-6ded070efae8"
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="class.titlePlural">Klassen</T></b>, <T keyName="property_form.assigned_classes">denen dieses Merkmal direkt zugewiesen wurde</T></span>}
                emptyMessage={<T keyName="property_form.no_assigned_classes" />}
                relatingRecords={entry.subjects ?? []}
                tagged="e9b2cd6d-76f7-4c55-96ab-12d084d21e96"
            />

            <MetaFormSet entry={entry} />

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon />}
                onClick={handleOnDelete}
            >
                <T keyName="property_form.delete_button">Löschen</T>
            </Button>
        </FormView>
    );
}

export default PropertyForm;
