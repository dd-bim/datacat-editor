import React, {FC} from "react";
import {Chip} from "@material-ui/core";
import {Entity} from "../domain";
import {useHistory} from "react-router-dom";

type ConceptChipProps = {
    conceptType: Entity,
    id: string,
    label: string,
    title?: string
};

const ConceptChip: FC<ConceptChipProps> = ({ conceptType, id, label, title }) => {
    const history = useHistory();

    return (
        <Chip
            avatar={<conceptType.Icon/>}
            variant="outlined"
            label={label}
            title={title}
            onClick={() => history.push(`/${conceptType.path}/${id}`)}
            size="small"
        />
    )
}

export default ConceptChip;
