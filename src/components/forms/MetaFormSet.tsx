import { toLLL } from "../../dateUtil";
import FormSet, { FormSetDescription, FormSetTitle } from "./FormSet";
import React from "react";
import { ItemPropsFragment, MetaPropsFragment } from "../../generated/graphql";
import { WithChildren } from "../../views/forms/FormView";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { T } from "@tolgee/react";


type MetaFormSetProps = WithChildren<{
  entry: ItemPropsFragment & MetaPropsFragment;
}>;

export default function MetaFormSet(props: MetaFormSetProps) {
  const {
    entry: {
      id,
      __typename,
      created,
      createdBy,
      lastModified,
      lastModifiedBy,
      tags,
    },
  } = props;

  return (
    <FormSet>
      <FormSetTitle>
        <b>
          <T keyName="meta.title" />
        </b>
      </FormSetTitle>
      <div style={{ marginBottom: "12px" }}></div>

      <FormSetDescription>
        <T keyName="meta.description" />
      </FormSetDescription>
      <div style={{ marginBottom: "12px" }}></div>

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
            <TableCell>
              <T keyName="meta.keyword" />
            </TableCell>
            <TableCell>{tags.map((x) => x.name).join(", ")}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <T keyName="meta.created" />
            </TableCell>
            <TableCell>{toLLL(created)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <T keyName="meta.created_by" />
            </TableCell>
            <TableCell>{createdBy}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <T keyName="meta.updated" />
            </TableCell>
            <TableCell>{toLLL(lastModified)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <T keyName="meta.updated_by" />
            </TableCell>
            <TableCell>{lastModifiedBy}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </FormSet>
  );
}
