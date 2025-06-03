import {
    ExternalDocumentDetailPropsFragment,
    RelationshipRecordType,
    useDeleteEntryMutation,
    useGetDocumentEntryQuery
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
import { PropertyEntity, DocumentEntity, PropertyGroupEntity, ClassEntity, ValueListEntity, UnitEntity } from "../../domain";
import { T, useTranslate } from "@tolgee/react";
import FormSet, { FormSetTitle } from "../../components/forms/FormSet";
import StatusFormSet from "../../components/forms/StatusFormSet";
import DefinitionFormSet from "../../components/forms/DefinitionFormSet";
import ExampleFormSet from "../../components/forms/ExampleFormSet";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";

const DocumentForm = (props: FormProps<ExternalDocumentDetailPropsFragment>) => {
    const { id, onDelete } = props;
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslate(); // Moved to top level

    // fetch domain model
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
        onDelete?.();
    };

    // const relatedDocuments = entry.documents ?? [];

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
                    Uri: {entry.documentUri ? (
                        <a href={entry.documentUri} target="_blank" rel="noopener noreferrer">
                            {entry.documentUri}
                        </a>
                    ) : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Autor: {entry.author ? entry.author : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Herausgeber: {entry.publisher ? entry.publisher : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    ISBN: {entry.isbn ? entry.isbn : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Erscheinungsdatum: {entry.dateOfPublication ? entry.dateOfPublication : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Sprache: {entry.languages && entry.languages.length > 0
                        ? entry.languages.map(lang => lang.nativeName).join(", ")
                        : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Sprache des Erstellers: {entry.languageOfCreator ? entry.languageOfCreator.code : "-"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Herkunftsland: {entry.countryOfOrigin ? entry.countryOfOrigin.name + " (" + entry.countryOfOrigin.code + ")" : "-"}
                </Typography>
            </FormSet>

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
            {/* <TransferListView
                title={<span><T keyName={"document.TransferList"} /><b><T keyName={"document.TransferList2"} /></b></span>}
                relatingItemId={id}
                relationshipType={RelationshipRecordType.ReferenceDocuments}
                relationships={relatedDocuments}
                searchInput={{
                    entityTypeIn: Domain.map(x => x.recordType),
                    idNotIn: [id]
                }}
                onCreate={handleOnUpdate}
                onUpdate={handleOnUpdate}
                onDelete={handleOnUpdate}
            /> */}

            <RelatingRecordsFormSet
                title={<Typography><b><T keyName="document.TransferList2" /></b>, <T keyName="document.references"></T></Typography>}
                emptyMessage={t('document.no_references')}
                relatingRecords={entry.documents ?? []}
            />

            <MetaFormSet entry={entry} />

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon />}
                onClick={handleOnDelete}
            >
                Löschen
            </Button>
        </FormView>
    );
}

export default DocumentForm;
