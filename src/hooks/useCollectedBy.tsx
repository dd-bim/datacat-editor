import {getEntityType} from "../domain";
import ConceptChip from "../components/ConceptChip";
import React, {FC} from "react";
import {CollectsPropsFragment} from "../generated/types";
import {Typography} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(() => ({
    chip: {
        margin: 3
    }
}));

type UseCollectedByProps = {
    relationships: CollectsPropsFragment[],
    emptyMessage: string
}

const useCollectedBy: FC<UseCollectedByProps> = (props) => {
    const {relationships, emptyMessage} = props;
    const classes = useStyles();

    const chips = Array.from(relationships)
        .sort(({relatingCollection: left}, {relatingCollection: right}) => {
            const a = left.name ?? left.id;
            const b = right.name ?? right.id;
            return a.localeCompare(b);
        })
        .map(relationship => {
        const {relatingCollection: {__typename, id, name, description, tags}} = relationship;
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
                <Typography variant="body2" color="textSecondary">{emptyMessage}</Typography>
            )}
        </div>
    )
};

export default useCollectedBy;
