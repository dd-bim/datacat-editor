import React, {FC} from "react";
import {useHistory, useParams} from "react-router-dom";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Paper} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import {EntityTypes, SearchResultPropsFragment, useFindConceptQuery} from "../../generated/types";
import {ModelEntity} from "../../domain";
import EntryTable from "../../components/EntryTable";
import DomainModelForm from "../forms/DomainModelForm";
import Grid from "@material-ui/core/Grid";
import SearchField from "../../components/forms/SearchInput";
import useQuerying from "../../hooks/useQuerying";
import usePaging from "../../hooks/usePaging";

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

const DomainModelList: FC = () => {
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
                entityTypeIn: [EntityTypes.XtdBag],
                tagged: ModelEntity.tags,
                query,
                pageSize,
                pageNumber
            }
        }
    });

    const paging = usePaging({ pagination: querying, totalElements: data?.search.totalElements });

    const handleOnSelect = (value: SearchResultPropsFragment) => {
        history.push(`/${ModelEntity.path}/${value.id}`);
    };

    const handleOnDelete = async () => {
        history.push(`/${ModelEntity.path}`);
        await refetch();
    };

    return (
        <Grid container spacing={1}>
            <Grid item xs={5}>
                <Paper className={classes.paper}>
                    <Typography variant="h5">
                        Alle {ModelEntity.titlePlural}
                    </Typography>
                    <SearchField value={query} onChange={setQuery}/>
                    <EntryTable
                        data={data?.search.nodes ?? []}
                        pagingOptions={paging}
                        onSelect={handleOnSelect}
                    />
                </Paper>
            </Grid>
            <Grid item xs={7}>
                <Paper className={classes.paper}>
                    <Typography variant="h5">
                        {ModelEntity.title} bearbeiten
                    </Typography>
                    {id ? (
                        <DomainModelForm id={id} onDelete={handleOnDelete}/>
                    ) : (
                        <Typography className={classes.hint} variant="body1">
                            {ModelEntity.title} in der Listenansicht auswählen um Eigenschaften anzuzeigen.
                        </Typography>
                    )}
                </Paper>
            </Grid>
        </Grid>
    )
}

export default DomainModelList;

