import { UnitDetailPropsFragment, useDeleteEntryMutation, useGetUnitEntryQuery } from "../../generated/types";
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
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import { T } from "@tolgee/react";
import StatusFormSet from "../../components/forms/StatusFormSet";
import FormSet, { FormSetTitle } from "../../components/forms/FormSet";
import TransferListView from "../TransferListView";
import { PropertyEntity, DocumentEntity, PropertyGroupEntity, ClassEntity, ValueListEntity, UnitEntity } from "../../domain";
import { RelationshipRecordType } from "../../generated/types";
import DefinitionFormSet from "../../components/forms/DefinitionFormSet";
import ExampleFormSet from "../../components/forms/ExampleFormSet";
import { useNavigate } from "react-router-dom";

const UnitForm = (props: FormProps<UnitDetailPropsFragment>) => {
    const { id } = props;
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const UnitScale: Record<string, string> = {
        XTD_LINEAR: "Linear",
        XTD_LOGARITHMIC: "Logarithmic"
    };

    const UnitBase: Record<string, string> = {
        XTD_ONE: "1",
        XTD_TWO: "2",
        XTD_E: "e",
        XTD_PI: "Pi",
        XTD_TEN: "10"
    };

    // fetch domain model
    const { loading, error, data, refetch } = useGetUnitEntryQuery({
        fetchPolicy: "network-only",
        variables: { id }
    });
    console.log("Unit Error", error);

    let entry = data?.node as UnitDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation({
        update: cache => {
            cache.evict({ id: `XtdUnit:${id}` });
            ["hierarchy", "search"].forEach(field =>
                cache.modify({
                    id: "ROOT_QUERY",
                    fields: {
                        [field]: (value, { DELETE }) => DELETE
                    }
                })
            );
        }
    });

    if (loading) return <Typography><T keyName="unit_form.loading">Lade Maßeinheit..</T></Typography>;
    if (error || !entry) return <Typography><T keyName="error.error">Es ist ein Fehler aufgetreten..</T></Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="update.update_success">Update erfolgreich.</T>);
    };

    const handleOnDelete = async () => {
        await deleteEntry({ variables: { id } });
        enqueueSnackbar(<T keyName="unit_form.delete_success">Maßeinheit gelöscht.</T>);
        navigate(`/${UnitEntity.path}`, { replace: true });
    };

    const relatedDocuments = entry.referenceDocuments ?? [];

    return (
        <FormView>
            <StatusFormSet
                catalogEntryId={id}
                status={entry.status}
            />

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
                    Scala: {entry.scale ? UnitScale[entry.scale] : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Basis: {entry.base ? UnitBase[entry.base] : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Sprache des Erstellers: {entry.languageOfCreator ? entry.languageOfCreator.code : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Herkunftsland: {entry.countryOfOrigin ? entry.countryOfOrigin.name + " (" + entry.countryOfOrigin.code + ")" : "-"}
                </Typography>
            </FormSet>

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
                title={<span><b><T keyName="property.titlePlural"></T></b>, <T keyName="unit_form.assigned_to_properties"></T></span>}
                emptyMessage={<T keyName="unit_form.no_assigned_to_properties" />}
                relatingRecords={entry.properties ?? []}
            />
            <RelatingRecordsFormSet
                title={<span><b><T keyName="valuelist.titlePlural"></T></b>, <T keyName="unit_form.assigned_to_properties"></T></span>}
                emptyMessage={<T keyName="unit_form.no_assigned_to_valueLists" />}
                relatingRecords={entry.valueLists ?? []}
            />

            <MetaFormSet entry={entry} />

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon />}
                onClick={handleOnDelete}
            >
                <T keyName="unit_form.delete_button">Löschen</T>
            </Button>
        </FormView>
    );
}

export default UnitForm;
