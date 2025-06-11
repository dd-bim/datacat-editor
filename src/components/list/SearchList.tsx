import { CatalogRecordType, SearchInput, useFindItemQuery, useFindDictionariesQuery } from "../../generated/types";
import useDebounce from "../../hooks/useDebounce";
import { ListOnItemsRenderedProps } from "react-window";
import ItemList, { ItemListProps } from "./ItemList";
import { useTranslate } from "@tolgee/react";
import { Box } from "@mui/material";

type SearchListProps = Omit<ItemListProps, "items"> & {
    searchTerm: string;
    pageSize?: number;
    searchInput?: SearchInput;
};

export default function SearchList(props: SearchListProps) {
    const {
        searchLabel,
        searchTerm = "",
        pageSize = 10,
        searchInput,
        ...otherProps
    } = props;
    const { t } = useTranslate();
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const input = {
        ...searchInput,
        query: debouncedSearchTerm
    };

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
                        restInput
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

const mappedItems = items.map(item => ({
    ...item,
    name: typeof item.name === "object" && item.name !== null && "texts" in item.name
        ? (item.name.texts?.[0]?.text ?? "")
        : (typeof item.name === "string" ? item.name : "")
}));

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: 'auto',
            width: '100%',
            mt: 0 // Remove top margin
        }}>
            <ItemList
                loading={loading}
                items={mappedItems}
                searchLabel={searchLabel || t("search.search_placeholder")}
                searchTerm={searchTerm}
                onItemsRendered={handleOnScroll}
                {...otherProps}
            />
        </Box>
    );
}
