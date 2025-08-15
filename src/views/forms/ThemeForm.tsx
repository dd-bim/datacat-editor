import { FC } from "react";
import {
    RelationshipKindEnum,
    RelationshipRecordType,
    SubjectDetailPropsFragment,
    useGetSubjectEntryQuery,
} from "../../generated/types";
import { useDeleteEntry } from "../../hooks/useDeleteEntry";
import { Button, Typography, Box } from "@mui/material";
import { useSnackbar } from "notistack";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, { FormProps } from "./FormView";
import MetaFormSet from "../../components/forms/MetaFormSet";
import { PropertyEntity, DocumentEntity, ClassEntity, ValueListEntity, UnitEntity, ThemeEntity } from "../../domain";
import TransferListView from "../TransferListView";
import { T } from "@tolgee/react";
import StatusFormSet from "../../components/forms/StatusFormSet";
import DefinitionFormSet from "../../components/forms/DefinitionFormSet";
import ExampleFormSet from "../../components/forms/ExampleFormSet";
import { useNavigate } from "react-router-dom";
import DictionaryFormSet from "../../components/forms/DictionaryFormSet";
import TransferListViewRelationshipToSubject from "../TransferListViewRelationshipToSubject";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";

const ThemeForm: FC<FormProps<SubjectDetailPropsFragment>> = (props) => {
    const { id } = props;
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    // fetch domain themes
    const { loading, error, data, refetch } = useGetSubjectEntryQuery({
        fetchPolicy: "network-only",
        variables: { id }
    });
    let entry = data?.node as SubjectDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntry({
        cacheTypename: 'XtdSubject',
        id
    });

    if (loading) return <Typography><T keyName={"theme.loading"} /></Typography>;
    if (error || !entry) return <Typography><T keyName={"error.error"} /></Typography>;

    const handleOnDelete = async () => {
        await deleteEntry({ variables: { id } });
        enqueueSnackbar(<T keyName="theme.delete_success">Thema gelöscht.</T>)
        navigate(`/${ThemeEntity.path}`, { replace: true });
    };

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="update.update_success">Update erfolgreich.</T>);
    }
    const relatedDocuments = entry.referenceDocuments ?? [];

    const relatedRelations = entry.connectedSubjects ?? [];
    const allTargetSubjects = relatedRelations.flatMap(rel => rel.targetSubjects ?? []);
    const relatedPropertyGroups = {
        relId: relatedRelations[0]?.id ?? null,
        targetSubjects: allTargetSubjects,
        relationshipType: RelationshipKindEnum.XTD_SCHEMA_LEVEL
    };

    const relatingRelations = entry.connectingSubjects ?? [];
    const allRelatingSubjects = relatingRelations.flatMap(rel => rel.connectingSubject ?? []);

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

            <TransferListView
                title={<span><b><T keyName="document.titlePlural" /></b><T keyName={"concept.reference_documents"} /></span>}
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

            <TransferListViewRelationshipToSubject
                title={<span><b><T keyName="class.titlePlural" /></b><T keyName="theme.assigned_classes" /></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.RelationshipToSubject}
                relationships={relatedPropertyGroups}
                searchInput={{
                    entityTypeIn: [ClassEntity.recordType],
                    tagged: ClassEntity.tags
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <TransferListViewRelationshipToSubject
                title={<span><b><T keyName="theme.child_themes"/></b><T keyName="theme.assigned_classes" /></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.RelationshipToSubject}
                relationships={relatedPropertyGroups}
                searchInput={{
                    entityTypeIn: [ThemeEntity.recordType],
                    tagged: ThemeEntity.tags
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="theme.parent_theme"/></b><T keyName="theme.assigning_theme"></T></span>}
                emptyMessage={<T keyName="theme.no_assigning_theme" />}
                relatingRecords={allRelatingSubjects}
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

export default ThemeForm;
