import DomainModelIcon from "@material-ui/icons/Category";
import DomainClassIcon from "@material-ui/icons/Class";
import ReferenceDocumentIcon from "@material-ui/icons/Gavel";
import DomainGroupIcon from "@material-ui/icons/FolderSpecial";
import PropertyGroupIcon from "@material-ui/icons/AccountTree";
import {SvgIconComponent} from "@material-ui/icons";
import PropertyIcon from "@material-ui/icons/Palette";
import ValueIcon from "@material-ui/icons/LocalOffer";
import RelationshipIcon from '@material-ui/icons/SettingsEthernet';
import DataTemplateIcon from '@material-ui/icons/DynamicFeed';
import {CatalogEntryType, EntityTypes} from "./generated/types";

export {
    ReferenceDocumentIcon,
    DomainModelIcon,
    DomainGroupIcon,
    PropertyGroupIcon,
    PropertyIcon,
    ValueIcon,
    RelationshipIcon,
    DataTemplateIcon,
    DomainClassIcon
}

export type Entity = {
    tags?: string[],
    title: string,
    titlePlural: string,
    entityType: EntityTypes // TODO: only used in search widget until API is migrated to EntryType
    entryType: CatalogEntryType,
    path: string,
    Icon: SvgIconComponent
};

export const DocumentEntity: Entity = {
    tags: undefined,
    title: "Referenzdokument",
    titlePlural: "Referenzdokumente",
    entityType: EntityTypes.XtdExternalDocument,
    entryType: CatalogEntryType.ExternalDocument,
    path: "document",
    Icon: ReferenceDocumentIcon
};

export const ModelEntity: Entity = {
    tags: ["6f96aaa7-e08f-49bb-ac63-93061d4c5db2"],
    title: "Fachmodell",
    titlePlural: "Fachmodelle",
    entityType: EntityTypes.XtdBag,
    entryType: CatalogEntryType.Bag,
    path: "model",
    Icon: DomainModelIcon
};

export const GroupEntity: Entity = {
    tags: ["5997da9b-a716-45ae-84a9-e2a7d186bcf9"],
    title: "Gruppe",
    titlePlural: "Gruppen",
    entityType: EntityTypes.XtdBag,
    entryType: CatalogEntryType.Bag,
    path: "group",
    Icon: DomainGroupIcon
};

export const ClassEntity: Entity = {
    tags: ["e9b2cd6d-76f7-4c55-96ab-12d084d21e96"],
    title: "Klasse",
    titlePlural: "Klassen",
    entityType: EntityTypes.XtdSubject,
    entryType: CatalogEntryType.Subject,
    path: "class",
    Icon: DomainClassIcon
}

export const DataTemplateEntity: Entity = {
    tags: ["576db5b0-9cbb-4da5-9132-3eda2b2c579b"],
    title: "Datenvorlage",
    titlePlural: "Datenvorlagen",
    entityType: EntityTypes.XtdBag,
    entryType: CatalogEntryType.Bag,
    path: "data-template",
    Icon: DataTemplateIcon
}

export const PropertyGroupEntity: Entity = {
    tags: ["a27c8e3c-5fd1-47c9-806a-6ded070efae8"],
    title: "Merkmalsgruppe",
    titlePlural: "Merkmalsgruppen",
    entityType: EntityTypes.XtdNest,
    entryType: CatalogEntryType.Nest,
    path: "property-group",
    Icon: PropertyGroupIcon
}

export const PropertyEntity: Entity = {
    tags: undefined,
    title: "Merkmal",
    titlePlural: "Merkmale",
    entityType: EntityTypes.XtdProperty,
    entryType: CatalogEntryType.Property,
    path: "property",
    Icon: PropertyIcon
}

export const ValueEntity: Entity = {
    tags: undefined,
    title: "Wert",
    titlePlural: "Werte",
    entityType: EntityTypes.XtdValue,
    entryType: CatalogEntryType.Value,
    path: "value",
    Icon: ValueIcon
}

export const Domain = [
    DocumentEntity,
    ModelEntity,
    GroupEntity,
    ClassEntity,
    DataTemplateEntity,
    PropertyGroupEntity,
    PropertyEntity,
    ValueEntity
];

export function getEntityType(entryType: string, tags?: string[]): Entity | null {
    if (!(entryType in CatalogEntryType)) {
        return null;
    }

    for (const id of tags ?? []) {
        for (const entityType of Domain) {
            if (entityType.tags?.includes(id)) {
                return entityType;
            }
        }
    }

    for (const entityType of Domain) {
        if (entryType === entityType.entryType) {
            return entityType;
        }
    }

    return null;
}
