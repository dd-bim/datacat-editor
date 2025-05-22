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
import { Domain } from "../../domain";
import { T } from "@tolgee/react";
import FormSet, { FormSetTitle } from "../../components/forms/FormSet";

const DocumentForm = (props: FormProps<ExternalDocumentDetailPropsFragment>) => {
    const { id, onDelete } = props;
    const { enqueueSnackbar } = useSnackbar();

    // fetch domain model
    const { loading, error, data, refetch } = useGetDocumentEntryQuery({
        fetchPolicy: "network-only",
        variables: { id }
    });
    let entry = data?.node as ExternalDocumentDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation({
        update: cache => {
            cache.evict({ id: `XtdExternalDocument:${id}` });
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

    const relatedDocuments = entry.documents ?? [];

    const descriptions = entry.descriptions?.[0]?.texts ?? [];
    const comments = entry.comments?.[0]?.texts ?? [];

    return (
        <FormView>
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
            </FormSet>

            <TransferListView
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
