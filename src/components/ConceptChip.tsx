import React from "react";
import {Chip, ChipProps} from "@mui/material";
import {Entity} from "../domain";
import {useNavigate} from "react-router-dom";

type ConceptChipProps = {
    conceptType: Entity,
    id: string,
    label: string,
    title?: string
} & Partial<ChipProps>;

const ConceptChip = (props: ConceptChipProps) => {
    const { conceptType, id, label, title, ...otherProps } = props;
    const navigate = useNavigate();

    return (
        <Chip
            avatar={<conceptType.Icon/>}
            label={label}
            title={title}
            clickable
            onClick={() => navigate(`/${conceptType.path}/${id}`)}
            size="small"
            {...otherProps}
        />
    )
}

export default ConceptChip;
