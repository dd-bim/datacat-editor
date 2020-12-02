import React, {FC} from "react";
import {ItemPropsFragment} from "../generated/types";
import {Typography} from "@material-ui/core";
import CatalogEntryChip from "../components/CatalogEntryChip";

type UseRelatedProps = {
    catalogEntries: ItemPropsFragment[],
    emptyMessage: string
}

const sortEntries = (left: ItemPropsFragment, right: ItemPropsFragment) => {
    const a = left.name ?? left.id;
    const b = right.name ?? right.id;
    return a.localeCompare(b);
};

const useRelated: FC<UseRelatedProps> = (props) => {
    const {catalogEntries, emptyMessage} = props;
    const chips = Array.from(catalogEntries)
        .sort(sortEntries)
        .map(catalogEntry => {
            return (
                <CatalogEntryChip
                    key={catalogEntry.id}
                    catalogEntry={catalogEntry}
                />
            );
        });
    return (
        <div>
            {chips.length ? chips : (
                <Typography variant="body2" color="textSecondary">{emptyMessage}</Typography>
            )}
        </div>
    )
};

export default useRelated;
