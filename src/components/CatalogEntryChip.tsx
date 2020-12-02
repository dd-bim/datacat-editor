import {SearchResultPropsFragment} from "../generated/types";
import {getEntityType} from "../domain";
import ConceptChip from "./ConceptChip";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(() => ({
    chip: {
        margin: 3
    }
}));

type CatalogEntryChipProps = {
    catalogEntry: SearchResultPropsFragment
}

export default function CatalogEntryChip(props: CatalogEntryChipProps) {
    const {
        catalogEntry: {
            __typename,
            id,
            name,
            description,
            tags
        }
    } = props;
    const classes = useStyles();
    const entryType = __typename.substring(3);
    const tagIds = tags.map(tag => tag.id);
    const domainEntityType = getEntityType(entryType, tagIds);

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
