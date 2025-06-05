import {
    SubjectDetailPropsFragment,
    useGetSubjectEntryQuery,
    RelationshipRecordType,
    useDeleteEntryMutation
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
import DefinitionFormSet from "../../components/forms/DefinitionFormSet";
import ExampleFormSet from "../../components/forms/ExampleFormSet";
import FormSet, { FormSetTitle } from "../../components/forms/FormSet";
import { useNavigate } from "react-router-dom";

const PropertyGroupForm = (props: FormProps<SubjectDetailPropsFragment>) => {
    const { id } = props;
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    // fetch domain model
    const { loading, error, data, refetch } = useGetSubjectEntryQuery({
        fetchPolicy: "network-only",
        variables: { id }
    });
    let entry = data?.node as SubjectDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation({
        update: cache => {
            cache.evict({ id: `XtdSubject:${id}` });
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

    if (loading) return <Typography><T keyName="property_group_form.loading"></T></Typography>;
    if (error || !entry) return <Typography><T keyName="error.error"></T></Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="property_group_form.update_success"></T>);
    };

    const handleOnDelete = async () => {
        await deleteEntry({ variables: { id } });
        enqueueSnackbar(<T keyName="property_group_form.delete_success"></T>);
        navigate(`/${PropertyGroupEntity.path}`, { replace: true });
    };


    const relatedDocuments = entry.referenceDocuments ?? [];

    const relationships = entry.connectingSubjects ?? [];
    const classes = Array.from(
        new Set(relationships.flatMap(r => r.connectingSubject ?? []))
    );

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
                <Typography sx={{ mt: 2 }}>
                    Sprache des Erstellers: {entry.languageOfCreator ? entry.languageOfCreator.code : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Herkunftsland: {entry.countryOfOrigin ? entry.countryOfOrigin.name + " (" + entry.countryOfOrigin.code + ")" : "-"}
                </Typography>
            </FormSet>

            <TransferListView
                title={<span><T keyName="property_group_form.grouped_properties"></T></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.Properties}
                relationships={entry.properties ?? []}
                searchInput={{entityTypeIn: [PropertyEntity.recordType]}}
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
                title={<span><b><T keyName="class.titlePlural">Klassen</T></b>, <T keyName="property_group_form.assigned_classes"></T></span>}
                emptyMessage={<T keyName="property_group_form.no_assigned_classes" />}
                relatingRecords={classes ?? []}
            />

            <MetaFormSet entry={entry} />

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon />}
                onClick={handleOnDelete}
            >
                <T keyName="property_group_form.delete_button">Löschen</T>
            </Button>
        </FormView>
    );
}

export default PropertyGroupForm;
