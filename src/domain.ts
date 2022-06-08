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
import {CatalogRecordType} from "./generated/types";
import MeasureIcon from '@material-ui/icons/Speed';
import UnitIcon from '@material-ui/icons/AcUnit';


export {
    DataTemplateIcon,
    DomainClassIcon,
    DomainGroupIcon,
    DomainModelIcon,
    MeasureIcon,
    PropertyGroupIcon,
    PropertyIcon,
    ReferenceDocumentIcon,
    RelationshipIcon,
    UnitIcon,
    ValueIcon,
}

export type Entity = {
    tags?: string[];
    title: string;
    titlePlural: string;
    description?: string;
    recordType: CatalogRecordType;
    path: string;
    Icon: SvgIconComponent;
    export?: boolean;
};

export const DocumentEntity: Entity = {
    // tags: undefined,
    tags: ["992c8887-301e-4764-891c-ae954426fc22"],
    title: "Referenzdokument",
    titlePlural: "Referenzdokumente",
    description: "Ein Eintrag vom Typ Referenzdokument wird genutzt, um externe Dokumente, Bücher oder andere schriftliche Informationen abzubilden.",
    recordType: CatalogRecordType.ExternalDocument,
    path: "document",
    Icon: ReferenceDocumentIcon,
    export: true
};

export const ModelEntity: Entity = {
    tags: ["6f96aaa7-e08f-49bb-ac63-93061d4c5db2"],
    title: "Fachmodell",
    titlePlural: "Fachmodelle",
    recordType: CatalogRecordType.Bag,
    path: "model",
    Icon: DomainModelIcon,
    export: true
};

export const GroupEntity: Entity = {
    tags: ["5997da9b-a716-45ae-84a9-e2a7d186bcf9"],
    title: "Gruppe",
    titlePlural: "Gruppen",
    recordType: CatalogRecordType.Bag,
    path: "group",
    Icon: DomainGroupIcon,
    export: true
};

export const ClassEntity: Entity = {
    tags: ["e9b2cd6d-76f7-4c55-96ab-12d084d21e96"],
    title: "Klasse",
    titlePlural: "Klassen",
    recordType: CatalogRecordType.Subject,
    path: "class",
    Icon: DomainClassIcon,
    export: true
}

export const DataTemplateEntity: Entity = {
    tags: ["576db5b0-9cbb-4da5-9132-3eda2b2c579b"],
    title: "Datenvorlage",
    titlePlural: "Datenvorlagen",
    recordType: CatalogRecordType.Bag,
    path: "data-template",
    Icon: DataTemplateIcon
}

export const PropertyGroupEntity: Entity = {
    tags: ["a27c8e3c-5fd1-47c9-806a-6ded070efae8"],
    title: "Merkmalsgruppe",
    titlePlural: "Merkmalsgruppen",
    recordType: CatalogRecordType.Nest,
    path: "property-group",
    Icon: PropertyGroupIcon,
    export: true
}

export const PropertyEntity: Entity = {
    tags: ["d4b0ba83-eb40-4997-85e0-9d6181e85639"],
    title: "Merkmal",
    titlePlural: "Merkmale",
    recordType: CatalogRecordType.Property,
    path: "property",
    Icon: PropertyIcon,
    export: true
}

export const MeasureEntity: Entity = {
    tags: ["57172977-a42f-4e05-8109-cd906ec7f43c"],
    title: "Größe",
    titlePlural: "Größen",
    recordType: CatalogRecordType.Measure,
    path: "measure",
    Icon: MeasureIcon,
    export: true
}

export const UnitEntity: Entity = {
    tags: ["09da1ebb-8641-47fa-b82e-8588c7fef09e"],
    title: "Maßeinheit",
    titlePlural: "Maßeinheiten",
    recordType: CatalogRecordType.Unit,
    path: "unit",
    Icon: UnitIcon,
    export: true
}

export const ValueEntity: Entity = {
    tags: ["a5d13c88-7d83-42c1-8da2-5dc6d8e8a749"],
    title: "Wert",
    titlePlural: "Werte",
    recordType: CatalogRecordType.Value,
    path: "value",
    Icon: ValueIcon,
    export: true
}

export const Domain = [
    DocumentEntity,
    ModelEntity,
    GroupEntity,
    ClassEntity,
    DataTemplateEntity,
    PropertyGroupEntity,
    PropertyEntity,
    MeasureEntity,
    UnitEntity,
    ValueEntity
];

export function getEntityType(recordType: string, tags?: string[]): Entity {

    for (const id of tags ?? []) {
        for (const entityType of Domain) {
            if (entityType.tags?.includes(id)) {
                return entityType;
            }
        }
    }

    for (const entityType of Domain) {
        if (recordType === entityType.recordType) {
            return entityType;
        }
    }

    throw new Error(`No domain entity definition found for record type ${recordType} tagged ${tags}`);
}
