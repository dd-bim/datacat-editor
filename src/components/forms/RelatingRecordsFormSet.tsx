import FormSet, {FormSetProps, FormSetTitle} from "./FormSet";
import React from "react";
import CatalogEntryChip from "../CatalogEntryChip";
import {Typography} from "@mui/material";
import {CatalogRecord} from "../../types";
import { styled } from "@mui/material/styles";

// Replace makeStyles with styled component
const StyledFormSetTitle = styled(FormSetTitle)(({ theme }) => ({
    marginBottom: theme.spacing(1)
}));

export type MemberFormSetProps = {
    title: React.ReactNode;
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
            <StyledFormSetTitle>{title}</StyledFormSetTitle>
            {chips.length
                ? chips
                : <Typography variant="body2" color="textSecondary">{emptyMessage}</Typography>
            }
        </FormSet>
    );
}
