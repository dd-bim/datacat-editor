import Typography from "@material-ui/core/Typography";
import SearchField from "../components/forms/SearchInput";
import CatalogEntryList from "../components/CatalogEntryList";
import React from "react";
import useQuerying from "../hooks/useQuerying";
import {SearchInput, SearchResultPropsFragment, useFindConceptQuery} from "../generated/types";
import usePaging from "../hooks/usePaging";
import Grid from "@material-ui/core/Grid";

type CatalogEntryListViewProps = {
    title: React.ReactNode,
    searchInput: SearchInput,
    selectedIds?: string[],
    onSelect(listItem: SearchResultPropsFragment): void
}

const CatalogEntryListView = (props: CatalogEntryListViewProps) => {
    const {title, searchInput, selectedIds, onSelect} = props;
    const initialQuery = searchInput.query ?? "";
    const initialPageNumber = searchInput.pageNumber ?? 0;
    const initialPageSize = searchInput.pageSize ?? 25;

    const pagination = useQuerying(initialQuery, initialPageNumber, initialPageSize);
    const {
        query: [query, setQuery],
        pageSize: [pageSize],
        pageNumber: [pageNumber]
    } = pagination;

    const {data} = useFindConceptQuery({
        variables: {
            input: {
                ...searchInput,
                query,
                pageSize,
                pageNumber
            }
        }
    });

    const paging = usePaging({
        pagination: pagination,
        totalElements: data?.search.totalElements
    });

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <Typography variant="h5">
                    {title}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <SearchField
                    value={query}
                    onChange={setQuery}
                />
            </Grid>
            <Grid item xs={12}>
                <CatalogEntryList
                    rows={data?.search.nodes ?? []}
                    selectedRowIds={selectedIds}
                    pagingOptions={paging}
                    onSelect={onSelect}
                />
            </Grid>
        </Grid>
    );
}

export default CatalogEntryListView;
