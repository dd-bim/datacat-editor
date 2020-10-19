import {Typography} from "@material-ui/core";
import {toLLL} from "../../dateUtil";
import {FormSet} from "./FormSet";
import React, {FC} from "react";
import {ConceptPropsFragment, EntityPropsFragment} from "../../generated/types";

type MetaFormSetProps = {
    entry: EntityPropsFragment & ConceptPropsFragment
}

const MetaFormSet: FC<MetaFormSetProps> = (props) => {
    const {
        entry: {
            id,
            __typename,
            created,
            createdBy,
            lastModified,
            lastModifiedBy,
            tags
        }
    } = props;
    return (
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
    );
}

export default MetaFormSet;
