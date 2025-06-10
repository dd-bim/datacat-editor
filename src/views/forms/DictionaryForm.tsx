import React from "react";
import {
    RelationshipRecordType,
    useDeleteEntryMutation,
    useGetDictionaryEntryQuery,
    DictionaryPropsFragment
} from "../../generated/types";
import { Typography, Button } from "@mui/material";
import { useSnackbar } from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import DescriptionFormSet from "../../components/forms/DescriptionFormSet";
import CommentFormSet from "../../components/forms/CommentFormSet";
import VersionFormSet from "../../components/forms/VersionFormSet";
import { GroupEntity, PropertyEntity, DocumentEntity, PropertyGroupEntity, ClassEntity, ValueListEntity, UnitEntity, DictionaryEntity } from "../../domain";
import FormView, { FormProps } from "./FormView";
import TransferListView from "../TransferListView";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import { T } from "@tolgee/react";
import StatusFormSet from "../../components/forms/StatusFormSet";
import DefinitionFormSet from "../../components/forms/DefinitionFormSet";
import ExampleFormSet from "../../components/forms/ExampleFormSet";
import FormSet, { FormSetTitle } from "../../components/forms/FormSet";
import { useNavigate } from "react-router-dom";


function DictionaryForm(props: FormProps<DictionaryPropsFragment>) {
    const { id, onDelete } = props;
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    // fetch domain model
    const { loading, error, data, refetch } = useGetDictionaryEntryQuery({
        fetchPolicy: "network-only",
        variables: { id }
    });
    let entry = data?.node as DictionaryPropsFragment | undefined;
    console.log("DictionaryForm entry", entry);
    console.log("Error", error);
    const [deleteEntry] = useDeleteEntryMutation({
        update: (cache: any) => {
            cache.evict({ id: `XtdDictionary:${id}` });
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

    if (loading) return <Typography><T keyName={"dictionary.loading"} /></Typography>;
    if (error || !entry) return <Typography><T keyName={"error.error"} /></Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="update.update_success">Update erfolgreich.</T>);
    }

    const handleOnDelete = async () => {
        await deleteEntry({ variables: { id } });
        enqueueSnackbar(<T keyName="dictionary.delete_success">Dictionary gelöscht.</T>);
            navigate(`/${DictionaryEntity.path}`, { replace: true });
    };

    // const collectsRelationships = entry.collects.nodes.map(({id, relatedThings}) => ({
    //     relationshipId: id,
    //     relatedItems: relatedThings
    // }));

    return (
        <FormView>
            <NameFormSet
                catalogEntryId={id}
                names={entry.name.texts}
                refetch={refetch}
            />

            {/* <RelatingRecordsFormSet
                title={<Typography><b><T keyName="document.titlePlural"/></b>, <T keyName="domain_model_form.reference_documents">die dieses Dictionary beschreiben</T></Typography>}
                emptyMessage={t('domain_model_form.no_reference_documents')}
                relatingRecords={entry?.documentedBy.nodes.map(node => node.relatingDocument) ?? []}
            /> */}

            <MetaFormSet entry={entry} />

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon />}
                onClick={handleOnDelete}
            >
                <T keyName="domain_model_form.delete_button">Löschen</T>
            </Button>
        </FormView>
    );
}

export default DictionaryForm;