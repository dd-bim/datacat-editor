import {
    useDeleteEntryMutation,
    useGetDictionaryEntryQuery,
    DictionaryPropsFragment
} from "../../generated/types";
import { Typography, Button } from "@mui/material";
import { useSnackbar } from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import { DictionaryEntity } from "../../domain";
import FormView, { FormProps } from "./FormView";
import RelatingRecordsFormSet from "../../components/forms/RelatingRecordsFormSet";
import { T } from "@tolgee/react";
import { useNavigate } from "react-router-dom";


function DictionaryForm(props: FormProps<DictionaryPropsFragment>) {
    const { id } = props;
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const { loading, error, data, refetch } = useGetDictionaryEntryQuery({
        fetchPolicy: "network-only",
        variables: { id }
    });
    let entry = data?.node as DictionaryPropsFragment | undefined;

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
console.log("DictionaryForm entry", entry);
    return (
        <FormView>
            <NameFormSet
                catalogEntryId={id}
                names={entry.name.texts}
                refetch={refetch}
            />

            <RelatingRecordsFormSet
                title={<Typography><T keyName="dictionary.related_concepts"/></Typography>}
                emptyMessage={<T keyName="dictionary.no_related_concepts"/>}
                relatingRecords={entry?.concepts ?? []}
            />

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