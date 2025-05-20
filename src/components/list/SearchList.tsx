import {SearchInput, useFindItemQuery} from "../../generated/types";
import useDebounce from "../../hooks/useDebounce";
import {ListOnItemsRenderedProps} from "react-window";
import ItemList, {ItemListProps} from "./ItemList";
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

    const {loading, data, error ,fetchMore} = useFindItemQuery({
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
        <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            height: 'auto',
            width: '100%',
            mt: 0 // Remove top margin
        }}> 
            <ItemList
                loading={loading}
                items={items}
                searchLabel={searchLabel || t("search.search_placeholder")}
                searchTerm={searchTerm}
                onItemsRendered={handleOnScroll}
                {...otherProps}
            />
        </Box>
    );
}
