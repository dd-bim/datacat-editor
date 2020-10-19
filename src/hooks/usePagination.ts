import {useState} from "react";

export interface Pagination {
    pageSize: [number, (newSize: number) => void],
    pageNumber: [number, (newNumber: number) => void]
}

export default function usePagination(initialPageNumber = 0, initialPageSize = 10): Pagination {
    const [pageNumber, setPageNumber] = useState(initialPageNumber);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const handleChangeRowsPerPage = (pageSize: number): void => {
        setPageSize(pageSize);
        setPageNumber(0);
    };

    const handleChangePage = (page: number) => {
        setPageNumber(page);
    };

    return {
        pageSize: [pageSize, handleChangeRowsPerPage],
        pageNumber: [pageNumber, handleChangePage]
    };
}
