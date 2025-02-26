import {getEntityType} from "../domain";
import ConceptChip from "./ConceptChip";
import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import {CatalogRecord} from "../types";

const useStyles = makeStyles(() => ({
    chip: {
        margin: 3
    }
}));

type CatalogEntryChipProps = {
    catalogEntry: CatalogRecord
}

export default function CatalogEntryChip(props: CatalogEntryChipProps) {
    const {
        catalogEntry: {
            id,
            recordType,
            name,
            description,
            tags
        }
    } = props;
    const classes = useStyles();
    const tagIds = tags.map(tag => tag.id);
    const domainEntityType = getEntityType(recordType, tagIds);

    return (
        <ConceptChip
            key={id}
            className={classes.chip}
            conceptType={domainEntityType!}
            id={id}
            label={name ?? id}
            title={description ?? undefined}
        />
    );
}
