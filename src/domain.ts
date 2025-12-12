import { tolgee } from './providers/tolgee';
import ThemeIcon from "@mui/icons-material/Category";
import DomainClassIcon from "@mui/icons-material/Class";
import ReferenceDocumentIcon from "@mui/icons-material/Gavel";
import PropertyGroupIcon from "@mui/icons-material/AccountTree";
import { SvgIconComponent } from "@mui/icons-material";
import PropertyIcon from "@mui/icons-material/Palette";
import ValueIcon from "@mui/icons-material/LocalOffer";
import RelationshipIcon from '@mui/icons-material/SettingsEthernet';
import DataTemplateIcon from '@mui/icons-material/DynamicFeed';
import { CatalogRecordType } from "./generated/graphql";
import UnitIcon from '@mui/icons-material/AcUnit';
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DictionaryIcon from '@mui/icons-material/ImportContacts';
import MeasureIcon from '@mui/icons-material/FormatListNumbered';


export {
  DataTemplateIcon,
  DomainClassIcon,
  ThemeIcon,
  MeasureIcon,
  PropertyGroupIcon,
  PropertyIcon,
  ReferenceDocumentIcon,
  RelationshipIcon,
  UnitIcon,
  ValueIcon,
  HelpOutlineIcon,
  DictionaryIcon
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
  Icon: DictionaryIcon,
  export: true
};

export const ThemeEntity: Entity = {
  tags: ["5997da9b-a716-45ae-84a9-e2a7d186bcf9"],
  get title() { return tolgee.t("theme.title"); },
  get titlePlural() { return tolgee.t("theme.titlePlural"); },
  recordType: CatalogRecordType.Subject,
  path: "theme",
  Icon: ThemeIcon,
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

export const PropertyGroupEntity: Entity = {
  tags: ["7c9ffe6e-3c8b-4cd2-b57b-4cd102325603"],
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

export const Domain = [
  DocumentEntity,
  DictionaryEntity,
  ThemeEntity,
  ClassEntity,
  PropertyGroupEntity,
  PropertyEntity,
  ValueListEntity,
  UnitEntity,
  ValueEntity
];

export function getEntityType(recordType: string, tags?: string[]): Entity {
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
