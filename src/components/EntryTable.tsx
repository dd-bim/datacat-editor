import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import TableFooter from "@material-ui/core/TableFooter";
import TablePagination from "@material-ui/core/TablePagination";
import Table from "@material-ui/core/Table";
import React from "react";
import {Column, useTable} from "react-table";
import {TablePaginationProps} from "@material-ui/core";
import {Maybe} from "../generated/types";
import Tooltip from "@material-ui/core/Tooltip";

export type EntryTableRow = {
    id: string,
    name?: Maybe<string>,
    de?: Maybe<string>,
    en?: Maybe<string>,
    description?: Maybe<string>
};

type EntryTableProps<T extends EntryTableRow> = {
    data: T[],
    pagingOptions: Omit<TablePaginationProps<'td'>, 'component'>,
    onSelect(value: T): void
}

function EntryTable<T extends EntryTableRow>(props: EntryTableProps<T>) {
    const {data, pagingOptions, onSelect} = props;
    const {headerGroups, rows, prepareRow, visibleColumns} = useTable({
        columns: React.useMemo<Column<T>[]>(() => [{
                accessor: 'de',
                Header: 'Deutsch',
            }, {
                accessor: 'en',
                Header: 'Englisch'
            }],
            []
        ),
        data: React.useMemo<T[]>(() => (data), [data]),
    });

    return (
        <Table size="small">
            <TableHead>
                {headerGroups.map(headerGroup => (
                    <TableRow {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <TableCell {...column.getHeaderProps()}>
                                {column.render('Header')}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableHead>
            <TableBody>
                {rows.map((row, i) => {
                    prepareRow(row);
                    const onClick = () => onSelect(row.original);
                    return (
                        <Tooltip {...row.getRowProps()} title={row.original.description ?? ""} arrow>
                            <TableRow hover onClick={onClick}>
                                {row.cells.map(cell => {
                                    return (
                                        <TableCell {...cell.getCellProps()}>
                                            {cell.render('Cell')}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        </Tooltip>
                    )
                })}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TablePagination

                        colSpan={visibleColumns.length}
                        {...pagingOptions}
                    />
                </TableRow>
            </TableFooter>
        </Table>
    );
}

export default EntryTable;
