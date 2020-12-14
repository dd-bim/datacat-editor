import React, {useState} from "react";
import useDebounce from "../../hooks/useDebounce";
import {ItemPropsFragment} from "../../generated/types";
import ItemList, {ItemListProps} from "./ItemList";

type FilterableListProps = Omit<ItemListProps, "onSearch"> & {
    searchDelay?: number;
};

export default function FilterableList(props: FilterableListProps) {
    const {
        items,
        searchTerm: initialSearchTerm = "",
        searchDelay = 300,
        ...otherProps
    } = props;
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const debouncedSearchTerm = useDebounce(searchTerm, searchDelay);
    const predicate = (x: ItemPropsFragment) => (x.name?.toLowerCase().indexOf(debouncedSearchTerm) !== -1);
    const visibleItems = items.filter(predicate);
    const searchLabel = `Liste filtern (${visibleItems.length}/${items.length})`;

    return (
        <ItemList
            items={visibleItems}
            searchLabel={searchLabel}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            {...otherProps}
        />
    );
}
