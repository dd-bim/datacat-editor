import List from "@mui/material/List";
import {InputAdornment} from "@mui/material";
import React from "react";
import {List as VirtualizedList} from "react-window";
import IconButton from "@mui/material/IconButton";
import ClearIcon from '@mui/icons-material/Clear';
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import LinearProgress from "@mui/material/LinearProgress";
import ItemRow, {ITEM_ROW_SIZE, ItemRowDataProps} from "./ItemRow";
import {CatalogRecord} from "../../types";

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

export type ItemListProps = {
    loading?: boolean;
    items: CatalogRecord[];
    disabledItems?: string[];
    height?: number;
    showRecordIcons?: boolean;
    searchLabel?: React.ReactNode;
    searchTerm?: string;
    onSelect?(item: CatalogRecord): void;
    onSearch?(searchTerm: string): void;
    onAdd?(item: CatalogRecord): void;
    onRemove?(item: CatalogRecord): void;
    onItemsRendered?(visibleRows: OnRowsRenderedProps['visibleRows'], allRows: OnRowsRenderedProps['allRows']): void;
};

export default function ItemList(props: ItemListProps) {
    const {
        loading,
        items,
        disabledItems = [],
        height = 200,
        showRecordIcons = true,
        searchLabel = "Suchen",
        searchTerm,
        onSearch,
        onSelect,
        onAdd,
        onRemove,
        onItemsRendered,
        ...otherProps
    } = props;
    
    // Wrapper-Komponente für react-window v2.x
    const RowComponent = (rowProps: {
        ariaAttributes: { "aria-posinset": number; "aria-setsize": number; role: "listitem" };
        index: number;
        style: React.CSSProperties;
        items: CatalogRecord[];
        disabledItems: string[];
        showRecordIcons: boolean;
        onSelect?(item: CatalogRecord): void;
        onAdd?(item: CatalogRecord): void;
        onRemove?(item: CatalogRecord): void;
    }) => {
        return <ItemRow {...rowProps} />;
    };
    
    const data: ItemRowDataProps = {
        items,
        disabledItems,
        showRecordIcons,
        onSelect,
        onAdd,
        onRemove,
    };

    return (
        <div>
            {onSearch && (
                <TextField
                    size="small"
                    fullWidth
                    label={searchLabel}
                    value={searchTerm}
                    onChange={(e) => onSearch(e.target.value)}
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
                                    onClick={() => onSearch("")}
                                >
                                    <ClearIcon fontSize="small"/>
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
            )}
            {loading && <LinearProgress/>}
            <VirtualizedList<ItemRowDataProps>
                defaultHeight={height}
                rowHeight={ITEM_ROW_SIZE}
                rowCount={items.length}
                rowProps={data}
                onRowsRendered={onItemsRendered}
                rowComponent={RowComponent}
                style={{width: "100%"}}
            />
        </div>
    );
}

