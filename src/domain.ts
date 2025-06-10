import { tolgee } from './providers/tolgee'; // Importiere deine global initialisierte Tolgee-Instanz
import DomainModelIcon from "@mui/icons-material/Category";
import DomainClassIcon from "@mui/icons-material/Class";
import ReferenceDocumentIcon from "@mui/icons-material/Gavel";
import DomainGroupIcon from "@mui/icons-material/FolderSpecial";
import PropertyGroupIcon from "@mui/icons-material/AccountTree";
import { SvgIconComponent } from "@mui/icons-material";
import PropertyIcon from "@mui/icons-material/Palette";
import ValueIcon from "@mui/icons-material/LocalOffer";
import RelationshipIcon from '@mui/icons-material/SettingsEthernet';
import DataTemplateIcon from '@mui/icons-material/DynamicFeed';
import { CatalogRecordType } from "./generated/types";
import MeasureIcon from '@mui/icons-material/Speed';
import UnitIcon from '@mui/icons-material/AcUnit';
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";


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
  HelpOutlineIcon
};

export type Entity = {
  tags?: string[];
  readonly title: string;
  readonly titlePlural: string;
  readonly description?: string;
  recordType: CatalogRecordType;
  path: string;
  Icon: SvgIconComponent;
  export?: boolean;
};

export const DocumentEntity: Entity = {
  tags: ["992c8887-301e-4764-891c-ae954426fc22"],
  get title() { return tolgee.t('document.title'); },         
  get titlePlural() { return tolgee.t("document.titlePlural"); },  
  get description() { return tolgee.t("document.description"); },   
  recordType: CatalogRecordType.ExternalDocument,
  path: "document",
  Icon: ReferenceDocumentIcon,
  export: true
};

export const DictionaryEntity: Entity = {
  tags: ["c1c7016b-f85c-43c7-a696-71e75555062b"],
  get title() { return tolgee.t("dictionary.title"); },
  get titlePlural() { return tolgee.t("dictionary.titlePlural"); },
  recordType: CatalogRecordType.Dictionary,
  path: "dictionary",
  Icon: DomainModelIcon,
  export: true
};

export const ModelEntity: Entity = {
  tags: ["6f96aaa7-e08f-49bb-ac63-93061d4c5db2"],
  get title() { return tolgee.t("model.title"); },
  get titlePlural() { return tolgee.t("model.titlePlural"); },
  recordType: CatalogRecordType.Subject,
  path: "model",
  Icon: DomainModelIcon,
  export: true
};

export const GroupEntity: Entity = {
  tags: ["5997da9b-a716-45ae-84a9-e2a7d186bcf9"],
  get title() { return tolgee.t("theme.title"); },
  get titlePlural() { return tolgee.t("theme.titlePlural"); },
  recordType: CatalogRecordType.Subject,
  path: "theme",
  Icon: DomainGroupIcon,
  export: true
};

export const ClassEntity: Entity = {
  tags: ["e9b2cd6d-76f7-4c55-96ab-12d084d21e96"],
  get title() { return tolgee.t("class.title"); },
  get titlePlural() { return tolgee.t("class.titlePlural"); },
  recordType: CatalogRecordType.Subject,
  path: "class",
  Icon: DomainClassIcon,
  export: true
};

export const DataTemplateEntity: Entity = {
  tags: ["576db5b0-9cbb-4da5-9132-3eda2b2c579b"],
  get title() { return tolgee.t("dataTemplate.title"); },
  get titlePlural() { return tolgee.t("dataTemplate.titlePlural"); },
  recordType: CatalogRecordType.Subject,
  path: "data-template",
  Icon: DataTemplateIcon
};

export const PropertyGroupEntity: Entity = {
  tags: ["a27c8e3c-5fd1-47c9-806a-6ded070efae8"],
  get title() { return tolgee.t("propertyGroup.title"); },
  get titlePlural() { return tolgee.t("propertyGroup.titlePlural"); },
  recordType: CatalogRecordType.Subject,
  path: "property-group",
  Icon: PropertyGroupIcon,
  export: true
};

export const PropertyEntity: Entity = {
  tags: ["d4b0ba83-eb40-4997-85e0-9d6181e85639"],
  get title() { return tolgee.t("property.title"); },
  get titlePlural() { return tolgee.t("property.titlePlural"); },
  recordType: CatalogRecordType.Property,
  path: "property",
  Icon: PropertyIcon,
  export: true
};

export const ValueListEntity: Entity = {
  tags: ["57172977-a42f-4e05-8109-cd906ec7f43c"],
  get title() { return tolgee.t("valuelist.title"); },
  get titlePlural() { return tolgee.t("valuelist.titlePlural"); },
  recordType: CatalogRecordType.ValueList,
  path: "valuelist",
  Icon: MeasureIcon,
  export: true
};

export const UnitEntity: Entity = {
  tags: ["09da1ebb-8641-47fa-b82e-8588c7fef09e"],
  get title() { return tolgee.t("unit.title"); },
  get titlePlural() { return tolgee.t("unit.titlePlural"); },
  recordType: CatalogRecordType.Unit,
  path: "unit",
  Icon: UnitIcon,
  export: true
};

export const ValueEntity: Entity = {
  tags: ["a5d13c88-7d83-42c1-8da2-5dc6d8e8a749"],
  get title() { return tolgee.t("value.title"); },
  get titlePlural() { return tolgee.t("value.titlePlural"); },
  recordType: CatalogRecordType.Value,
  path: "value",
  Icon: ValueIcon,
  export: true
};

export const UndefinedEntity: Entity = {
  tags: [],
  get title() { return "undefined" },
  get titlePlural() { return "undefined"; },
  recordType: CatalogRecordType.RelationshipToSubject,
  path: "value",
  Icon: HelpOutlineIcon,
  export: true
};

export const Domain = [
  DocumentEntity,
  ModelEntity,
  DictionaryEntity,
  GroupEntity,
  ClassEntity,
  DataTemplateEntity,
  PropertyGroupEntity,
  PropertyEntity,
  ValueListEntity,
  UnitEntity,
  ValueEntity
];

export function getEntityType(recordType: string, tags?: string[]): Entity {
  if (tags?.length === 0) {
    return UndefinedEntity;
  }
  for (const id of tags || []) {
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
