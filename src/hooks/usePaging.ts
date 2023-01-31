import {TablePaginationProps} from "@material-ui/core";
import {Pagination} from "./usePagination";

type UsePagingOptions = {
    totalElements?: number,
    pagination: Pagination,
}

export default function usePaging(options: UsePagingOptions): Omit<TablePaginationProps<'td'>, 'component'> {
    const {
        totalElements,
        pagination: {
            pageNumber: [pageNumber, setPageNumber],
            pageSize: [pageSize, setPageSize]
        }
    } = options;

    return {
        count: totalElements ?? 0,
        page: totalElements ? pageNumber : 0,
        labelRowsPerPage: "Anzahl:",
        rowsPerPage: pageSize,
        rowsPerPageOptions: [10, 25, 50, 100],
        onChangeRowsPerPage: e => setPageSize(parseInt(e.target.value, 10)),
        // onChangePage: (e, num) => setPageNumber(num)
        onPageChange: (e, num) => setPageNumber(num)
    };
};

