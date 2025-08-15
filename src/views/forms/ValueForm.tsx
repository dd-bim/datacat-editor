import React, { FC } from "react";
import { ValueDetailPropsFragment, useGetValueEntryQuery } from "../../generated/types";
import { useDeleteEntry } from "../../hooks/useDeleteEntry";
import { Box, Typography } from "@mui/material";
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
import { useNavigate } from "react-router-dom";
import { ValueEntity } from "../../domain";
import NominalValueFormSet from "../../components/forms/NominalValueFormSet";
import DictionaryFormSet from "../../components/forms/DictionaryFormSet";

const ValueForm: FC<FormProps<ValueDetailPropsFragment>> = (props) => {
    const { id } = props;
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    // fetch value
    const { loading, error, data, refetch } = useGetValueEntryQuery({
        fetchPolicy: "network-only",
        variables: { id }
    });
    console.log("ValueForm error", error);

    let entry = data?.node as ValueDetailPropsFragment | undefined;
    const [deleteEntry] = useDeleteEntry({
        cacheTypename: 'XtdValue',
        id
    });

    if (loading) return <Typography><T keyName="value.loading">Lade Wert..</T></Typography>;
    if (error || !entry) return <Typography><T keyName="error.error">Es ist ein Fehler aufgetreten..</T></Typography>;

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="update.update_success">Update erfolgreich.</T>);
    };

    const handleOnDelete = async () => {
        await deleteEntry({ variables: { id } });
        enqueueSnackbar(<T keyName="value.delete_success">Wert gelöscht.</T>);
        navigate(`/${ValueEntity.path}`, { replace: true });
    };

    const orderedValues = entry.orderedValues ?? [];
    const lists = Array.from(
        new Set(orderedValues.flatMap(v => v.valueLists ?? []))
    );

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

            {/* <DescriptionFormSet
                catalogEntryId={id}
                descriptions={descriptions}
            /> */}

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

            <NominalValueFormSet
                catalogEntryId={id}
                nominalValue={entry.nominalValue}
                refetch={refetch}
            />

            <RelatingRecordsFormSet
                title={<span><b><T keyName="valuelist.titlePlural" /></b>, <T keyName="value.assigned_valuelists" /></span>}
                emptyMessage={<T keyName="value.no_assigned_valuelists" />}
                relatingRecords={lists ?? []}
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

export default ValueForm;
