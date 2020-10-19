import {useState} from "react";
import usePagination, {Pagination} from "./usePagination";

export type Querying = {
    query: [string, (newQuery: string) => void],
} & Pagination

export default function useQuerying(initialQuery = "", initialPageNumber = 0, initialPageSize = 10): Querying {
    const [query, setQuery] = useState(initialQuery);
    const {pageSize, pageNumber: [pageNumber, setPageNumber]} = usePagination(initialPageNumber, initialPageSize);

    const handleQueryChange = (newQuery: string) => {
        setQuery(newQuery);
        setPageNumber(0)
    };

    return {
        query: [query, handleQueryChange],
        pageSize,
        pageNumber: [pageNumber, setPageNumber],
    };
}
