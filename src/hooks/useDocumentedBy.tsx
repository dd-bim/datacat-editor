import {DocumentsPropsFragment} from "../generated/types";
import React, {FC} from "react";
import ConceptChip from "../components/ConceptChip";
import {DocumentEntity} from "../domain";
import {Typography} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(() => ({
    chip: {
        margin: 3
    }
}));

type UseDocumentedByOptions = {
    relationships: DocumentsPropsFragment[],
    emptyMessage?: string
}

const useDocumentedBy: FC<UseDocumentedByOptions> = (props) => {
    const {
        relationships,
        emptyMessage = "Durch kein Dokument beschrieben."
    } = props;
    const classes = useStyles();

    const chips = Array.from(relationships)
        .sort(({relatingDocument: left}, {relatingDocument: right}) => {
            const a = left.name ?? left.id;
            const b = right.name ?? right.id;
            return a.localeCompare(b);
        })
        .map(relationship => {
        const {relatingDocument: {id, name, description}} = relationship;
        return (
            <ConceptChip
                key={id}
                className={classes.chip}
                conceptType={DocumentEntity}
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
    );
}

export default useDocumentedBy;
