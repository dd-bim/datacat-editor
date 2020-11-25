import React, {FC} from "react";
import {
    DocumentsPropsFragment,
    ExternalDocumentDetailPropsFragment,
    GetObjectEntryDocument,
    PropertyTreeDocument,
    useDeleteEntryMutation,
    useGetDocumentEntryQuery
} from "../../generated/types";
import {Typography} from "@material-ui/core";
import {useSnackbar} from "notistack";
import {FormSet} from "../../components/forms/FormSet";
import MetaFormSet from "../../components/forms/MetaFormSet";
import Button from "@material-ui/core/Button";
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import FormView, {FormProps} from "./FormView";
import useDocuments from "../../hooks/useDocuments";

const DocumentForm: FC<FormProps<ExternalDocumentDetailPropsFragment>> = (props) => {
    const {id, onDelete} = props;
    const {enqueueSnackbar} = useSnackbar();

    const baseOptions = {
        refetchQueries: [{query: PropertyTreeDocument}]
    };

    // fetch domain model
    const {loading, error, data} = useGetDocumentEntryQuery({
        fetchPolicy: "network-only",
        variables: {id}
    });
    let entry = data?.node as ExternalDocumentDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntryMutation(baseOptions);

    const documented = useDocuments({
        id,
        relationships: entry?.documents.nodes || [],
        renderLabel(relationship?: DocumentsPropsFragment): React.ReactNode {
            return relationship ? `Konzepte (${relationship.id})` : `Konzepte`;
        },
        refetchQueries: [
            {query: PropertyTreeDocument},
            {query: GetObjectEntryDocument, variables: {id}}
        ]
    });

    if (loading) return <Typography>Lade Referenzdokument..</Typography>;
    if (error || !entry) return <Typography>Es ist ein Fehler aufgetreten..</Typography>;

    const handleOnDelete = async () => {
        await deleteEntry({variables: {id}});
        enqueueSnackbar("Referenzdokument gelöscht.")
        onDelete(entry!);
    };

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

            <VersionFormSet
                id={id}
                versionId={entry.versionId}
                versionDate={entry.versionDate}
            />

            <FormSet
                title="Konzepte"
                description="Konzepte, die durch dieses Referenzdokument beschrieben werden."
            >
                {documented}
            </FormSet>

            <MetaFormSet entry={entry}/>

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon/>}
                onClick={handleOnDelete}
            >
                Löschen
            </Button>
        </FormView>
    );
}

export default DocumentForm;
