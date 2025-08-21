import { CatalogRecordType, SearchInput, useFindItemQuery, useFindDictionariesQuery, useGetDictionaryEntryQuery } from "../../generated/types";
import useDebounce from "../../hooks/useDebounce";
import { ListOnItemsRenderedProps } from "react-window";
import ItemList, { ItemListProps } from "./ItemList";
import { T } from "@tolgee/react";
import { Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { useMemo, useEffect, useState, useCallback } from "react";
import { useApolloClient } from "@apollo/client";
import { GetDictionaryEntryDocument } from "../../generated/types";

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

// Hook to get total elements from search data
export function useSearchTotalElements(searchInput?: SearchInput, searchTerm: string = "") {
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    
    const isDictionary = searchInput?.entityTypeIn?.includes(CatalogRecordType.Dictionary);
    
    const input: SearchInput = {
        ...searchInput,
        query: debouncedSearchTerm,
    };
    
    const { data } = isDictionary 
        ? useFindDictionariesQuery({
            variables: {
                input: { ...input, pageSize: 1, pageNumber: 0 }
            }
        })
        : useFindItemQuery({
            variables: {
                input,
                pageSize: 1,
                pageNumber: 0
            }
        });
    
    const totalElements = isDictionary 
        ? (data as any)?.findDictionaries?.totalElements ?? 0
        : (data as any)?.search?.totalElements ?? 0;
    
    return totalElements;
}

type SearchListReturn = {
    totalElements: number;
    component: React.ReactElement;
};

/**
 * SearchList component with Dictionary relation-based filtering.
 * Uses the Dictionary's concepts collection to filter items that belong to a specific Dictionary.
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
    const apolloClient = useApolloClient();
    
    // Stabilize the search callback to prevent endless re-renders
    const stableOnSearch = useCallback((term: string) => {
        onSearch?.(term);
    }, [onSearch]);
    
    // Load available Dictionaries for filter dropdown
    const { data: dictionariesData } = useFindDictionariesQuery({
        variables: {
            input: { query: "", pageSize: 100 }
        },
        skip: !showDictionaryFilter
    });
    
    const availableDictionaries = dictionariesData?.findDictionaries?.nodes ?? [];
    
    // For "NO_DICTIONARY" option, we need to collect ALL concept IDs from ALL dictionaries
    // We'll load each dictionary's details to get their concept IDs
    const [allDictionaryConceptIds, setAllDictionaryConceptIds] = useState<Set<string>>(new Set());
    
    // Load concepts from all dictionaries when "NO_DICTIONARY" is selected
    useEffect(() => {
        if (selectedDictionaryId !== "NO_DICTIONARY" || availableDictionaries.length === 0) {
            setAllDictionaryConceptIds(prevIds => {
                // Only update if the set is not already empty
                if (prevIds.size > 0) {
                    return new Set();
                }
                return prevIds;
            });
            return;
        }
        
        const loadAllDictionaryConcepts = async () => {
            const allConceptIds = new Set<string>();
            
            try {
                // Load all dictionaries in parallel using Apollo Client
                const dictionaryPromises = availableDictionaries.map(dict =>
                    apolloClient.query({
                        query: GetDictionaryEntryDocument,
                        variables: { id: dict.id }
                    })
                );
                
                const results = await Promise.all(dictionaryPromises);
                
                results.forEach(({ data }) => {
                    const dictionary = data?.node;
                    if (dictionary?.concepts) {
                        dictionary.concepts.forEach((concept: { id: string; }) => {
                            allConceptIds.add(concept.id);
                        });
                    }
                });
                
                setAllDictionaryConceptIds(prevIds => {
                    // Only update if the sets are actually different
                    if (prevIds.size !== allConceptIds.size || 
                        !Array.from(allConceptIds).every(id => prevIds.has(id))) {
                        return allConceptIds;
                    }
                    return prevIds;
                });
            } catch (error) {
                console.error('Error loading dictionary concepts:', error);
                setAllDictionaryConceptIds(prevIds => {
                    if (prevIds.size > 0) {
                        return new Set();
                    }
                    return prevIds;
                });
            }
        };
        
        loadAllDictionaryConcepts();
    }, [selectedDictionaryId, availableDictionaries, apolloClient]);
    
    // Load detailed Dictionary data including concepts when a Dictionary is selected
    const { data: selectedDictionaryDetailData } = useGetDictionaryEntryQuery({
        variables: {
            id: selectedDictionaryId || ""
        },
        skip: !selectedDictionaryId || selectedDictionaryId === "NO_DICTIONARY"
    });
    
    const selectedDictionaryDetail = selectedDictionaryDetailData?.node;
    const dictionaryConceptIds = useMemo(() => 
        selectedDictionaryDetail?.concepts?.map(concept => concept.id) || [], 
        [selectedDictionaryDetail?.concepts]
    );
    
    // Build search input with Dictionary relation filtering - stabilized with useMemo
    const input: SearchInput = useMemo(() => ({
        ...searchInput,
        query: debouncedSearchTerm,
        // Only apply server-side filtering for specific dictionaries (not for "NO_DICTIONARY")
        ...(selectedDictionaryId && 
            selectedDictionaryId !== "NO_DICTIONARY" &&
            dictionaryConceptIds.length > 0 &&
            !searchInput?.entityTypeIn?.includes(CatalogRecordType.Dictionary) &&
            !searchInput?.entityTypeIn?.includes(CatalogRecordType.Unit) && {
            idIn: dictionaryConceptIds
        })
    }), [searchInput, debouncedSearchTerm, selectedDictionaryId, dictionaryConceptIds]);

    const isDictionary = searchInput?.entityTypeIn?.includes(CatalogRecordType.Dictionary);
    
    let loading, data, error, fetchMore;
    let items;
    let pageInfo;
    
    if (isDictionary) {
        const {entityTypeIn, ...restInput} = input;
        restInput.pageSize = pageSize;
        restInput.pageNumber = 0;

        ({ loading, data, error, fetchMore } = useFindDictionariesQuery({
            variables: {
                input: restInput
            }
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
            }
        }));
        items = data?.search.nodes ?? [];
        pageInfo = data?.search.pageInfo;
    }

    const handleOnScroll = async (props: ListOnItemsRenderedProps) => {
        const { visibleStopIndex } = props;

        if (pageInfo?.hasNext && visibleStopIndex >= items.length - 5) {
            if (isDictionary) {
                const {entityTypeIn, ...restInput} = input;
                restInput.pageNumber = pageInfo.pageNumber + 1;
                await fetchMore({
                    variables: {
                        input: restInput
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
    }

    const mappedItems = useMemo(() => {
        let filteredItems = items.map(item => ({
            ...item,
            name: typeof item.name === "object" && item.name !== null && "texts" in item.name
                ? (item.name.texts?.[0]?.text ?? "")
                : (typeof item.name === "string" ? item.name : "")
        }));
        
        // Client-side filtering for "NO_DICTIONARY" option
        if (selectedDictionaryId === "NO_DICTIONARY") {
            // Filter out items that are concepts in any dictionary
            // This gives us the true difference: All items - Dictionary concepts
            filteredItems = filteredItems.filter(item => {
                return !allDictionaryConceptIds.has(item.id);
            });
        }
        
        return filteredItems;
    }, [items, selectedDictionaryId, allDictionaryConceptIds]);

    // Call onTotalCountChange when the total count changes
    // Use a separate, unfiltered query to get the absolute total count
    const absoluteSearchInput = useMemo(() => {
        if (isDictionary) {
            // For dictionaries, we need a simpler structure
            return {
                query: "",
                pageSize: 1,
                pageNumber: 0
            };
        } else {
            // For other entity types, use the normal searchInput structure
            return {
                ...searchInput,
                query: "" // No search term for absolute count
                // No idIn filter for absolute count
            };
        }
    }, [searchInput, isDictionary]);

    const { data: absoluteCountData } = isDictionary 
        ? useFindDictionariesQuery({
            variables: {
                input: absoluteSearchInput
            }
        })
        : useFindItemQuery({
            variables: {
                input: absoluteSearchInput,
                pageSize: 1,
                pageNumber: 0
            }
        });

    useEffect(() => {
        if (!onTotalCountChange || !absoluteCountData) return;
        
        let totalCount = 0;
        
        if (isDictionary) {
            totalCount = (absoluteCountData as any)?.findDictionaries?.totalElements ?? 0;
        } else {
            totalCount = (absoluteCountData as any)?.search?.totalElements ?? 0;
        }
        
        onTotalCountChange(totalCount);
    }, [absoluteCountData, isDictionary, onTotalCountChange]);

    const handleDictionaryFilterChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        const dictionaryId = value === "" ? null : value;
        onDictionaryFilterChange?.(dictionaryId);
    };

    const shouldShowDictionaryFilter = showDictionaryFilter && 
        !searchInput?.entityTypeIn?.includes(CatalogRecordType.Dictionary) &&
        !searchInput?.entityTypeIn?.includes(CatalogRecordType.Unit);

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
                    <FormControl size="small" fullWidth>
                        <InputLabel id="dictionary-filter-label">
                            <T keyName="search.filter_by_dictionary" defaultValue="Nach Dictionary filtern" />
                        </InputLabel>
                        <Select
                            labelId="dictionary-filter-label"
                            value={selectedDictionaryId || ""}
                            onChange={handleDictionaryFilterChange}
                            label="Nach Dictionary filtern"
                        >
                            <MenuItem value="">
                                <T keyName="search.all_dictionaries" defaultValue="Alle Dictionaries" />
                            </MenuItem>
                            <MenuItem value="NO_DICTIONARY">
                                <T keyName="search.no_dictionary" defaultValue="Ohne Dictionary" />
                            </MenuItem>
                            {availableDictionaries.map((dictionary) => {
                                const name = dictionary.name.texts?.find(t => t.language.code === "de")?.text || 
                                           dictionary.name.texts?.[0]?.text || 
                                           dictionary.id;
                                return (
                                    <MenuItem key={dictionary.id} value={dictionary.id}>
                                        {name}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </Box>
            )}
            <ItemList
                loading={loading}
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
