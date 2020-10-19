import React, {FC} from "react";
import {SvgIconProps} from "@material-ui/core";
import {TagPropsFragment} from "../generated/types";
import DomainModelIcon from "@material-ui/icons/Category";
import SubjectIcon from "@material-ui/icons/Class";
import DomainClassIcon from "@material-ui/icons/Class";
import ExternalDocumentIcon from "@material-ui/icons/Gavel";
import DomainGroupIcon from "@material-ui/icons/FolderSpecial";
import PropertyGroupIcon from "@material-ui/icons/AccountTree";
import DefaultIcon from "@material-ui/icons/EmojiObjects";
import PropertyIcon from "@material-ui/icons/Palette";
import ValueIcon from "@material-ui/icons/LocalOffer";
import RelationshipIcon from '@material-ui/icons/SettingsEthernet';
import DataTemplateIcon from '@material-ui/icons/DynamicFeed';
import {getEntityType} from "../domain";

export {
    ExternalDocumentIcon,
    DomainModelIcon,
    DomainGroupIcon,
    SubjectIcon,
    PropertyGroupIcon,
    PropertyIcon,
    ValueIcon,
    DefaultIcon,
    RelationshipIcon,
    DataTemplateIcon,
    DomainClassIcon
}

type ConceptIconProps = {
    typeName: string,
    tags: TagPropsFragment[] | undefined | null
}

const ConceptIcon: FC<ConceptIconProps & SvgIconProps> = (props) => {
    const {
        typeName,
        tags,
        ...otherProps
    } = props;

    if (typeName.startsWith("XtdRel")) {
        return <RelationshipIcon {...otherProps}/>;
    }

    const tagIds = tags?.map(tag => tag.id);
    const entityType = getEntityType(typeName.substring(3), tagIds);

    if (entityType) {
        return <entityType.Icon {...otherProps} />;
    }

    return <DefaultIcon {...otherProps} />;
}

export default ConceptIcon;
