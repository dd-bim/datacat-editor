import {getEntityType} from "../domain";
import ConceptChip from "./ConceptChip";
import React from "react";
import { styled } from "@mui/material/styles";
import {CatalogRecord} from "../types";

// Replace makeStyles with styled component
const StyledConceptChip = styled(ConceptChip)({
    margin: 3
});

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
    
    const tagIds = tags.map(tag => tag.id);
    const domainEntityType = getEntityType(recordType, tagIds);

    return (
        <StyledConceptChip
            key={id}
            conceptType={domainEntityType!}
            id={id}
            label={name ?? id}
            title={description ?? undefined}
        />
    );
}
