import FormSet, {FormSetProps, FormSetTitle, useFieldSetStyles} from "./FormSet";
import React from "react";
import CatalogEntryChip from "../CatalogEntryChip";
import {Typography} from "@material-ui/core";
import {CatalogRecord} from "../../types";

export type MemberFormSetProps = {
    title: string;
    emptyMessage: string;
    relatingRecords: CatalogRecord[];
    FormSetProps?: FormSetProps;
};

export const sortEntries = (left: CatalogRecord, right: CatalogRecord) => {
    const a = left.name ?? left.id;
    const b = right.name ?? right.id;
    return a.localeCompare(b);
};

export default function RelatingRecordsFormSet(props: MemberFormSetProps) {
    const {
        title,
        emptyMessage,
        relatingRecords,
        FormSetProps
    } = props;

    const classes = useFieldSetStyles();
    const chips = Array.from(relatingRecords)
        .sort(sortEntries)
        .map(record => (
            <CatalogEntryChip
                key={record.id}
                catalogEntry={record}
            />
        ));

    return (
        <FormSet {...FormSetProps}>
            <FormSetTitle className={classes.gutterBottom}>{title}</FormSetTitle>
            {chips.length
                ? chips
                : <Typography variant="body2" color="textSecondary">{emptyMessage}</Typography>
            }
        </FormSet>
    );
}
