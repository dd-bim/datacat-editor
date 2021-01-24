import {toLLL} from "../../dateUtil";
import FormSet, {FormSetDescription, FormSetTitle} from "./FormSet";
import React from "react";
import {ItemPropsFragment, MetaPropsFragment} from "../../generated/types";
import {WithChildren} from "../../views/forms/FormView";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";

type MetaFormSetProps = WithChildren<{
    entry: ItemPropsFragment & MetaPropsFragment
}>

export default function MetaFormSet(props: MetaFormSetProps) {
    const {
        entry: {
            id,
            __typename,
            created,
            createdBy,
            lastModified,
            lastModifiedBy,
            tags
        }
    } = props;

    return (
        <FormSet>
            <FormSetTitle><b>Metainformationen</b></FormSetTitle>
            <FormSetDescription>Technische Informationen zum Konzept</FormSetDescription>
            <Table size="small">
                <TableBody>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>{id}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>ISO12006-3</TableCell>
                        <TableCell>{__typename}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Schlagworte</TableCell>
                        <TableCell>{tags.map(x => x.name).join(", ")}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Erstellt</TableCell>
                        <TableCell>{toLLL(created)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Erstellt durch</TableCell>
                        <TableCell>{createdBy}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Aktualisiert</TableCell>
                        <TableCell>{toLLL(lastModified)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Aktualisiert durch</TableCell>
                        <TableCell>{lastModifiedBy}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </FormSet>
    );
}
