import React, {FC} from "react";
import {useHistory, useParams} from "react-router-dom";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Paper} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {EntityTypes, SearchResultPropsFragment, useFindConceptQuery} from "../../generated/types";
import {PropertyGroupEntity} from "../../domain";
import CatalogEntryList from "../../components/CatalogEntryList";
import SearchField from "../../components/forms/SearchInput";
import useQuerying from "../../hooks/useQuerying";
import usePaging from "../../hooks/usePaging";
import PropertyGroupForm from "../forms/PropertyGroupForm";

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

const PropertyGroupList: FC = () => {
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
                entityTypeIn: [EntityTypes.XtdNest],
                tagged: PropertyGroupEntity.tags,
                query,
                pageSize,
                pageNumber
            }
        }
    });

    const paging = usePaging({pagination: querying, totalElements: data?.search.totalElements});

    const handleOnSelect = (value: SearchResultPropsFragment) => {
        history.push(`/${PropertyGroupEntity.path}/${value.id}`);
    };

    const handleOnDelete = async () => {
        history.push(`/${PropertyGroupEntity.path}`);
        await refetch();
    };

    return (
        <Grid container spacing={1}>
            <Grid item xs={5}>
                <Paper className={classes.paper}>
                    <Typography variant="h5">
                        Alle {PropertyGroupEntity.titlePlural}
                    </Typography>
                    <SearchField value={query} onChange={setQuery}/>
                    <CatalogEntryList
                        data={data?.search.nodes ?? []}
                        pagingOptions={paging}
                        onSelect={handleOnSelect}
                    />
                </Paper>
            </Grid>
            <Grid item xs={7}>
                <Paper className={classes.paper}>
                    <Typography variant="h5">
                        {PropertyGroupEntity.title} bearbeiten
                    </Typography>
                    {id ? (
                        <PropertyGroupForm id={id} onDelete={handleOnDelete}/>
                    ) : (
                        <Typography className={classes.hint} variant="body1">
                            {PropertyGroupEntity.title} in der Listenansicht auswählen um Eigenschaften anzuzeigen.
                        </Typography>
                    )}
                </Paper>
            </Grid>
        </Grid>
    )
}

export default PropertyGroupList;

