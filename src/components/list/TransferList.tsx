import {SearchInput} from "../../generated/types";
import makeStyles from "@mui/styles/makeStyles";
import React, {useState} from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import FilterableList from "./FilterableList";
import SearchList from "./SearchList";
import {CatalogRecord} from "../../types";

const useStyles = makeStyles(theme => ({
    paper: {
        padding: theme.spacing(1)
    },
    searchBox: {
        padding: theme.spacing(1),
        backgroundColor: theme.palette.grey[100]
    }
}));
type TransferListProps = {
    loading?: boolean
    items: CatalogRecord[];
    enabled: boolean;
    searchInput: SearchInput;
    height?: number;
    onSelect?(item: CatalogRecord): void;
    onAdd?(item: CatalogRecord): void;
    onRemove?(item: CatalogRecord): void;
};

export default function TransferList(props: TransferListProps) {
    const {
        loading,
        items,
        enabled,
        searchInput,
        height,
        onSelect,
        onAdd,
        onRemove,
    } = props;
    const classes = useStyles();

    const [searchTerm, setSearchTerm] = useState("");

    return (
        <Grid container spacing={1}>
            <Grid item xs={enabled ? 6 : 12}>
                <Paper className={classes.paper} variant="outlined">
                    <FilterableList
                        height={height}
                        loading={loading}
                        items={items}
                        onSelect={onSelect}
                        onRemove={enabled && onRemove ? onRemove : undefined}
                    />
                </Paper>
            </Grid>
            {enabled && (
                <Grid item xs={6}>
                    <Paper className={classes.searchBox} variant="outlined">
                        <SearchList
                            height={height}
                            disabledItems={items.map(x => x.id)}
                            searchTerm={searchTerm}
                            searchInput={searchInput}
                            onSearch={setSearchTerm}
                            onAdd={onAdd}
                        />
                    </Paper>
                </Grid>
            )}
        </Grid>
    )
}
