import React from "react";
import {useHistory, useParams} from "react-router-dom";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Paper} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {Entity} from "../domain";
import {SearchInput, SearchResultPropsFragment} from "../generated/types";
import CatalogEntryListView from "./CatalogEntryListView";

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

type CompositeCatalogEntryViewProps = {
    entryType: Entity,
    searchInput: SearchInput,
    renderForm(id: string): React.ReactNode
}

const CompositeCatalogEntryView = (props: CompositeCatalogEntryViewProps) => {
    const {
        entryType: {
            path,
            title,
            titlePlural
        },
        searchInput,
        renderForm
    } = props;
    const classes = useStyles();

    const history = useHistory();
    const {id} = useParams<{ id?: string }>()

    const handleOnSelect = (value: SearchResultPropsFragment) => {
        history.push(`/${path}/${value.id}`);
    };

    return (
        <Grid container spacing={1}>
            <Grid item xs={5}>
                <Paper className={classes.paper}>
                    <CatalogEntryListView
                        title={titlePlural}
                        searchInput={searchInput}
                        selectedIds={id ? [id] : undefined}
                        onSelect={handleOnSelect}
                    />
                </Paper>
            </Grid>
            <Grid item xs={7}>
                <Paper className={classes.paper}>
                    <Typography variant="h5">
                        {title} bearbeiten
                    </Typography>
                    {id ? (
                        renderForm(id)
                    ) : (
                        <Typography className={classes.hint} variant="body1">
                            {title} in der Listenansicht auswählen um Eigenschaften anzuzeigen.
                        </Typography>
                    )}
                </Paper>
            </Grid>
        </Grid>
    )
}

export default CompositeCatalogEntryView;

