import {SearchInput, useFindItemQuery} from "../../generated/types";
import useDebounce from "../../hooks/useDebounce";
import {ListOnItemsRenderedProps} from "react-window";
import React from "react";
import ItemList, {ItemListProps} from "./ItemList";

type SearchListProps = Omit<ItemListProps, "items"> & {
    searchTerm: string;
    pageSize?: number;
    searchInput?: SearchInput;
};

export default function SearchList(props: SearchListProps) {
    const {
        searchLabel = "Katalog durchsuchen",
        searchTerm = "",
        pageSize = 10,
        searchInput,
        ...otherProps
    } = props;
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const input = {
        ...searchInput,
        query: debouncedSearchTerm
    };
    const {loading, data, fetchMore} = useFindItemQuery({
        variables: {
            input,
            pageSize,
            pageNumber: 0
        }
    });
    const items = data?.search.nodes ?? [];
    const pageInfo = data?.search.pageInfo;

    const handleOnScroll = async (props: ListOnItemsRenderedProps) => {
        const {visibleStopIndex} = props;

        if (pageInfo?.hasNext && visibleStopIndex >= items.length - 5) {
            await fetchMore({
                variables: {
                    input,
                    pageSize,
                    pageNumber: pageInfo.pageNumber + 1
                }
            });
        }
    }

    return (
        <ItemList
            loading={loading}
            items={items}
            searchLabel={searchLabel}
            searchTerm={searchTerm}
            onItemsRendered={handleOnScroll}
            {...otherProps}
        />
    );
}
