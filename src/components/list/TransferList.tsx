import {SearchInput} from "../../generated/graphql";
import { styled } from "@mui/material/styles";
import React, {useState} from "react";
import { Box, Stack } from "@mui/material";
import Paper from "@mui/material/Paper";
import FilterableList from "./FilterableList";
import SearchList from "./SearchList";
import {CatalogRecord} from "../../types";
import { ITEM_ROW_SIZE } from "./ItemRow";

// Modified styled components to fit content exactly
const ListPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    alignSelf: 'flex-start', // Prevent stretching beyond content
    width: '100%',
    overflow: 'hidden' // Wichtig: Verhindert, dass Inhalt überläuft
}));

const SearchBox = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey[100],
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    alignSelf: 'flex-start', // Prevent stretching beyond content
    width: '100%',
    overflow: 'hidden' // Wichtig: Verhindert, dass Inhalt überläuft
}));

type TransferListProps = {
    loading?: boolean
    items: CatalogRecord[];
    enabled: boolean;
    searchInput: SearchInput;
    height?: number;
    maxVisibleItems?: number; // Maximale Anzahl sichtbarer Items in der Relationen-Liste
    showDictionaryFilter?: boolean;
    selectedDictionaryId?: string | null;
    onDictionaryFilterChange?: (dictionaryId: string | null) => void;
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
        maxVisibleItems = 8, // Standard: Zeige maximal 8 Items, dann Scroll
        showDictionaryFilter = false,
        selectedDictionaryId = null,
        onDictionaryFilterChange,
        onSelect,
        onAdd,
        onRemove,
    } = props;

    const [searchTerm, setSearchTerm] = useState("");

    // Berechne die feste maximale Höhe für die Liste
    const textFieldHeight = 56; // TextField mit Margin
    const maxHeight = (maxVisibleItems * ITEM_ROW_SIZE) + textFieldHeight;
    
    // Im Bearbeitungsmodus: volle Höhe; Im Lesemodus: nur so groß wie nötig
    let relationListHeight: number | undefined;
    let useFixedHeight: boolean;
    
    if (enabled) {
        // Bearbeitungsmodus: Verwende feste maximale Höhe
        relationListHeight = height ?? maxHeight;
        useFixedHeight = true;
    } else {
        // Lesemodus: Passe Höhe an Anzahl der Items an
        const actualItems = Math.min(items.length, maxVisibleItems);
        relationListHeight = height ?? ((actualItems * ITEM_ROW_SIZE) + textFieldHeight);
        useFixedHeight = items.length > maxVisibleItems;
    }

    return (
        <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={1} 
            alignItems="flex-start" // Align items to top
            sx={{ width: '100%' }}
        >
            <Box sx={{ 
                flex: enabled ? 1 : 1, 
                display: 'flex', 
                width: '100%', 
                alignSelf: 'flex-start' // Prevent stretching
            }}>
                <ListPaper variant="outlined">
                    <FilterableList
                        height={relationListHeight}
                        fixedHeight={useFixedHeight}
                        loading={loading}
                        items={[...items].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "") || a.id.localeCompare(b.id))}
                        onSelect={onSelect}
                        onRemove={enabled && onRemove ? onRemove : undefined}
                    />
                </ListPaper>
            </Box>
            {enabled && (
                <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    width: '100%',
                    alignSelf: 'flex-start' // Prevent stretching
                }}>
                    <SearchBox variant="outlined">
                        <SearchList
                            height={relationListHeight}
                            fixedHeight={useFixedHeight}
                            disabledItems={items.map(x => x.id)}
                            searchTerm={searchTerm}
                            searchInput={searchInput}
                            onSearch={setSearchTerm}
                            onAdd={onAdd}
                            showDictionaryFilter={showDictionaryFilter}
                            selectedDictionaryId={selectedDictionaryId}
                            onDictionaryFilterChange={onDictionaryFilterChange}
                        />
                    </SearchBox>
                </Box>
            )}
        </Stack>
    )
}
