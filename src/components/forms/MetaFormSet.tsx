import {Typography} from "@material-ui/core";
import {toLLL} from "../../dateUtil";
import {FormSet} from "./FormSet";
import React from "react";
import {ItemPropsFragment, MetaPropsFragment} from "../../generated/types";
import Paper from "@material-ui/core/Paper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {WithChildren} from "../../views/forms/FormView";

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(1)
    }
}));

type MetaFormSetProps = WithChildren<{
    entry: ItemPropsFragment & MetaPropsFragment
}>

function MetaFormSet(props: MetaFormSetProps) {
    const {
        entry: {
            id,
            __typename,
            created,
            createdBy,
            lastModified,
            lastModifiedBy,
            tags
        },
        children
    } = props;
    const classes = useStyles();

    return (
        <Paper className={classes.root} variant="outlined">
            <FormSet
                title="Metainformationen"
                description="Technische Informationen zum Konzept"
            >
                <Typography variant="body2">
                    ID: {id}
                </Typography>
                <Typography variant="body2">
                    ISO12006-3-Konzept: {__typename}
                </Typography>
                <Typography variant="body2">
                    Tags: {tags.map(x => x.localizedName).join(", ")}
                </Typography>
                <Typography variant="body2">
                    Erstellt: {toLLL(created)} durch {createdBy}
                </Typography>
                <Typography variant="body2">
                    Zuletzt bearbeitet: {toLLL(lastModified)} durch {lastModifiedBy}
                </Typography>
            </FormSet>

            {children}
        </Paper>
    );
}

export default MetaFormSet;
