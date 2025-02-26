import List from "@mui/material/List";
import {InputAdornment} from "@mui/material";
import React from "react";
import {FixedSizeList, ListOnItemsRenderedProps} from "react-window";
import IconButton from "@mui/material/IconButton";
import ClearIcon from '@mui/icons-material/Clear';
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import LinearProgress from "@mui/material/LinearProgress";
import ItemRow, {ITEM_ROW_SIZE, ItemRowProps} from "./ItemRow";
import {CatalogRecord} from "../../types";

export type ItemListProps = {
    loading?: boolean;
    items: CatalogRecord[];
    disabledItems?: string[];
    height?: number;
    showRecordIcons?: boolean;
    searchLabel?: string;
    searchTerm?: string;
    onSelect?(item: CatalogRecord): void;
    onSearch?(searchTerm: string): void;
    onAdd?(item: CatalogRecord): void;
    onRemove?(item: CatalogRecord): void;
    onItemsRendered?(props: ListOnItemsRenderedProps): void;
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
        ...otherProps
    } = props;
    const data: ItemRowProps = {
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
            <FixedSizeList
                {...otherProps}
                height={height}
                width={"100%"}
                itemSize={ITEM_ROW_SIZE}
                itemCount={items.length}
                itemData={data}
                outerElementType={List}
            >
                {ItemRow}
            </FixedSizeList>
        </div>
    );
}

