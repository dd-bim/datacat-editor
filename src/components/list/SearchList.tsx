import { CatalogRecordType, SearchInput, useFindItemQuery, useFindDictionariesQuery } from "../../generated/types";
import { NetworkStatus } from "@apollo/client";
import useDebounce from "../../hooks/useDebounce";
import ItemList, { ItemListProps } from "./ItemList";
import { T } from "@tolgee/react";
import { Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useMemo, useEffect, useCallback, useRef } from "react";
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
        pageSize = 20, // Optimale Balance: Gute Performance + Nicht zu langsam
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
    let loading, data, error, fetchMore, networkStatus;
    let items;
    let pageInfo;
    let isLoadingMore = false;
    
    if (isDictionary) {
        // For dictionaries, use the correct structure
        const { entityTypeIn, ...searchParams } = input;
        
        ({ loading, data, error, fetchMore, networkStatus } = useFindDictionariesQuery({
            variables: {
                input: {
                    ...searchParams,
                    pageSize,
                    pageNumber: 0
                }
            },
            fetchPolicy: 'cache-first',
            notifyOnNetworkStatusChange: true, // Für fetchMore Loading-State
        }));
        items = data?.findDictionaries?.nodes ?? [];
        pageInfo = data?.findDictionaries?.pageInfo;
        isLoadingMore = networkStatus === 3; // NetworkStatus.fetchMore
    }
    else {
        ({ loading, data, error, fetchMore, networkStatus } = useFindItemQuery({
            variables: {
                input,
                pageSize,
                pageNumber: 0
            },
            fetchPolicy: 'cache-first',
            notifyOnNetworkStatusChange: true, // Für fetchMore Loading-State
        }));
        items = data?.search?.nodes ?? [];
        pageInfo = data?.search?.pageInfo;
        isLoadingMore = networkStatus === 3; // NetworkStatus.fetchMore
    }


    
    // Smart Pagination: Nur bei User-Scroll am Ende nachladen
    const handleScrollBasedFetchMore = useCallback(async () => {
        if (!pageInfo?.hasNext || isLoadingMore) return;
        
        console.log("📦 Loading next batch (20 items)...");
        
        try {
            if (isDictionary) {
                const { entityTypeIn, ...searchParams } = input;
                await fetchMore({
                    variables: {
                        input: {
                            ...searchParams,
                            pageSize: 20, // Kleinere Batches beim Nachladen
                            pageNumber: pageInfo.pageNumber + 1
                        }
                    },
                    updateQuery: (prev, { fetchMoreResult }) => {
                        if (!fetchMoreResult) return prev;
                        return {
                            ...prev,
                            findDictionaries: {
                                ...fetchMoreResult.findDictionaries,
                                nodes: [
                                    ...(prev.findDictionaries?.nodes || []),
                                    ...fetchMoreResult.findDictionaries.nodes
                                ]
                            }
                        };
                    }
                });
            } else {
                await fetchMore({
                    variables: {
                        input,
                        pageSize: 20, // Kleinere Batches beim Nachladen
                        pageNumber: pageInfo.pageNumber + 1
                    },
                    updateQuery: (prev, { fetchMoreResult }) => {
                        if (!fetchMoreResult) return prev;
                        return {
                            ...prev,
                            search: {
                                ...fetchMoreResult.search,
                                nodes: [
                                    ...(prev.search?.nodes || []),
                                    ...fetchMoreResult.search.nodes
                                ]
                            }
                        };
                    }
                });
            }
        } catch (error) {
            console.error('Error loading more items:', error);
        }
    }, [pageInfo, fetchMore, input, isDictionary, isLoadingMore]);

    // Determine if dictionary filter should be shown
    const shouldShowDictionaryFilter = showDictionaryFilter && 
        !searchInput?.entityTypeIn?.includes(CatalogRecordType.Dictionary) &&
        !searchInput?.entityTypeIn?.includes(CatalogRecordType.Unit);

    // Check if dictionary filter is active
    const isDictionaryFilterActive = shouldShowDictionaryFilter && selectedDictionaryId !== null;

    // Map items with proper name formatting and apply dictionary filter
    const mappedItems = useMemo(() => {
        if (!items || items.length === 0) return [];
        
        let processedItems = items.map(item => ({
            ...item,
            name: typeof item.name === "object" && item.name !== null && "texts" in item.name
                ? (item.name.texts?.[0]?.text ?? "")
                : (typeof item.name === "string" ? item.name : "")
        }));

        // Apply dictionary filter if active and not loading dictionaries
        if (isDictionaryFilterActive) {
            if (selectedDictionaryId === "NO_DICTIONARY") {
                // Filter items without dictionary
                processedItems = processedItems.filter(item => !item.dictionary);
            } else {
                // Filter items by selected dictionary
                processedItems = processedItems.filter(item => item.dictionary?.id === selectedDictionaryId);
            }
        }

        return processedItems;
    }, [items, isDictionaryFilterActive, selectedDictionaryId]);

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

    // Intersection Observer für echte Scroll-Erkennung
    const observerTarget = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                // Nur nachladen wenn:
                // 1. User am Ende gescrollt hat
                // 2. Es noch Seiten gibt
                // 3. Nicht bereits am Laden
                // 4. KEIN Dictionary-Filter aktiv ist ODER es gefilterte Ergebnisse gibt
                const shouldLoadMore = entries[0].isIntersecting && 
                    pageInfo?.hasNext && 
                    !isLoadingMore && 
                    (!isDictionaryFilterActive || mappedItems.length > 0);
                
                if (shouldLoadMore) {
                    console.log("🎯 User scrolled to end - Loading more items");
                    handleScrollBasedFetchMore();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [handleScrollBasedFetchMore, pageInfo?.hasNext, isLoadingMore, isDictionaryFilterActive, mappedItems.length]);

    // Dictionary filter handlers
    const handleDictionaryFilterChange = useCallback((event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        const dictionaryId = value === "" ? null : value;
        onDictionaryFilterChange?.(dictionaryId);
    }, [onDictionaryFilterChange]);

    const actuallyLoading = loading && !data;
    
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%', // Nimmt die Höhe vom Parent-Container
            width: '100%',
            minHeight: 0 // Wichtig für flex overflow
        }}>
            {shouldShowDictionaryFilter && (
                <Box sx={{ mb: 1, flexShrink: 0 }}>
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
            
            {/* SearchField außerhalb des scrollbaren Bereichs */}
            <Box sx={{ mb: 1, flexShrink: 0 }}>
                <TextField
                    size="small"
                    fullWidth
                    label={searchLabel || <T keyName="search.search_placeholder"/>}
                    value={searchTerm}
                    onChange={(e) => stableOnSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon/>
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    aria-label="Zurücksetzen"
                                    onClick={() => stableOnSearch("")}
                                >
                                    <ClearIcon fontSize="small"/>
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
            </Box>

            {/* Scrollbarer Container nur für Items */}
            <Box sx={{ 
                flex: 1,
                overflow: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                position: 'relative'
            }}>
                <ItemList
                    loading={actuallyLoading}
                    items={mappedItems}
                    onSearch={undefined} // SearchField ist jetzt außerhalb
                    {...otherProps}
                />
                
                {/* Intersection Observer Target - Nur bei hasNext und wenn Dictionary-Filter nicht leer ist */}
                {pageInfo?.hasNext && (!isDictionaryFilterActive || mappedItems.length > 0) && (
                    <div 
                        ref={observerTarget}
                        style={{ 
                            height: '20px', 
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {isLoadingMore && (
                            <Box sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.875rem'
                            }}>
                                <T keyName="search.loading_more">Lade weitere Einträge...</T>
                            </Box>
                        )}
                    </div>
                )}
            </Box>
        </Box>
    );
}
