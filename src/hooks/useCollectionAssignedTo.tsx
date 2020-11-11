import {getEntityType} from "../domain";
import ConceptChip from "../components/ConceptChip";
import React, {FC} from "react";
import {AssignsCollectionsPropsFragment} from "../generated/types";
import {Typography} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(() => ({
    chip: {
        margin: 3
    }
}));

type UseAssignedToProps = {
    relationships: AssignsCollectionsPropsFragment[],
    emptyMessage: string
}

const useCollectionAssignedTo: FC<UseAssignedToProps> = (props) => {
    const {relationships, emptyMessage} = props;
    const classes = useStyles();

    const chips = Array.from(relationships)
        .sort(({relatingObject: left}, {relatingObject: right}) => {
            const a = left.name ?? left.id;
            const b = right.name ?? right.id;
            return a.localeCompare(b);
        })
        .map(relationship => {
            const {relatingObject: {__typename, id, name, description, tags}} = relationship;
            const domainEntityType = getEntityType(__typename.substring(3), tags.map(tag => tag.id));
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
        });
    return (
        <div>
            {chips.length ? chips : (
                <Typography color="textSecondary">{emptyMessage}</Typography>
            )}
        </div>
    )
};

export default useCollectionAssignedTo;
