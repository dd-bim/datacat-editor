import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import TableFooter from "@material-ui/core/TableFooter";
import TablePagination from "@material-ui/core/TablePagination";
import Table from "@material-ui/core/Table";
import React from "react";
import {TablePaginationProps} from "@material-ui/core";
import {Maybe} from "../generated/types";
import Tooltip from "@material-ui/core/Tooltip";

export type CatalogEntryListItem = {
    id: string,
    de?: Maybe<string>,
    en?: Maybe<string>,
    description?: Maybe<string>
};

type CatalogEntryListProps<T extends CatalogEntryListItem> = {
    rows: T[],
    selectedRowIds?: string[],
    pagingOptions: Omit<TablePaginationProps<'td'>, 'component'>,
    onSelect(value: T): void
}

function CatalogEntryList<T extends CatalogEntryListItem>(props: CatalogEntryListProps<T>) {
    const {rows, selectedRowIds = [], pagingOptions, onSelect} = props;

    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>
                        Deutsch
                    </TableCell>
                    <TableCell>
                        Englisch
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map(row => {
                    const {id, de, en, description} = row;
                    const isSelect = selectedRowIds.includes(id);
                    const onClick = () => onSelect(row);
                    return (
                        <Tooltip key={id} title={description ?? ""} arrow>
                            <TableRow hover onClick={onClick} selected={isSelect}>
                                <TableCell>
                                    {de}
                                </TableCell>
                                <TableCell>
                                    {en}
                                </TableCell>
                            </TableRow>
                        </Tooltip>
                    )
                })}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TablePagination colSpan={2} {...pagingOptions} />
                </TableRow>
            </TableFooter>
        </Table>
    );
}

export default CatalogEntryList;
