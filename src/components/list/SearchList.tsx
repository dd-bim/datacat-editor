import { CatalogRecordType, SearchInput, useFindItemQuery, useFindDictionariesQuery } from "../../generated/types";
import useDebounce from "../../hooks/useDebounce";
import ItemList, { ItemListProps } from "./ItemList";
import { T } from "@tolgee/react";
import { Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { useMemo, useEffect, useCallback } from "react";
import React from "react";

// Type für react-window v2.x onRowsRendered callback
interface OnRowsRenderedProps {
    visibleRows: {
        startIndex: number;
        stopIndex: number;
    };
    allRows: {
        startIndex: number;
        stopIndex: number;
    };
}

type SearchListProps = Omit<ItemListProps, "items"> & {
    searchTerm: string;
    pageSize?: number;
    searchInput?: SearchInput;
    showDictionaryFilter?: boolean;
    selectedDictionaryId?: string | null;
    onDictionaryFilterChange?: (dictionaryId: string | null) => void;
    onItemCountChange?: (count: number) => void;
    onTotalCountChange?: (totalCount: number) => void;
};

/**
 * Minimal SearchList component - simplified to avoid infinite queries
 */
export default function SearchList(props: SearchListProps) {
    const {
        searchLabel,
        searchTerm = "",
        pageSize = 10,
        searchInput,
        showDictionaryFilter = false,
        selectedDictionaryId = null,
        onDictionaryFilterChange,
        onItemCountChange,
        onTotalCountChange,
        onSearch,
        ...otherProps
    } = props;
    
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    
    // Stabilize the search callback to prevent endless re-renders
    const stableOnSearch = useCallback((term: string) => {
        onSearch?.(term);
    }, [onSearch]);
    
    // Build basic search input
    const input: SearchInput = useMemo(() => ({
        ...searchInput,
        query: debouncedSearchTerm,
    }), [searchInput, debouncedSearchTerm]);

    const isDictionary = searchInput?.entityTypeIn?.includes(CatalogRecordType.Dictionary);
    
    // Load available Dictionaries for filter dropdown ONLY when needed
    const { data: dictionariesData } = useFindDictionariesQuery({
        variables: {
            input: { query: "", pageSize: 100, pageNumber: 0 }
        },
        skip: !showDictionaryFilter,
        fetchPolicy: 'cache-first',
    });
    
    const availableDictionaries = dictionariesData?.findDictionaries?.nodes ?? [];
    
    // Main search query
    let loading, data, error, fetchMore;
    let items;
    let pageInfo;
    
    if (isDictionary) {
        // For dictionaries, use the correct structure
        const { entityTypeIn, ...searchParams } = input;
        
        ({ loading, data, error, fetchMore } = useFindDictionariesQuery({
            variables: {
                input: {
                    ...searchParams,
                    pageSize,
                    pageNumber: 0
                }
            },
            fetchPolicy: 'cache-first',
        }));
        items = data?.findDictionaries?.nodes ?? [];
        pageInfo = data?.findDictionaries?.pageInfo;
    }
    else {
        ({ loading, data, error, fetchMore } = useFindItemQuery({
            variables: {
                input,
                pageSize,
                pageNumber: 0
            },
            fetchPolicy: 'cache-first',
        }));
        items = data?.search.nodes ?? [];
        pageInfo = data?.search.pageInfo;
    }

    // Handle scrolling for pagination
    const handleOnScroll = useCallback(async (visibleRows: OnRowsRenderedProps['visibleRows'], allRows: OnRowsRenderedProps['allRows']) => {
        const { stopIndex } = visibleRows;

        if (pageInfo?.hasNext && stopIndex >= items.length - 5) {
            if (isDictionary) {
                const { entityTypeIn, ...searchParams } = input;
                await fetchMore({
                    variables: {
                        input: {
                            ...searchParams,
                            pageSize,
                            pageNumber: pageInfo.pageNumber + 1
                        }
                    }
                });
            } else {
                await fetchMore({
                    variables: {
                        input,
                        pageSize,
                        pageNumber: pageInfo.pageNumber + 1
                    }
                });
            }
        }
    }, [pageInfo, items.length, fetchMore, input, isDictionary, pageSize]);

    // Map items with proper name formatting
    const mappedItems = useMemo(() => {
        if (!items || items.length === 0) return [];
        
        return items.map(item => ({
            ...item,
            name: typeof item.name === "object" && item.name !== null && "texts" in item.name
                ? (item.name.texts?.[0]?.text ?? "")
                : (typeof item.name === "string" ? item.name : "")
        }));
    }, [items]);

    // Update counts when data changes
    useEffect(() => {
        if (onItemCountChange) {
            onItemCountChange(mappedItems.length);
        }
    }, [mappedItems.length, onItemCountChange]);
    
    useEffect(() => {
        if (onTotalCountChange && data) {
            const totalCount = isDictionary 
                ? data.findDictionaries?.totalElements ?? 0
                : data.search?.totalElements ?? 0;
            onTotalCountChange(totalCount);
        }
    }, [data, isDictionary, onTotalCountChange]);

    // Dictionary filter handlers
    const handleDictionaryFilterChange = useCallback((event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        const dictionaryId = value === "" ? null : value;
        onDictionaryFilterChange?.(dictionaryId);
    }, [onDictionaryFilterChange]);

    const shouldShowDictionaryFilter = showDictionaryFilter && 
        !searchInput?.entityTypeIn?.includes(CatalogRecordType.Dictionary) &&
        !searchInput?.entityTypeIn?.includes(CatalogRecordType.Unit);

    const actuallyLoading = loading && !data;
    
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: 'auto',
            width: '100%',
            mt: 0
        }}>
            {shouldShowDictionaryFilter && (
                <Box sx={{ mb: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel><T keyName="dictionary.filter_label">Filter by Dictionary</T></InputLabel>
                        <Select
                            value={selectedDictionaryId || ""}
                            onChange={handleDictionaryFilterChange}
                            label={<T keyName="dictionary.filter_label">Filter by Dictionary</T>}
                        >
                            <MenuItem value="">
                                <em><T keyName="dictionary.all_items">All Items</T></em>
                            </MenuItem>
                            <MenuItem value="NO_DICTIONARY">
                                <em><T keyName="dictionary.no_dictionary_items">Items without Dictionary</T></em>
                            </MenuItem>
                            {availableDictionaries.map(dict => (
                                <MenuItem key={dict.id} value={dict.id}>
                                    {typeof dict.name === "string"
                                        ? dict.name
                                        : dict.name?.texts?.[0]?.text ?? dict.id}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            )}
            <ItemList
                loading={actuallyLoading}
                items={mappedItems}
                searchLabel={searchLabel || <T keyName="search.search_placeholder"/>}
                searchTerm={searchTerm}
                onSearch={stableOnSearch}
                onItemsRendered={handleOnScroll}
                {...otherProps}
            />
        </Box>
    );
}
