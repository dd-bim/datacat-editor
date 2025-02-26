import { useNavigate, useLocation } from "react-router-dom";
import { Querying } from "./useQuerying";

const QUERY_PARAM = "q";
const PAGE_SIZE_PARAM = "size";
const PAGE_NUMBER_PARAM = "page";

export function useQueryParams(): Querying {
    const { pathname, search } = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(search);

    const queryParam = searchParams.get(QUERY_PARAM);
    const query = queryParam ?? "";

    const pageSizeParam = searchParams.get(PAGE_SIZE_PARAM);
    const parsedPageSizeParam = parseInt(pageSizeParam ?? "", 10);
    const pageSize = isNaN(parsedPageSizeParam) ? 25 : parsedPageSizeParam;

    const pageNumberParam = searchParams.get(PAGE_NUMBER_PARAM);
    const parsedPageNumberParam = parseInt(pageNumberParam ?? "", 10);
    const pageNumber = isNaN(parsedPageNumberParam) ? 0 : parsedPageNumberParam;

    const updateLocation = () => {
        navigate(`${pathname}?${searchParams.toString()}`);
    };

    const setQuery = (newQuery: string): void => {
        searchParams.set(QUERY_PARAM, newQuery);
        updateLocation();
    };

    const setPageSize = (newPageSize: number): void => {
        searchParams.set(PAGE_SIZE_PARAM, newPageSize.toString(10));
        searchParams.set(PAGE_NUMBER_PARAM, "0");
        updateLocation();
    };

    const setPageNumber = (newPageNumber: number) => {
        searchParams.set(PAGE_NUMBER_PARAM, newPageNumber.toString(10));
        updateLocation();
    };

    return {
        query: [query, setQuery],
        pageSize: [pageSize, setPageSize],
        pageNumber: [pageNumber, setPageNumber]
    };

}
