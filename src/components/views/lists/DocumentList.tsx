import React, {FC} from "react";
import {useHistory, useParams} from "react-router-dom";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Paper} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {EntityTypes, SearchResultPropsFragment, useFindConceptQuery} from "../../../generated/types";
import {DocumentEntity} from "../../../domain";
import EntryTable from "../../layout/EntryTable";
import SearchField from "../../forms/SearchInput";
import useQuerying from "../../../hooks/useQuerying";
import usePaging from "../../../hooks/usePaging";
import useBus from 'use-bus';
import {NewEntryAction} from "../../CreateEntrySplitButton";
import DocumentForm from "../forms/DocumentForm";

const useStyles = makeStyles(theme => ({
    paper: {
        padding: theme.spacing(2),
    },
    hint: {
        flexGrow: 1,
        textAlign: "center",
        color: theme.palette.grey[600],
        padding: theme.spacing(5)
    }
}));

const DocumentList: FC = () => {
    const classes = useStyles();

    const history = useHistory();
    const {id} = useParams<{ id?: string }>()

    const querying = useQuerying("", 0, 25);
    const {
        query: [query, setQuery],
        pageSize: [pageSize],
        pageNumber: [pageNumber]
    } = querying;

    const {data, refetch} = useFindConceptQuery({
        variables: {
            input: {
                entityTypeIn: [EntityTypes.XtdExternalDocument],
                query,
                pageSize,
                pageNumber
            }
        }
    });

    const paging = usePaging({ pagination: querying, totalElements: data?.search.totalElements });

    useBus(
        (event) => {
            if (event.type === "new/entry") {
                const action = (event as NewEntryAction);
                return action.entryType === DocumentEntity.entryType;
            }
            return false;
        },
        () => refetch(),
        [refetch]
    );

    const handleOnSelect = (value: SearchResultPropsFragment) => {
        history.push(`/${DocumentEntity.path}/${value.id}`);
    };

    const handleOnDelete = async () => {
        history.push(`/${DocumentEntity.path}`);
        await refetch();
    };

    return (
        <Grid container spacing={1}>
            <Grid item xs={6}>
                <Paper className={classes.paper}>
                    <Typography variant="h5">
                        Alle {DocumentEntity.titlePlural}
                    </Typography>
                    <SearchField value={query} onChange={setQuery}/>
                    <EntryTable
                        data={data?.search.nodes ?? []}
                        pagingOptions={paging}
                        onSelect={handleOnSelect}
                    />
                </Paper>
            </Grid>
            <Grid item xs={6}>
                <Paper className={classes.paper}>
                    <Typography variant="h5">
                        {DocumentEntity.title} bearbeiten
                    </Typography>
                    {id ? (
                        <DocumentForm id={id} onDelete={handleOnDelete}/>
                    ) : (
                        <Typography className={classes.hint} variant="body1">
                            {DocumentEntity.title} in der Listenansicht auswählen um Referenzdokument anzuzeigen.
                        </Typography>
                    )}
                </Paper>
            </Grid>
        </Grid>
    )
}

export default DocumentList;

