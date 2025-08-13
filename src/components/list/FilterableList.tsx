import React, {useState} from "react";
import useDebounce from "../../hooks/useDebounce";
import ItemList, {ItemListProps} from "./ItemList";
import {CatalogRecord} from "../../types";
import { useTranslate } from "@tolgee/react";

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
    const { t } = useTranslate();
    const debouncedSearchTerm = useDebounce(searchTerm, searchDelay);
    const predicate = (x: CatalogRecord) => (x.name?.toLowerCase().indexOf(debouncedSearchTerm) !== -1);
    const visibleItems = items.filter(predicate);
    const searchLabel = t("search.filter_list", { count: visibleItems.length, total: items.length });

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
