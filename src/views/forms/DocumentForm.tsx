import {
    ExternalDocumentDetailPropsFragment,
    RelationshipRecordType,
    useDeleteEntryMutation,
    useGetDocumentEntryQuery
} from "../../generated/types";
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
import { PropertyEntity, DocumentEntity, ClassEntity, ValueListEntity, UnitEntity } from "../../domain";
import { T } from "@tolgee/react";
import FormSet, { FormSetTitle } from "../../components/forms/FormSet";
import StatusFormSet from "../../components/forms/StatusFormSet";
import DefinitionFormSet from "../../components/forms/DefinitionFormSet";
import ExampleFormSet from "../../components/forms/ExampleFormSet";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import { useNavigate } from "react-router-dom";
import DictionaryFormSet from "../../components/forms/DictionaryFormSet";

const DocumentForm = (props: FormProps<ExternalDocumentDetailPropsFragment>) => {
    const { id } = props;
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    // fetch documents
    const { loading, error, data, refetch } = useGetDocumentEntryQuery({
        fetchPolicy: "network-only",
        variables: { id }
    });
    let entry = data?.node as ExternalDocumentDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation({
        update: (cache: any) => {
            cache.evict({ id: `XtdExternalDocument:${id}` });
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    hierarchy: (_value: any, { DELETE }: any) => DELETE,
                },
            });
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    search: (_value: any, { DELETE }: any) => DELETE,
                },
            });
        },
    });

    if (loading) return <Typography><T keyName={"document.loading"} /></Typography>;
    if (error || !entry) return <Typography><T keyName={"error.error"} /></Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar("Update erfolgreich.");
    }

    const handleOnDelete = async () => {
        await deleteEntry({ variables: { id } });
        enqueueSnackbar("Referenzdokument gelöscht.")
        navigate(`/${DocumentEntity.path}`, { replace: true });
    };

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
                    <T keyName="document.uri"/>: {entry.documentUri ? (
                        <a href={entry.documentUri} target="_blank" rel="noopener noreferrer">
                            {entry.documentUri}
                        </a>
                    ) : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <T keyName="document.author"/>: {entry.author ? entry.author : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <T keyName="document.publisher"/>: {entry.publisher ? entry.publisher : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <T keyName="document.isbn"/>: {entry.isbn ? entry.isbn : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <T keyName="document.dateOfPublication"/>: {entry.dateOfPublication ? entry.dateOfPublication : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <T keyName="document.languageTag"/>: {entry.languages && entry.languages.length > 0
                        ? entry.languages.map(lang => lang.nativeName).join(", ")
                        : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <T keyName="create_entry_form.languageOfCreator"/>: {entry.languageOfCreator ? entry.languageOfCreator.code : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <T keyName="create_entry_form.countryOfOrigin"/>: {entry.countryOfOrigin ? entry.countryOfOrigin.name + " (" + entry.countryOfOrigin.code + ")" : "-"}
                </Typography>
            </FormSet>

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
                title={<Typography><b><T keyName="concept.titlePlural" /></b><T keyName="document.references"></T></Typography>}
                emptyMessage={<T keyName='document.no_references' />}
                relatingRecords={entry.documents ?? []}
            />

            <MetaFormSet entry={entry} />

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon />}
                onClick={handleOnDelete}
            >
                <T keyName="delete.delete_button"/>
            </Button>
        </FormView>
    );
}

export default DocumentForm;
