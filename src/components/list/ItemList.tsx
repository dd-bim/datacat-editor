import List from "@material-ui/core/List";
import {InputAdornment} from "@material-ui/core";
import React from "react";
import {FixedSizeList, ListOnItemsRenderedProps} from "react-window";
import IconButton from "@material-ui/core/IconButton";
import ClearIcon from '@material-ui/icons/Clear';
import TextField from "@material-ui/core/TextField";
import SearchIcon from "@material-ui/icons/Search";
import LinearProgress from "@material-ui/core/LinearProgress";
import ItemRow, {ITEM_ROW_SIZE, ItemRowProps, RowProps} from "./ItemRow";
import {CatalogRecord} from "../../types";

export type ItemListProps = {
    loading?: boolean;
    items: RowProps[];
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

