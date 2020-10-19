import React, {FC} from "react";
import {useHistory, useParams} from "react-router-dom";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Paper} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {EntityTypes, SearchResultPropsFragment, useFindConceptQuery} from "../../../generated/types";
import {ClassEntity} from "../../../domain";
import EntryTable from "../../layout/EntryTable";
import DomainClassForm from "../forms/DomainClassForm";
import SearchField from "../../forms/SearchInput";
import useQuerying from "../../../hooks/useQuerying";
import usePaging from "../../../hooks/usePaging";
import useBus from 'use-bus';
import {NewEntryAction} from "../../CreateEntrySplitButton";

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

const DomainClassList: FC = () => {
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
                entityTypeIn: [EntityTypes.XtdObject],
                tagged: ClassEntity.tags,
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
                return action.entryType === ClassEntity.entryType;
            }
            return false;
        },
        () => refetch(),
        [refetch]
    );

    const handleOnSelect = (value: SearchResultPropsFragment) => {
        history.push(`/${ClassEntity.path}/${value.id}`);
    };

    const handleOnDelete = async () => {
        history.push(`/${ClassEntity.path}`);
        await refetch();
    };

    return (
        <Grid container spacing={1}>
            <Grid item xs={6}>
                <Paper className={classes.paper}>
                    <Typography variant="h5">
                        Alle {ClassEntity.titlePlural}
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
                        {ClassEntity.title} bearbeiten
                    </Typography>
                    {id ? (
                        <DomainClassForm id={id} onDelete={handleOnDelete}/>
                    ) : (
                        <Typography className={classes.hint} variant="body1">
                            {ClassEntity.title} in der Listenansicht auswählen um Eigenschaften anzuzeigen.
                        </Typography>
                    )}
                </Paper>
            </Grid>
        </Grid>
    )
}

export default DomainClassList;

