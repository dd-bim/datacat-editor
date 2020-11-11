import React, {FC} from "react";
import {Chip, ChipProps} from "@material-ui/core";
import {Entity} from "../domain";
import {useHistory} from "react-router-dom";

type ConceptChipProps = {
    conceptType: Entity,
    id: string,
    label: string,
    title?: string
} & Partial<ChipProps>;

const ConceptChip: FC<ConceptChipProps> = (props) => {
    const { conceptType, id, label, title, ...otherProps } = props;
    const history = useHistory();

    return (
        <Chip
            avatar={<conceptType.Icon/>}
            label={label}
            title={title}
            clickable
            onClick={() => history.push(`/${conceptType.path}/${id}`)}
            size="small"
            {...otherProps}
        />
    )
}

export default ConceptChip;
