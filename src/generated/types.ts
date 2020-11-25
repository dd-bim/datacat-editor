import * as Apollo from '@apollo/client';
import {gql} from '@apollo/client';

export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};



export type AccountFilterInput = {
  query?: Maybe<Scalars['String']>;
  expired?: Maybe<Scalars['Boolean']>;
  locked?: Maybe<Scalars['Boolean']>;
  credentialsExpired?: Maybe<Scalars['Boolean']>;
  pageNumber?: Maybe<Scalars['Int']>;
  pageSize?: Maybe<Scalars['Int']>;
};

export enum AccountStatus {
  Admin = 'Admin',
  Verified = 'Verified',
  Unverified = 'Unverified'
}

export type AccountStatusUpdateInput = {
  username: Scalars['ID'];
  status: AccountStatus;
};

export type AccountUpdateInput = {
  username: Scalars['ID'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  email: Scalars['String'];
  organization: Scalars['String'];
};

export type AddDescriptionInput = {
  catalogEntryId: Scalars['ID'];
  description: TranslationInput;
};


export type AddNameInput = {
  catalogEntryId: Scalars['ID'];
  name: TranslationInput;
};


export type AddTagInput = {
  catalogEntryId: Scalars['ID'];
  tagId: Scalars['ID'];
};



export type CatalogEntryFilterInput = {
  catalogEntryType?: Maybe<CatalogEntryTypeFilterInput>;
  tags?: Maybe<TagFilterInput>;
};

export enum CatalogEntryType {
  Actor = 'Actor',
  Activity = 'Activity',
  Bag = 'Bag',
  Classification = 'Classification',
  ExternalDocument = 'ExternalDocument',
  Measure = 'Measure',
  Nest = 'Nest',
  Subject = 'Subject',
  Property = 'Property',
  Unit = 'Unit',
  Value = 'Value'
}

export type CatalogEntryTypeFilterInput = {
  in?: Maybe<Array<CatalogEntryType>>;
};




export type CreateCatalogEntryInput = {
  catalogEntryType: CatalogEntryType;
  properties: PropertiesInput;
  tags?: Maybe<Array<Scalars['ID']>>;
};


export type CreateOneToManyRelationshipInput = {
  relationshipType: OneToManyRelationshipType;
  properties?: Maybe<PropertiesInput>;
  from: Scalars['ID'];
  to: Array<Scalars['ID']>;
};


export type CreateOneToOneRelationshipInput = {
  relationshipType: OneToOneRelationshipType;
  properties?: Maybe<PropertiesInput>;
  from: Scalars['ID'];
  to: Scalars['ID'];
};


export type CreateQualifiedOneToOneRelationshipInput = {
  relationshipType: QualifiedOneToOneRelationshipType;
  properties?: Maybe<PropertiesInput>;
  from: Scalars['ID'];
  to: Scalars['ID'];
  with: Array<Scalars['ID']>;
};


export type CreateTagInput = {
  name: Scalars['String'];
};


export type DeleteCatalogEntryInput = {
  catalogEntryId: Scalars['ID'];
};


export type DeleteDescriptionInput = {
  catalogEntryId: Scalars['ID'];
  descriptionId: Scalars['ID'];
};


export type DeleteNameInput = {
  catalogEntryId: Scalars['ID'];
  nameId: Scalars['ID'];
};


export type DeleteRelationshipInput = {
  id: Scalars['ID'];
};


export type DeleteTagInput = {
  tagId: Scalars['ID'];
};



/**  inputs */
export enum EntityTypes {
  XtdExternalDocument = 'XtdExternalDocument',
  XtdRoot = 'XtdRoot',
  XtdObject = 'XtdObject',
  XtdActivity = 'XtdActivity',
  XtdActor = 'XtdActor',
  XtdClassification = 'XtdClassification',
  XtdMeasureWithUnit = 'XtdMeasureWithUnit',
  XtdProperty = 'XtdProperty',
  XtdSubject = 'XtdSubject',
  XtdUnit = 'XtdUnit',
  XtdValue = 'XtdValue',
  XtdCollection = 'XtdCollection',
  XtdBag = 'XtdBag',
  XtdNest = 'XtdNest',
  XtdRelationship = 'XtdRelationship',
  XtdRelActsUpon = 'XtdRelActsUpon',
  XtdRelAssignsCollections = 'XtdRelAssignsCollections',
  XtdRelAssignsMeasures = 'XtdRelAssignsMeasures',
  XtdRelAssignsProperties = 'XtdRelAssignsProperties',
  XtdRelAssignsPropertyWithValues = 'XtdRelAssignsPropertyWithValues',
  XtdRelAssignsUnit = 'XtdRelAssignsUnit',
  XtdRelAssignsValues = 'XtdRelAssignsValues',
  XtdRelAssociates = 'XtdRelAssociates',
  XtdRelClassifies = 'XtdRelClassifies',
  XtdRelCollects = 'XtdRelCollects',
  XtdRelComposes = 'XtdRelComposes',
  XtdRelDocuments = 'XtdRelDocuments',
  XtdRelGroups = 'XtdRelGroups',
  XtdRelSequences = 'XtdRelSequences',
  XtdRelSpecializes = 'XtdRelSpecializes'
}

export type FilterInput = {
  query?: Maybe<Scalars['String']>;
  idIn?: Maybe<Array<Scalars['ID']>>;
  idNotIn?: Maybe<Array<Scalars['ID']>>;
  tagged?: Maybe<Array<Scalars['ID']>>;
  pageNumber?: Maybe<Scalars['Int']>;
  pageSize?: Maybe<Scalars['Int']>;
};

export type HierarchyFilterInput = {
  rootNodeFilter: HierarchyRootNodeFilterInput;
};


export type HierarchyRootNodeFilterInput = {
  catalogEntryTypeIn?: Maybe<Array<CatalogEntryType>>;
  catalogEntryTypeNotIn?: Maybe<Array<CatalogEntryType>>;
  idIn?: Maybe<Array<Scalars['ID']>>;
  idNotIn?: Maybe<Array<Scalars['ID']>>;
  tagged?: Maybe<Array<Scalars['ID']>>;
};



/**  Query type */
export type LanguageFilterInput = {
  query?: Maybe<Scalars['String']>;
  excludeLanguageTags?: Maybe<Array<Scalars['String']>>;
};

export type LocaleInput = {
  languageTag: Scalars['ID'];
};

export type LocalizationInput = {
  languageTags?: Maybe<Array<Scalars['String']>>;
};


export type LoginInput = {
  username: Scalars['ID'];
  password: Scalars['String'];
};


export type NominalValueInput = {
  valueRole: ValueRole;
  valueType: ValueType;
  nominalValue?: Maybe<Scalars['String']>;
};


export enum OneToManyRelationshipType {
  ActsUpon = 'ActsUpon',
  AssignsCollections = 'AssignsCollections',
  AssignsMeasures = 'AssignsMeasures',
  AssignsProperties = 'AssignsProperties',
  AssignsUnits = 'AssignsUnits',
  AssignsValues = 'AssignsValues',
  Associates = 'Associates',
  Collects = 'Collects',
  Composes = 'Composes',
  Documents = 'Documents',
  Groups = 'Groups',
  Specializes = 'Specializes'
}


export enum OneToOneRelationshipType {
  Sequences = 'Sequences'
}



export type ProfileUpdateInput = {
  username: Scalars['ID'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  email: Scalars['String'];
  organization: Scalars['String'];
};

export type PropertiesInput = {
  id?: Maybe<Scalars['ID']>;
  version?: Maybe<VersionInput>;
  names: Array<TranslationInput>;
  descriptions?: Maybe<Array<TranslationInput>>;
};


export enum QualifiedOneToOneRelationshipType {
  AssignsPropertyWithValues = 'AssignsPropertyWithValues'
}



export type RemoveTagInput = {
  catalogEntryId: Scalars['ID'];
  tagId: Scalars['ID'];
};


export type SearchInput = {
  query?: Maybe<Scalars['String']>;
  filters?: Maybe<Array<CatalogEntryFilterInput>>;
  entityTypeIn?: Maybe<Array<EntityTypes>>;
  entityTypeNotIn?: Maybe<Array<EntityTypes>>;
  idIn?: Maybe<Array<Scalars['ID']>>;
  idNotIn?: Maybe<Array<Scalars['ID']>>;
  tagged?: Maybe<Array<Scalars['ID']>>;
  pageNumber?: Maybe<Scalars['Int']>;
  pageSize?: Maybe<Scalars['Int']>;
};


export type SetNominalValueInput = {
  valueId: Scalars['ID'];
  nominalValue: NominalValueInput;
};


export type SetToleranceInput = {
  valueId: Scalars['ID'];
  tolerance: ToleranceInput;
};


export type SetVersionInput = {
  catalogEntryId: Scalars['ID'];
  version: VersionInput;
};


export type SignupInput = {
  username: Scalars['ID'];
  password: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  email: Scalars['String'];
  organization: Scalars['String'];
};



export type TagFilterInput = {
  in?: Maybe<Array<Scalars['ID']>>;
};

export type ToleranceInput = {
  toleranceType: ToleranceType;
  lowerTolerance?: Maybe<Scalars['String']>;
  upperTolerance?: Maybe<Scalars['String']>;
};

export enum ToleranceType {
  Realvalue = 'Realvalue',
  Percentage = 'Percentage'
}


export type TranslationInput = {
  catalogEntryId?: Maybe<Scalars['ID']>;
  languageTag: Scalars['ID'];
  value: Scalars['String'];
};

export type TranslationUpdateInput = {
  translationId: Scalars['ID'];
  value: Scalars['String'];
};

export type UnsetNominalValueInput = {
  valueId: Scalars['ID'];
};


export type UnsetToleranceInput = {
  valueId: Scalars['ID'];
};


export type UpdateDescriptionInput = {
  catalogEntryId: Scalars['ID'];
  description: TranslationUpdateInput;
};


export type UpdateNameInput = {
  catalogEntryId: Scalars['ID'];
  name: TranslationUpdateInput;
};


export type UpdateTagInput = {
  tagId: Scalars['ID'];
  name: Scalars['String'];
};


export enum ValueRole {
  Nominal = 'Nominal',
  Maximum = 'Maximum',
  Minimum = 'Minimum'
}

export enum ValueType {
  String = 'String',
  Number = 'Number',
  Integer = 'Integer',
  Real = 'Real',
  Boolean = 'Boolean',
  Logical = 'Logical'
}

export type VersionInput = {
  versionId?: Maybe<Scalars['String']>;
  versionDate?: Maybe<Scalars['String']>;
};


























































export type UserProfileFragment = { username: string, firstName: string, lastName: string, email: string, organization: string };

export type PagePropsFragment = { totalPages: number, pageNumber: number, hasNext: boolean, hasPrevious: boolean };

export type LanguagePropsFragment = { id: string, languageTag: string, displayCountry: string, displayLanguage: string };

export type TranslationPropsFragment = { id: string, value: string, language: LanguagePropsFragment };

export type TagPropsFragment = { id: string, name: string };

type ItemProps_XtdActivity_Fragment = { __typename: 'XtdActivity', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdActor_Fragment = { __typename: 'XtdActor', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdBag_Fragment = { __typename: 'XtdBag', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdClassification_Fragment = { __typename: 'XtdClassification', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdExternalDocument_Fragment = { __typename: 'XtdExternalDocument', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdMeasureWithUnit_Fragment = { __typename: 'XtdMeasureWithUnit', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdNest_Fragment = { __typename: 'XtdNest', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdProperty_Fragment = { __typename: 'XtdProperty', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdRelActsUpon_Fragment = { __typename: 'XtdRelActsUpon', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdRelAssignsCollections_Fragment = { __typename: 'XtdRelAssignsCollections', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdRelAssignsMeasures_Fragment = { __typename: 'XtdRelAssignsMeasures', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdRelAssignsProperties_Fragment = { __typename: 'XtdRelAssignsProperties', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdRelAssignsPropertyWithValues_Fragment = { __typename: 'XtdRelAssignsPropertyWithValues', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdRelAssignsUnits_Fragment = { __typename: 'XtdRelAssignsUnits', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdRelAssignsValues_Fragment = { __typename: 'XtdRelAssignsValues', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdRelAssociates_Fragment = { __typename: 'XtdRelAssociates', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdRelCollects_Fragment = { __typename: 'XtdRelCollects', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdRelComposes_Fragment = { __typename: 'XtdRelComposes', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdRelDocuments_Fragment = { __typename: 'XtdRelDocuments', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdRelGroups_Fragment = { __typename: 'XtdRelGroups', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdRelSequences_Fragment = { __typename: 'XtdRelSequences', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdRelSpecializes_Fragment = { __typename: 'XtdRelSpecializes', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdSubject_Fragment = { __typename: 'XtdSubject', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdUnit_Fragment = { __typename: 'XtdUnit', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

type ItemProps_XtdValue_Fragment = { __typename: 'XtdValue', id: string, name?: Maybe<string>, description?: Maybe<string>, tags: Array<TagPropsFragment> };

export type ItemPropsFragment = ItemProps_XtdActivity_Fragment | ItemProps_XtdActor_Fragment | ItemProps_XtdBag_Fragment | ItemProps_XtdClassification_Fragment | ItemProps_XtdExternalDocument_Fragment | ItemProps_XtdMeasureWithUnit_Fragment | ItemProps_XtdNest_Fragment | ItemProps_XtdProperty_Fragment | ItemProps_XtdRelActsUpon_Fragment | ItemProps_XtdRelAssignsCollections_Fragment | ItemProps_XtdRelAssignsMeasures_Fragment | ItemProps_XtdRelAssignsProperties_Fragment | ItemProps_XtdRelAssignsPropertyWithValues_Fragment | ItemProps_XtdRelAssignsUnits_Fragment | ItemProps_XtdRelAssignsValues_Fragment | ItemProps_XtdRelAssociates_Fragment | ItemProps_XtdRelCollects_Fragment | ItemProps_XtdRelComposes_Fragment | ItemProps_XtdRelDocuments_Fragment | ItemProps_XtdRelGroups_Fragment | ItemProps_XtdRelSequences_Fragment | ItemProps_XtdRelSpecializes_Fragment | ItemProps_XtdSubject_Fragment | ItemProps_XtdUnit_Fragment | ItemProps_XtdValue_Fragment;

type SearchResultProps_XtdActivity_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdActivity_Fragment
);

type SearchResultProps_XtdActor_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdActor_Fragment
);

type SearchResultProps_XtdBag_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdBag_Fragment
);

type SearchResultProps_XtdClassification_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdClassification_Fragment
);

type SearchResultProps_XtdExternalDocument_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdExternalDocument_Fragment
);

type SearchResultProps_XtdMeasureWithUnit_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdMeasureWithUnit_Fragment
);

type SearchResultProps_XtdNest_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdNest_Fragment
);

type SearchResultProps_XtdProperty_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdProperty_Fragment
);

type SearchResultProps_XtdRelActsUpon_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdRelActsUpon_Fragment
);

type SearchResultProps_XtdRelAssignsCollections_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdRelAssignsCollections_Fragment
);

type SearchResultProps_XtdRelAssignsMeasures_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdRelAssignsMeasures_Fragment
);

type SearchResultProps_XtdRelAssignsProperties_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdRelAssignsProperties_Fragment
);

type SearchResultProps_XtdRelAssignsPropertyWithValues_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdRelAssignsPropertyWithValues_Fragment
);

type SearchResultProps_XtdRelAssignsUnits_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdRelAssignsUnits_Fragment
);

type SearchResultProps_XtdRelAssignsValues_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdRelAssignsValues_Fragment
);

type SearchResultProps_XtdRelAssociates_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdRelAssociates_Fragment
);

type SearchResultProps_XtdRelCollects_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdRelCollects_Fragment
);

type SearchResultProps_XtdRelComposes_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdRelComposes_Fragment
);

type SearchResultProps_XtdRelDocuments_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdRelDocuments_Fragment
);

type SearchResultProps_XtdRelGroups_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdRelGroups_Fragment
);

type SearchResultProps_XtdRelSequences_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdRelSequences_Fragment
);

type SearchResultProps_XtdRelSpecializes_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdRelSpecializes_Fragment
);

type SearchResultProps_XtdSubject_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdSubject_Fragment
);

type SearchResultProps_XtdUnit_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdUnit_Fragment
);

type SearchResultProps_XtdValue_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string> }
  & ItemProps_XtdValue_Fragment
);

export type SearchResultPropsFragment = SearchResultProps_XtdActivity_Fragment | SearchResultProps_XtdActor_Fragment | SearchResultProps_XtdBag_Fragment | SearchResultProps_XtdClassification_Fragment | SearchResultProps_XtdExternalDocument_Fragment | SearchResultProps_XtdMeasureWithUnit_Fragment | SearchResultProps_XtdNest_Fragment | SearchResultProps_XtdProperty_Fragment | SearchResultProps_XtdRelActsUpon_Fragment | SearchResultProps_XtdRelAssignsCollections_Fragment | SearchResultProps_XtdRelAssignsMeasures_Fragment | SearchResultProps_XtdRelAssignsProperties_Fragment | SearchResultProps_XtdRelAssignsPropertyWithValues_Fragment | SearchResultProps_XtdRelAssignsUnits_Fragment | SearchResultProps_XtdRelAssignsValues_Fragment | SearchResultProps_XtdRelAssociates_Fragment | SearchResultProps_XtdRelCollects_Fragment | SearchResultProps_XtdRelComposes_Fragment | SearchResultProps_XtdRelDocuments_Fragment | SearchResultProps_XtdRelGroups_Fragment | SearchResultProps_XtdRelSequences_Fragment | SearchResultProps_XtdRelSpecializes_Fragment | SearchResultProps_XtdSubject_Fragment | SearchResultProps_XtdUnit_Fragment | SearchResultProps_XtdValue_Fragment;

type ConceptProps_XtdActivity_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdActivity_Fragment
);

type ConceptProps_XtdActor_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdActor_Fragment
);

type ConceptProps_XtdBag_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdBag_Fragment
);

type ConceptProps_XtdClassification_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdClassification_Fragment
);

type ConceptProps_XtdExternalDocument_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdExternalDocument_Fragment
);

type ConceptProps_XtdMeasureWithUnit_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdMeasureWithUnit_Fragment
);

type ConceptProps_XtdNest_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdNest_Fragment
);

type ConceptProps_XtdProperty_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdProperty_Fragment
);

type ConceptProps_XtdRelActsUpon_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdRelActsUpon_Fragment
);

type ConceptProps_XtdRelAssignsCollections_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdRelAssignsCollections_Fragment
);

type ConceptProps_XtdRelAssignsMeasures_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdRelAssignsMeasures_Fragment
);

type ConceptProps_XtdRelAssignsProperties_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdRelAssignsProperties_Fragment
);

type ConceptProps_XtdRelAssignsPropertyWithValues_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdRelAssignsPropertyWithValues_Fragment
);

type ConceptProps_XtdRelAssignsUnits_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdRelAssignsUnits_Fragment
);

type ConceptProps_XtdRelAssignsValues_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdRelAssignsValues_Fragment
);

type ConceptProps_XtdRelAssociates_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdRelAssociates_Fragment
);

type ConceptProps_XtdRelCollects_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdRelCollects_Fragment
);

type ConceptProps_XtdRelComposes_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdRelComposes_Fragment
);

type ConceptProps_XtdRelDocuments_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdRelDocuments_Fragment
);

type ConceptProps_XtdRelGroups_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdRelGroups_Fragment
);

type ConceptProps_XtdRelSequences_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdRelSequences_Fragment
);

type ConceptProps_XtdRelSpecializes_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdRelSpecializes_Fragment
);

type ConceptProps_XtdSubject_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdSubject_Fragment
);

type ConceptProps_XtdUnit_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdUnit_Fragment
);

type ConceptProps_XtdValue_Fragment = (
  { versionId?: Maybe<string>, versionDate?: Maybe<string>, de?: Maybe<string>, en?: Maybe<string>, names: Array<TranslationPropsFragment>, descriptions: Array<TranslationPropsFragment> }
  & ItemProps_XtdValue_Fragment
);

export type ConceptPropsFragment = ConceptProps_XtdActivity_Fragment | ConceptProps_XtdActor_Fragment | ConceptProps_XtdBag_Fragment | ConceptProps_XtdClassification_Fragment | ConceptProps_XtdExternalDocument_Fragment | ConceptProps_XtdMeasureWithUnit_Fragment | ConceptProps_XtdNest_Fragment | ConceptProps_XtdProperty_Fragment | ConceptProps_XtdRelActsUpon_Fragment | ConceptProps_XtdRelAssignsCollections_Fragment | ConceptProps_XtdRelAssignsMeasures_Fragment | ConceptProps_XtdRelAssignsProperties_Fragment | ConceptProps_XtdRelAssignsPropertyWithValues_Fragment | ConceptProps_XtdRelAssignsUnits_Fragment | ConceptProps_XtdRelAssignsValues_Fragment | ConceptProps_XtdRelAssociates_Fragment | ConceptProps_XtdRelCollects_Fragment | ConceptProps_XtdRelComposes_Fragment | ConceptProps_XtdRelDocuments_Fragment | ConceptProps_XtdRelGroups_Fragment | ConceptProps_XtdRelSequences_Fragment | ConceptProps_XtdRelSpecializes_Fragment | ConceptProps_XtdSubject_Fragment | ConceptProps_XtdUnit_Fragment | ConceptProps_XtdValue_Fragment;

export type ExternalDocumentPropsFragment = ConceptProps_XtdExternalDocument_Fragment;

type ObjectProps_XtdActivity_Fragment = ConceptProps_XtdActivity_Fragment;

type ObjectProps_XtdActor_Fragment = ConceptProps_XtdActor_Fragment;

type ObjectProps_XtdClassification_Fragment = ConceptProps_XtdClassification_Fragment;

type ObjectProps_XtdMeasureWithUnit_Fragment = ConceptProps_XtdMeasureWithUnit_Fragment;

type ObjectProps_XtdProperty_Fragment = ConceptProps_XtdProperty_Fragment;

type ObjectProps_XtdSubject_Fragment = ConceptProps_XtdSubject_Fragment;

type ObjectProps_XtdUnit_Fragment = ConceptProps_XtdUnit_Fragment;

type ObjectProps_XtdValue_Fragment = ConceptProps_XtdValue_Fragment;

export type ObjectPropsFragment = ObjectProps_XtdActivity_Fragment | ObjectProps_XtdActor_Fragment | ObjectProps_XtdClassification_Fragment | ObjectProps_XtdMeasureWithUnit_Fragment | ObjectProps_XtdProperty_Fragment | ObjectProps_XtdSubject_Fragment | ObjectProps_XtdUnit_Fragment | ObjectProps_XtdValue_Fragment;

export type ValuePropsFragment = (
  { valueType?: Maybe<ValueType>, valueRole?: Maybe<ValueRole>, nominalValue?: Maybe<string>, toleranceType?: Maybe<ToleranceType>, lowerTolerance?: Maybe<string>, upperTolerance?: Maybe<string> }
  & ObjectProps_XtdValue_Fragment
);

type CollectionProps_XtdBag_Fragment = ConceptProps_XtdBag_Fragment;

type CollectionProps_XtdNest_Fragment = ConceptProps_XtdNest_Fragment;

export type CollectionPropsFragment = CollectionProps_XtdBag_Fragment | CollectionProps_XtdNest_Fragment;

type RelationshipProps_XtdRelActsUpon_Fragment = ConceptProps_XtdRelActsUpon_Fragment;

type RelationshipProps_XtdRelAssignsCollections_Fragment = ConceptProps_XtdRelAssignsCollections_Fragment;

type RelationshipProps_XtdRelAssignsMeasures_Fragment = ConceptProps_XtdRelAssignsMeasures_Fragment;

type RelationshipProps_XtdRelAssignsProperties_Fragment = ConceptProps_XtdRelAssignsProperties_Fragment;

type RelationshipProps_XtdRelAssignsPropertyWithValues_Fragment = ConceptProps_XtdRelAssignsPropertyWithValues_Fragment;

type RelationshipProps_XtdRelAssignsUnits_Fragment = ConceptProps_XtdRelAssignsUnits_Fragment;

type RelationshipProps_XtdRelAssignsValues_Fragment = ConceptProps_XtdRelAssignsValues_Fragment;

type RelationshipProps_XtdRelAssociates_Fragment = ConceptProps_XtdRelAssociates_Fragment;

type RelationshipProps_XtdRelCollects_Fragment = ConceptProps_XtdRelCollects_Fragment;

type RelationshipProps_XtdRelComposes_Fragment = ConceptProps_XtdRelComposes_Fragment;

type RelationshipProps_XtdRelDocuments_Fragment = ConceptProps_XtdRelDocuments_Fragment;

type RelationshipProps_XtdRelGroups_Fragment = ConceptProps_XtdRelGroups_Fragment;

type RelationshipProps_XtdRelSequences_Fragment = ConceptProps_XtdRelSequences_Fragment;

type RelationshipProps_XtdRelSpecializes_Fragment = ConceptProps_XtdRelSpecializes_Fragment;

export type RelationshipPropsFragment = RelationshipProps_XtdRelActsUpon_Fragment | RelationshipProps_XtdRelAssignsCollections_Fragment | RelationshipProps_XtdRelAssignsMeasures_Fragment | RelationshipProps_XtdRelAssignsProperties_Fragment | RelationshipProps_XtdRelAssignsPropertyWithValues_Fragment | RelationshipProps_XtdRelAssignsUnits_Fragment | RelationshipProps_XtdRelAssignsValues_Fragment | RelationshipProps_XtdRelAssociates_Fragment | RelationshipProps_XtdRelCollects_Fragment | RelationshipProps_XtdRelComposes_Fragment | RelationshipProps_XtdRelDocuments_Fragment | RelationshipProps_XtdRelGroups_Fragment | RelationshipProps_XtdRelSequences_Fragment | RelationshipProps_XtdRelSpecializes_Fragment;

export type DocumentsPropsFragment = (
  { relatingDocument: ExternalDocumentPropsFragment, relatedThings: Array<SearchResultProps_XtdActivity_Fragment | SearchResultProps_XtdActor_Fragment | SearchResultProps_XtdBag_Fragment | SearchResultProps_XtdClassification_Fragment | SearchResultProps_XtdMeasureWithUnit_Fragment | SearchResultProps_XtdNest_Fragment | SearchResultProps_XtdProperty_Fragment | SearchResultProps_XtdSubject_Fragment | SearchResultProps_XtdUnit_Fragment | SearchResultProps_XtdValue_Fragment> }
  & RelationshipProps_XtdRelDocuments_Fragment
);

export type CollectsPropsFragment = (
  { relatingCollection: (
    { tags: Array<TagPropsFragment> }
    & SearchResultProps_XtdBag_Fragment
  ) | (
    { tags: Array<TagPropsFragment> }
    & SearchResultProps_XtdNest_Fragment
  ), relatedThings: Array<SearchResultProps_XtdActivity_Fragment | SearchResultProps_XtdActor_Fragment | SearchResultProps_XtdBag_Fragment | SearchResultProps_XtdClassification_Fragment | SearchResultProps_XtdMeasureWithUnit_Fragment | SearchResultProps_XtdNest_Fragment | SearchResultProps_XtdProperty_Fragment | SearchResultProps_XtdSubject_Fragment | SearchResultProps_XtdUnit_Fragment | SearchResultProps_XtdValue_Fragment> }
  & RelationshipProps_XtdRelCollects_Fragment
);

export type AssignsCollectionsPropsFragment = (
  { relatingObject: SearchResultProps_XtdActivity_Fragment | SearchResultProps_XtdActor_Fragment | SearchResultProps_XtdClassification_Fragment | SearchResultProps_XtdMeasureWithUnit_Fragment | SearchResultProps_XtdProperty_Fragment | SearchResultProps_XtdSubject_Fragment | SearchResultProps_XtdUnit_Fragment | SearchResultProps_XtdValue_Fragment, relatedCollections: Array<SearchResultProps_XtdBag_Fragment | SearchResultProps_XtdNest_Fragment> }
  & RelationshipProps_XtdRelAssignsCollections_Fragment
);

export type AssignsPropertiesPropsFragment = (
  { relatingObject: SearchResultProps_XtdActivity_Fragment | SearchResultProps_XtdActor_Fragment | SearchResultProps_XtdClassification_Fragment | SearchResultProps_XtdMeasureWithUnit_Fragment | SearchResultProps_XtdProperty_Fragment | SearchResultProps_XtdSubject_Fragment | SearchResultProps_XtdUnit_Fragment | SearchResultProps_XtdValue_Fragment, relatedProperties: Array<SearchResultProps_XtdProperty_Fragment> }
  & RelationshipProps_XtdRelAssignsProperties_Fragment
);

export type AssignsPropertyWithValuesPropsFragment = (
  { relatedProperty: SearchResultProps_XtdProperty_Fragment, relatedValues: Array<SearchResultProps_XtdValue_Fragment> }
  & RelationshipProps_XtdRelAssignsPropertyWithValues_Fragment
);

type MetaProps_XtdActivity_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdActor_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdBag_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdClassification_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdExternalDocument_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdMeasureWithUnit_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdNest_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdProperty_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdRelActsUpon_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdRelAssignsCollections_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdRelAssignsMeasures_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdRelAssignsProperties_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdRelAssignsPropertyWithValues_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdRelAssignsUnits_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdRelAssignsValues_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdRelAssociates_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdRelCollects_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdRelComposes_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdRelDocuments_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdRelGroups_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdRelSequences_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdRelSpecializes_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdSubject_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdUnit_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type MetaProps_XtdValue_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

export type MetaPropsFragment = MetaProps_XtdActivity_Fragment | MetaProps_XtdActor_Fragment | MetaProps_XtdBag_Fragment | MetaProps_XtdClassification_Fragment | MetaProps_XtdExternalDocument_Fragment | MetaProps_XtdMeasureWithUnit_Fragment | MetaProps_XtdNest_Fragment | MetaProps_XtdProperty_Fragment | MetaProps_XtdRelActsUpon_Fragment | MetaProps_XtdRelAssignsCollections_Fragment | MetaProps_XtdRelAssignsMeasures_Fragment | MetaProps_XtdRelAssignsProperties_Fragment | MetaProps_XtdRelAssignsPropertyWithValues_Fragment | MetaProps_XtdRelAssignsUnits_Fragment | MetaProps_XtdRelAssignsValues_Fragment | MetaProps_XtdRelAssociates_Fragment | MetaProps_XtdRelCollects_Fragment | MetaProps_XtdRelComposes_Fragment | MetaProps_XtdRelDocuments_Fragment | MetaProps_XtdRelGroups_Fragment | MetaProps_XtdRelSequences_Fragment | MetaProps_XtdRelSpecializes_Fragment | MetaProps_XtdSubject_Fragment | MetaProps_XtdUnit_Fragment | MetaProps_XtdValue_Fragment;

export type ExternalDocumentDetailPropsFragment = (
  { documents: { nodes: Array<DocumentsPropsFragment> } }
  & MetaProps_XtdExternalDocument_Fragment
  & ExternalDocumentPropsFragment
);

type ObjectDetailProps_XtdActivity_Fragment = (
  { assignedCollections: { nodes: Array<AssignsCollectionsPropsFragment> }, assignedProperties: { nodes: Array<AssignsPropertiesPropsFragment> }, collectedBy: { nodes: Array<CollectsPropsFragment> }, documentedBy: { nodes: Array<DocumentsPropsFragment> } }
  & MetaProps_XtdActivity_Fragment
  & ObjectProps_XtdActivity_Fragment
);

type ObjectDetailProps_XtdActor_Fragment = (
  { assignedCollections: { nodes: Array<AssignsCollectionsPropsFragment> }, assignedProperties: { nodes: Array<AssignsPropertiesPropsFragment> }, collectedBy: { nodes: Array<CollectsPropsFragment> }, documentedBy: { nodes: Array<DocumentsPropsFragment> } }
  & MetaProps_XtdActor_Fragment
  & ObjectProps_XtdActor_Fragment
);

type ObjectDetailProps_XtdClassification_Fragment = (
  { assignedCollections: { nodes: Array<AssignsCollectionsPropsFragment> }, assignedProperties: { nodes: Array<AssignsPropertiesPropsFragment> }, collectedBy: { nodes: Array<CollectsPropsFragment> }, documentedBy: { nodes: Array<DocumentsPropsFragment> } }
  & MetaProps_XtdClassification_Fragment
  & ObjectProps_XtdClassification_Fragment
);

type ObjectDetailProps_XtdMeasureWithUnit_Fragment = (
  { assignedCollections: { nodes: Array<AssignsCollectionsPropsFragment> }, assignedProperties: { nodes: Array<AssignsPropertiesPropsFragment> }, collectedBy: { nodes: Array<CollectsPropsFragment> }, documentedBy: { nodes: Array<DocumentsPropsFragment> } }
  & MetaProps_XtdMeasureWithUnit_Fragment
  & ObjectProps_XtdMeasureWithUnit_Fragment
);

type ObjectDetailProps_XtdProperty_Fragment = (
  { assignedCollections: { nodes: Array<AssignsCollectionsPropsFragment> }, assignedProperties: { nodes: Array<AssignsPropertiesPropsFragment> }, collectedBy: { nodes: Array<CollectsPropsFragment> }, documentedBy: { nodes: Array<DocumentsPropsFragment> } }
  & MetaProps_XtdProperty_Fragment
  & ObjectProps_XtdProperty_Fragment
);

type ObjectDetailProps_XtdSubject_Fragment = (
  { assignedCollections: { nodes: Array<AssignsCollectionsPropsFragment> }, assignedProperties: { nodes: Array<AssignsPropertiesPropsFragment> }, collectedBy: { nodes: Array<CollectsPropsFragment> }, documentedBy: { nodes: Array<DocumentsPropsFragment> } }
  & MetaProps_XtdSubject_Fragment
  & ObjectProps_XtdSubject_Fragment
);

type ObjectDetailProps_XtdUnit_Fragment = (
  { assignedCollections: { nodes: Array<AssignsCollectionsPropsFragment> }, assignedProperties: { nodes: Array<AssignsPropertiesPropsFragment> }, collectedBy: { nodes: Array<CollectsPropsFragment> }, documentedBy: { nodes: Array<DocumentsPropsFragment> } }
  & MetaProps_XtdUnit_Fragment
  & ObjectProps_XtdUnit_Fragment
);

type ObjectDetailProps_XtdValue_Fragment = (
  { assignedCollections: { nodes: Array<AssignsCollectionsPropsFragment> }, assignedProperties: { nodes: Array<AssignsPropertiesPropsFragment> }, collectedBy: { nodes: Array<CollectsPropsFragment> }, documentedBy: { nodes: Array<DocumentsPropsFragment> } }
  & MetaProps_XtdValue_Fragment
  & ObjectProps_XtdValue_Fragment
);

export type ObjectDetailPropsFragment = ObjectDetailProps_XtdActivity_Fragment | ObjectDetailProps_XtdActor_Fragment | ObjectDetailProps_XtdClassification_Fragment | ObjectDetailProps_XtdMeasureWithUnit_Fragment | ObjectDetailProps_XtdProperty_Fragment | ObjectDetailProps_XtdSubject_Fragment | ObjectDetailProps_XtdUnit_Fragment | ObjectDetailProps_XtdValue_Fragment;

export type PropertyDetailPropsFragment = (
  { assignedTo: { nodes: Array<AssignsPropertiesPropsFragment> } }
  & ObjectDetailProps_XtdProperty_Fragment
);

export type ValueDetailPropsFragment = (
  ObjectDetailProps_XtdValue_Fragment
  & ValuePropsFragment
);

type CollectionDetailProps_XtdBag_Fragment = (
  { collects: { nodes: Array<CollectsPropsFragment> }, assignedTo: { nodes: Array<AssignsCollectionsPropsFragment> }, collectedBy: { nodes: Array<CollectsPropsFragment> }, documentedBy: { nodes: Array<DocumentsPropsFragment> } }
  & MetaProps_XtdBag_Fragment
  & CollectionProps_XtdBag_Fragment
);

type CollectionDetailProps_XtdNest_Fragment = (
  { collects: { nodes: Array<CollectsPropsFragment> }, assignedTo: { nodes: Array<AssignsCollectionsPropsFragment> }, collectedBy: { nodes: Array<CollectsPropsFragment> }, documentedBy: { nodes: Array<DocumentsPropsFragment> } }
  & MetaProps_XtdNest_Fragment
  & CollectionProps_XtdNest_Fragment
);

export type CollectionDetailPropsFragment = CollectionDetailProps_XtdBag_Fragment | CollectionDetailProps_XtdNest_Fragment;

export type SignupFormMutationVariables = Exact<{
  profile: SignupInput;
}>;


export type SignupFormMutation = { success?: Maybe<boolean> };

export type ConfirmEmailMutationVariables = Exact<{
  token: Scalars['String'];
}>;


export type ConfirmEmailMutation = { success?: Maybe<boolean> };

export type LoginFormMutationVariables = Exact<{
  credentials: LoginInput;
}>;


export type LoginFormMutation = { token?: Maybe<string> };

export type UpdateProfileMutationVariables = Exact<{
  input: ProfileUpdateInput;
}>;


export type UpdateProfileMutation = { updateProfile: UserProfileFragment };

export type CreateEntryMutationVariables = Exact<{
  input: CreateCatalogEntryInput;
}>;


export type CreateEntryMutation = { createCatalogEntry?: Maybe<{ catalogEntry?: Maybe<ConceptProps_XtdActor_Fragment | ConceptProps_XtdActivity_Fragment | ConceptProps_XtdBag_Fragment | ConceptProps_XtdClassification_Fragment | ConceptProps_XtdExternalDocument_Fragment | ConceptProps_XtdMeasureWithUnit_Fragment | ConceptProps_XtdNest_Fragment | ConceptProps_XtdSubject_Fragment | ConceptProps_XtdProperty_Fragment | ConceptProps_XtdUnit_Fragment | ConceptProps_XtdValue_Fragment> }> };

export type DeleteEntryMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteEntryMutation = { deleteCatalogEntry?: Maybe<{ catalogEntry?: Maybe<ConceptProps_XtdActor_Fragment | ConceptProps_XtdActivity_Fragment | ConceptProps_XtdBag_Fragment | ConceptProps_XtdClassification_Fragment | ConceptProps_XtdExternalDocument_Fragment | ConceptProps_XtdMeasureWithUnit_Fragment | ConceptProps_XtdNest_Fragment | ConceptProps_XtdSubject_Fragment | ConceptProps_XtdProperty_Fragment | ConceptProps_XtdUnit_Fragment | ConceptProps_XtdValue_Fragment> }> };

export type SetVersionMutationVariables = Exact<{
  input: SetVersionInput;
}>;


export type SetVersionMutation = { setVersion?: Maybe<{ catalogEntry?: Maybe<ConceptProps_XtdActor_Fragment | ConceptProps_XtdActivity_Fragment | ConceptProps_XtdBag_Fragment | ConceptProps_XtdClassification_Fragment | ConceptProps_XtdExternalDocument_Fragment | ConceptProps_XtdMeasureWithUnit_Fragment | ConceptProps_XtdNest_Fragment | ConceptProps_XtdSubject_Fragment | ConceptProps_XtdProperty_Fragment | ConceptProps_XtdUnit_Fragment | ConceptProps_XtdValue_Fragment> }> };

export type AddNameMutationVariables = Exact<{
  input: AddNameInput;
}>;


export type AddNameMutation = { addName?: Maybe<{ catalogEntry?: Maybe<ConceptProps_XtdActor_Fragment | ConceptProps_XtdActivity_Fragment | ConceptProps_XtdBag_Fragment | ConceptProps_XtdClassification_Fragment | ConceptProps_XtdExternalDocument_Fragment | ConceptProps_XtdMeasureWithUnit_Fragment | ConceptProps_XtdNest_Fragment | ConceptProps_XtdSubject_Fragment | ConceptProps_XtdProperty_Fragment | ConceptProps_XtdUnit_Fragment | ConceptProps_XtdValue_Fragment> }> };

export type UpdateNameMutationVariables = Exact<{
  input: UpdateNameInput;
}>;


export type UpdateNameMutation = { updateName?: Maybe<{ catalogEntry?: Maybe<ConceptProps_XtdActor_Fragment | ConceptProps_XtdActivity_Fragment | ConceptProps_XtdBag_Fragment | ConceptProps_XtdClassification_Fragment | ConceptProps_XtdExternalDocument_Fragment | ConceptProps_XtdMeasureWithUnit_Fragment | ConceptProps_XtdNest_Fragment | ConceptProps_XtdSubject_Fragment | ConceptProps_XtdProperty_Fragment | ConceptProps_XtdUnit_Fragment | ConceptProps_XtdValue_Fragment> }> };

export type DeleteNameMutationVariables = Exact<{
  input: DeleteNameInput;
}>;


export type DeleteNameMutation = { deleteName?: Maybe<{ catalogEntry?: Maybe<ConceptProps_XtdActor_Fragment | ConceptProps_XtdActivity_Fragment | ConceptProps_XtdBag_Fragment | ConceptProps_XtdClassification_Fragment | ConceptProps_XtdExternalDocument_Fragment | ConceptProps_XtdMeasureWithUnit_Fragment | ConceptProps_XtdNest_Fragment | ConceptProps_XtdSubject_Fragment | ConceptProps_XtdProperty_Fragment | ConceptProps_XtdUnit_Fragment | ConceptProps_XtdValue_Fragment> }> };

export type AddDescriptionMutationVariables = Exact<{
  input: AddDescriptionInput;
}>;


export type AddDescriptionMutation = { addDescription?: Maybe<{ catalogEntry?: Maybe<ConceptProps_XtdActor_Fragment | ConceptProps_XtdActivity_Fragment | ConceptProps_XtdBag_Fragment | ConceptProps_XtdClassification_Fragment | ConceptProps_XtdExternalDocument_Fragment | ConceptProps_XtdMeasureWithUnit_Fragment | ConceptProps_XtdNest_Fragment | ConceptProps_XtdSubject_Fragment | ConceptProps_XtdProperty_Fragment | ConceptProps_XtdUnit_Fragment | ConceptProps_XtdValue_Fragment> }> };

export type UpdateDescriptionMutationVariables = Exact<{
  input: UpdateDescriptionInput;
}>;


export type UpdateDescriptionMutation = { updateDescription?: Maybe<{ catalogEntry?: Maybe<ConceptProps_XtdActor_Fragment | ConceptProps_XtdActivity_Fragment | ConceptProps_XtdBag_Fragment | ConceptProps_XtdClassification_Fragment | ConceptProps_XtdExternalDocument_Fragment | ConceptProps_XtdMeasureWithUnit_Fragment | ConceptProps_XtdNest_Fragment | ConceptProps_XtdSubject_Fragment | ConceptProps_XtdProperty_Fragment | ConceptProps_XtdUnit_Fragment | ConceptProps_XtdValue_Fragment> }> };

export type DeleteDescriptionMutationVariables = Exact<{
  input: DeleteDescriptionInput;
}>;


export type DeleteDescriptionMutation = { deleteDescription?: Maybe<{ catalogEntry?: Maybe<ConceptProps_XtdActor_Fragment | ConceptProps_XtdActivity_Fragment | ConceptProps_XtdBag_Fragment | ConceptProps_XtdClassification_Fragment | ConceptProps_XtdExternalDocument_Fragment | ConceptProps_XtdMeasureWithUnit_Fragment | ConceptProps_XtdNest_Fragment | ConceptProps_XtdSubject_Fragment | ConceptProps_XtdProperty_Fragment | ConceptProps_XtdUnit_Fragment | ConceptProps_XtdValue_Fragment> }> };

export type SetToleranceMutationVariables = Exact<{
  input: SetToleranceInput;
}>;


export type SetToleranceMutation = { setTolerance?: Maybe<{ catalogEntry?: Maybe<ValueDetailPropsFragment> }> };

export type UnsetToleranceMutationVariables = Exact<{
  input: UnsetToleranceInput;
}>;


export type UnsetToleranceMutation = { unsetTolerance?: Maybe<{ catalogEntry?: Maybe<ValueDetailPropsFragment> }> };

export type SetNominalValueMutationVariables = Exact<{
  input: SetNominalValueInput;
}>;


export type SetNominalValueMutation = { setNominalValue?: Maybe<{ catalogEntry?: Maybe<ValueDetailPropsFragment> }> };

export type UnsetNominalValueMutationVariables = Exact<{
  input: UnsetNominalValueInput;
}>;


export type UnsetNominalValueMutation = { unsetNominalValue?: Maybe<{ catalogEntry?: Maybe<ValueDetailPropsFragment> }> };

export type CreateOneToManyRelationshipMutationVariables = Exact<{
  input: CreateOneToManyRelationshipInput;
}>;


export type CreateOneToManyRelationshipMutation = { createOneToManyRelationship?: Maybe<{ relationship?: Maybe<{ id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string }> }> };

export type UpdateOneToManyRelationshipMutationVariables = Exact<{
  oldId: Scalars['ID'];
  input: CreateOneToManyRelationshipInput;
}>;


export type UpdateOneToManyRelationshipMutation = { deleteRelationship?: Maybe<{ relationship?: Maybe<{ id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string }> }>, createOneToManyRelationship?: Maybe<{ relationship?: Maybe<{ id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string }> }> };

export type DeleteRelationshipMutationVariables = Exact<{
  input: DeleteRelationshipInput;
}>;


export type DeleteRelationshipMutation = { deleteRelationship?: Maybe<{ relationship?: Maybe<{ id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string } | { id: string }> }> };

export type TagBagMutationVariables = Exact<{
  bagId: Scalars['ID'];
  tagId: Scalars['ID'];
}>;


export type TagBagMutation = { addTag?: Maybe<{ catalogEntry?: Maybe<CollectionDetailProps_XtdBag_Fragment | CollectionDetailProps_XtdNest_Fragment> }> };

export type FindLanguagesQueryVariables = Exact<{
  input: LanguageFilterInput;
}>;


export type FindLanguagesQuery = { languages?: Maybe<{ totalElements: number, nodes: Array<LanguagePropsFragment> }> };

export type FindItemQueryVariables = Exact<{
  input: SearchInput;
}>;


export type FindItemQuery = { search: { totalElements: number, nodes: Array<ItemProps_XtdActivity_Fragment | ItemProps_XtdActor_Fragment | ItemProps_XtdBag_Fragment | ItemProps_XtdClassification_Fragment | ItemProps_XtdExternalDocument_Fragment | ItemProps_XtdMeasureWithUnit_Fragment | ItemProps_XtdNest_Fragment | ItemProps_XtdProperty_Fragment | ItemProps_XtdRelActsUpon_Fragment | ItemProps_XtdRelAssignsCollections_Fragment | ItemProps_XtdRelAssignsMeasures_Fragment | ItemProps_XtdRelAssignsProperties_Fragment | ItemProps_XtdRelAssignsPropertyWithValues_Fragment | ItemProps_XtdRelAssignsUnits_Fragment | ItemProps_XtdRelAssignsValues_Fragment | ItemProps_XtdRelAssociates_Fragment | ItemProps_XtdRelCollects_Fragment | ItemProps_XtdRelComposes_Fragment | ItemProps_XtdRelDocuments_Fragment | ItemProps_XtdRelGroups_Fragment | ItemProps_XtdRelSequences_Fragment | ItemProps_XtdRelSpecializes_Fragment | ItemProps_XtdSubject_Fragment | ItemProps_XtdUnit_Fragment | ItemProps_XtdValue_Fragment>, pageInfo: PagePropsFragment } };

export type FindConceptQueryVariables = Exact<{
  input: SearchInput;
}>;


export type FindConceptQuery = { search: { totalElements: number, nodes: Array<SearchResultProps_XtdActivity_Fragment | SearchResultProps_XtdActor_Fragment | SearchResultProps_XtdBag_Fragment | SearchResultProps_XtdClassification_Fragment | SearchResultProps_XtdExternalDocument_Fragment | SearchResultProps_XtdMeasureWithUnit_Fragment | SearchResultProps_XtdNest_Fragment | SearchResultProps_XtdProperty_Fragment | SearchResultProps_XtdRelActsUpon_Fragment | SearchResultProps_XtdRelAssignsCollections_Fragment | SearchResultProps_XtdRelAssignsMeasures_Fragment | SearchResultProps_XtdRelAssignsProperties_Fragment | SearchResultProps_XtdRelAssignsPropertyWithValues_Fragment | SearchResultProps_XtdRelAssignsUnits_Fragment | SearchResultProps_XtdRelAssignsValues_Fragment | SearchResultProps_XtdRelAssociates_Fragment | SearchResultProps_XtdRelCollects_Fragment | SearchResultProps_XtdRelComposes_Fragment | SearchResultProps_XtdRelDocuments_Fragment | SearchResultProps_XtdRelGroups_Fragment | SearchResultProps_XtdRelSequences_Fragment | SearchResultProps_XtdRelSpecializes_Fragment | SearchResultProps_XtdSubject_Fragment | SearchResultProps_XtdUnit_Fragment | SearchResultProps_XtdValue_Fragment>, pageInfo: PagePropsFragment } };

export type PropertyTreeQueryVariables = Exact<{ [key: string]: never; }>;


export type PropertyTreeQuery = { hierarchy: { paths: Array<Array<string>>, nodes: Array<ItemProps_XtdActivity_Fragment | ItemProps_XtdActor_Fragment | ItemProps_XtdBag_Fragment | ItemProps_XtdClassification_Fragment | ItemProps_XtdExternalDocument_Fragment | ItemProps_XtdMeasureWithUnit_Fragment | ItemProps_XtdNest_Fragment | ItemProps_XtdProperty_Fragment | ItemProps_XtdRelActsUpon_Fragment | ItemProps_XtdRelAssignsCollections_Fragment | ItemProps_XtdRelAssignsMeasures_Fragment | ItemProps_XtdRelAssignsProperties_Fragment | ItemProps_XtdRelAssignsPropertyWithValues_Fragment | ItemProps_XtdRelAssignsUnits_Fragment | ItemProps_XtdRelAssignsValues_Fragment | ItemProps_XtdRelAssociates_Fragment | ItemProps_XtdRelCollects_Fragment | ItemProps_XtdRelComposes_Fragment | ItemProps_XtdRelDocuments_Fragment | ItemProps_XtdRelGroups_Fragment | ItemProps_XtdRelSequences_Fragment | ItemProps_XtdRelSpecializes_Fragment | ItemProps_XtdSubject_Fragment | ItemProps_XtdUnit_Fragment | ItemProps_XtdValue_Fragment> } };

export type GetDocumentEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetDocumentEntryQuery = { node?: Maybe<ExternalDocumentDetailPropsFragment> };

export type GetObjectEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetObjectEntryQuery = { node?: Maybe<ObjectDetailProps_XtdActivity_Fragment | ObjectDetailProps_XtdActor_Fragment | ObjectDetailProps_XtdClassification_Fragment | ObjectDetailProps_XtdMeasureWithUnit_Fragment | ObjectDetailProps_XtdProperty_Fragment | ObjectDetailProps_XtdSubject_Fragment | ObjectDetailProps_XtdUnit_Fragment | ObjectDetailProps_XtdValue_Fragment> };

export type GetPropertyEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetPropertyEntryQuery = { node?: Maybe<PropertyDetailPropsFragment> };

export type GetValueEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetValueEntryQuery = { node?: Maybe<ValueDetailPropsFragment> };

export type GetCollectionEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetCollectionEntryQuery = { node?: Maybe<CollectionDetailProps_XtdBag_Fragment | CollectionDetailProps_XtdNest_Fragment> };

export type ProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfileQuery = { profile: UserProfileFragment };

export const UserProfileFragmentDoc = gql`
    fragment UserProfile on Profile {
  username
  firstName
  lastName
  email
  organization
}
    `;
export const PagePropsFragmentDoc = gql`
    fragment PageProps on PageInfo {
  totalPages
  pageNumber
  hasNext
  hasPrevious
}
    `;
export const TagPropsFragmentDoc = gql`
    fragment TagProps on Tag {
  id
  name
}
    `;
export const ItemPropsFragmentDoc = gql`
    fragment ItemProps on Concept {
  __typename
  id
  name(input: {languageTags: ["de-DE", "en-US"]})
  description(input: {languageTags: ["de-DE", "en-US"]})
  tags {
    ...TagProps
  }
}
    ${TagPropsFragmentDoc}`;
export const LanguagePropsFragmentDoc = gql`
    fragment LanguageProps on Language {
  id
  languageTag
  displayCountry(input: {languageTag: "de"})
  displayLanguage(input: {languageTag: "de"})
}
    `;
export const TranslationPropsFragmentDoc = gql`
    fragment TranslationProps on Translation {
  id
  language {
    ...LanguageProps
  }
  value
}
    ${LanguagePropsFragmentDoc}`;
export const ConceptPropsFragmentDoc = gql`
    fragment ConceptProps on Concept {
  ...ItemProps
  versionId
  versionDate
  de: name(input: {languageTags: ["de-DE"]})
  en: name(input: {languageTags: ["en-US, en-GB"]})
  names {
    ...TranslationProps
  }
  descriptions {
    ...TranslationProps
  }
}
    ${ItemPropsFragmentDoc}
${TranslationPropsFragmentDoc}`;
export const RelationshipPropsFragmentDoc = gql`
    fragment RelationshipProps on XtdRelationship {
  ...ConceptProps
}
    ${ConceptPropsFragmentDoc}`;
export const SearchResultPropsFragmentDoc = gql`
    fragment SearchResultProps on Concept {
  ...ItemProps
  versionId
  versionDate
  de: name(input: {languageTags: ["de-DE"]})
  en: name(input: {languageTags: ["en-US, en-GB"]})
}
    ${ItemPropsFragmentDoc}`;
export const AssignsPropertyWithValuesPropsFragmentDoc = gql`
    fragment AssignsPropertyWithValuesProps on XtdRelAssignsPropertyWithValues {
  ...RelationshipProps
  relatedProperty {
    ...SearchResultProps
  }
  relatedValues {
    ...SearchResultProps
  }
}
    ${RelationshipPropsFragmentDoc}
${SearchResultPropsFragmentDoc}`;
export const MetaPropsFragmentDoc = gql`
    fragment MetaProps on Entity {
  created
  createdBy
  lastModified
  lastModifiedBy
}
    `;
export const ExternalDocumentPropsFragmentDoc = gql`
    fragment ExternalDocumentProps on XtdExternalDocument {
  ...ConceptProps
}
    ${ConceptPropsFragmentDoc}`;
export const DocumentsPropsFragmentDoc = gql`
    fragment DocumentsProps on XtdRelDocuments {
  ...RelationshipProps
  relatingDocument {
    ...ExternalDocumentProps
  }
  relatedThings {
    ...SearchResultProps
  }
}
    ${RelationshipPropsFragmentDoc}
${ExternalDocumentPropsFragmentDoc}
${SearchResultPropsFragmentDoc}`;
export const ExternalDocumentDetailPropsFragmentDoc = gql`
    fragment ExternalDocumentDetailProps on XtdExternalDocument {
  ...MetaProps
  ...ExternalDocumentProps
  documents {
    nodes {
      ...DocumentsProps
    }
  }
}
    ${MetaPropsFragmentDoc}
${ExternalDocumentPropsFragmentDoc}
${DocumentsPropsFragmentDoc}`;
export const ObjectPropsFragmentDoc = gql`
    fragment ObjectProps on XtdObject {
  ...ConceptProps
}
    ${ConceptPropsFragmentDoc}`;
export const AssignsCollectionsPropsFragmentDoc = gql`
    fragment AssignsCollectionsProps on XtdRelAssignsCollections {
  ...RelationshipProps
  relatingObject {
    ...SearchResultProps
  }
  relatedCollections {
    ...SearchResultProps
  }
}
    ${RelationshipPropsFragmentDoc}
${SearchResultPropsFragmentDoc}`;
export const AssignsPropertiesPropsFragmentDoc = gql`
    fragment AssignsPropertiesProps on XtdRelAssignsProperties {
  ...RelationshipProps
  relatingObject {
    ...SearchResultProps
  }
  relatedProperties {
    ...SearchResultProps
  }
}
    ${RelationshipPropsFragmentDoc}
${SearchResultPropsFragmentDoc}`;
export const CollectsPropsFragmentDoc = gql`
    fragment CollectsProps on XtdRelCollects {
  ...RelationshipProps
  relatingCollection {
    ...SearchResultProps
    tags {
      ...TagProps
    }
  }
  relatedThings {
    ...SearchResultProps
  }
}
    ${RelationshipPropsFragmentDoc}
${SearchResultPropsFragmentDoc}
${TagPropsFragmentDoc}`;
export const ObjectDetailPropsFragmentDoc = gql`
    fragment ObjectDetailProps on XtdObject {
  ...MetaProps
  ...ObjectProps
  assignedCollections {
    nodes {
      ...AssignsCollectionsProps
    }
  }
  assignedProperties {
    nodes {
      ...AssignsPropertiesProps
    }
  }
  collectedBy {
    nodes {
      ...CollectsProps
    }
  }
  documentedBy {
    nodes {
      ...DocumentsProps
    }
  }
}
    ${MetaPropsFragmentDoc}
${ObjectPropsFragmentDoc}
${AssignsCollectionsPropsFragmentDoc}
${AssignsPropertiesPropsFragmentDoc}
${CollectsPropsFragmentDoc}
${DocumentsPropsFragmentDoc}`;
export const PropertyDetailPropsFragmentDoc = gql`
    fragment PropertyDetailProps on XtdProperty {
  ...ObjectDetailProps
  assignedTo {
    nodes {
      ...AssignsPropertiesProps
    }
  }
}
    ${ObjectDetailPropsFragmentDoc}
${AssignsPropertiesPropsFragmentDoc}`;
export const ValuePropsFragmentDoc = gql`
    fragment ValueProps on XtdValue {
  ...ObjectProps
  valueType
  valueRole
  nominalValue
  toleranceType
  lowerTolerance
  upperTolerance
}
    ${ObjectPropsFragmentDoc}`;
export const ValueDetailPropsFragmentDoc = gql`
    fragment ValueDetailProps on XtdValue {
  ...ObjectDetailProps
  ...ValueProps
}
    ${ObjectDetailPropsFragmentDoc}
${ValuePropsFragmentDoc}`;
export const CollectionPropsFragmentDoc = gql`
    fragment CollectionProps on XtdCollection {
  ...ConceptProps
}
    ${ConceptPropsFragmentDoc}`;
export const CollectionDetailPropsFragmentDoc = gql`
    fragment CollectionDetailProps on XtdCollection {
  ...MetaProps
  ...CollectionProps
  collects {
    nodes {
      ...CollectsProps
    }
  }
  assignedTo {
    nodes {
      ...AssignsCollectionsProps
    }
  }
  collectedBy {
    nodes {
      ...CollectsProps
    }
  }
  documentedBy {
    nodes {
      ...DocumentsProps
    }
  }
}
    ${MetaPropsFragmentDoc}
${CollectionPropsFragmentDoc}
${CollectsPropsFragmentDoc}
${AssignsCollectionsPropsFragmentDoc}
${DocumentsPropsFragmentDoc}`;
export const SignupFormDocument = gql`
    mutation SignupForm($profile: SignupInput!) {
  success: signup(input: $profile)
}
    `;
export type SignupFormMutationFn = Apollo.MutationFunction<SignupFormMutation, SignupFormMutationVariables>;

/**
 * __useSignupFormMutation__
 *
 * To run a mutation, you first call `useSignupFormMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignupFormMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signupFormMutation, { data, loading, error }] = useSignupFormMutation({
 *   variables: {
 *      profile: // value for 'profile'
 *   },
 * });
 */
export function useSignupFormMutation(baseOptions?: Apollo.MutationHookOptions<SignupFormMutation, SignupFormMutationVariables>) {
        return Apollo.useMutation<SignupFormMutation, SignupFormMutationVariables>(SignupFormDocument, baseOptions);
      }
export type SignupFormMutationHookResult = ReturnType<typeof useSignupFormMutation>;
export type SignupFormMutationResult = Apollo.MutationResult<SignupFormMutation>;
export type SignupFormMutationOptions = Apollo.BaseMutationOptions<SignupFormMutation, SignupFormMutationVariables>;
export const ConfirmEmailDocument = gql`
    mutation ConfirmEmail($token: String!) {
  success: confirm(token: $token)
}
    `;
export type ConfirmEmailMutationFn = Apollo.MutationFunction<ConfirmEmailMutation, ConfirmEmailMutationVariables>;

/**
 * __useConfirmEmailMutation__
 *
 * To run a mutation, you first call `useConfirmEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConfirmEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [confirmEmailMutation, { data, loading, error }] = useConfirmEmailMutation({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useConfirmEmailMutation(baseOptions?: Apollo.MutationHookOptions<ConfirmEmailMutation, ConfirmEmailMutationVariables>) {
        return Apollo.useMutation<ConfirmEmailMutation, ConfirmEmailMutationVariables>(ConfirmEmailDocument, baseOptions);
      }
export type ConfirmEmailMutationHookResult = ReturnType<typeof useConfirmEmailMutation>;
export type ConfirmEmailMutationResult = Apollo.MutationResult<ConfirmEmailMutation>;
export type ConfirmEmailMutationOptions = Apollo.BaseMutationOptions<ConfirmEmailMutation, ConfirmEmailMutationVariables>;
export const LoginFormDocument = gql`
    mutation LoginForm($credentials: LoginInput!) {
  token: login(input: $credentials)
}
    `;
export type LoginFormMutationFn = Apollo.MutationFunction<LoginFormMutation, LoginFormMutationVariables>;

/**
 * __useLoginFormMutation__
 *
 * To run a mutation, you first call `useLoginFormMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginFormMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginFormMutation, { data, loading, error }] = useLoginFormMutation({
 *   variables: {
 *      credentials: // value for 'credentials'
 *   },
 * });
 */
export function useLoginFormMutation(baseOptions?: Apollo.MutationHookOptions<LoginFormMutation, LoginFormMutationVariables>) {
        return Apollo.useMutation<LoginFormMutation, LoginFormMutationVariables>(LoginFormDocument, baseOptions);
      }
export type LoginFormMutationHookResult = ReturnType<typeof useLoginFormMutation>;
export type LoginFormMutationResult = Apollo.MutationResult<LoginFormMutation>;
export type LoginFormMutationOptions = Apollo.BaseMutationOptions<LoginFormMutation, LoginFormMutationVariables>;
export const UpdateProfileDocument = gql`
    mutation UpdateProfile($input: ProfileUpdateInput!) {
  updateProfile(input: $input) {
    ...UserProfile
  }
}
    ${UserProfileFragmentDoc}`;
export type UpdateProfileMutationFn = Apollo.MutationFunction<UpdateProfileMutation, UpdateProfileMutationVariables>;

/**
 * __useUpdateProfileMutation__
 *
 * To run a mutation, you first call `useUpdateProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProfileMutation, { data, loading, error }] = useUpdateProfileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateProfileMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProfileMutation, UpdateProfileMutationVariables>) {
        return Apollo.useMutation<UpdateProfileMutation, UpdateProfileMutationVariables>(UpdateProfileDocument, baseOptions);
      }
export type UpdateProfileMutationHookResult = ReturnType<typeof useUpdateProfileMutation>;
export type UpdateProfileMutationResult = Apollo.MutationResult<UpdateProfileMutation>;
export type UpdateProfileMutationOptions = Apollo.BaseMutationOptions<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const CreateEntryDocument = gql`
    mutation CreateEntry($input: CreateCatalogEntryInput!) {
  createCatalogEntry(input: $input) {
    catalogEntry {
      ...ConceptProps
    }
  }
}
    ${ConceptPropsFragmentDoc}`;
export type CreateEntryMutationFn = Apollo.MutationFunction<CreateEntryMutation, CreateEntryMutationVariables>;

/**
 * __useCreateEntryMutation__
 *
 * To run a mutation, you first call `useCreateEntryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateEntryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createEntryMutation, { data, loading, error }] = useCreateEntryMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateEntryMutation(baseOptions?: Apollo.MutationHookOptions<CreateEntryMutation, CreateEntryMutationVariables>) {
        return Apollo.useMutation<CreateEntryMutation, CreateEntryMutationVariables>(CreateEntryDocument, baseOptions);
      }
export type CreateEntryMutationHookResult = ReturnType<typeof useCreateEntryMutation>;
export type CreateEntryMutationResult = Apollo.MutationResult<CreateEntryMutation>;
export type CreateEntryMutationOptions = Apollo.BaseMutationOptions<CreateEntryMutation, CreateEntryMutationVariables>;
export const DeleteEntryDocument = gql`
    mutation DeleteEntry($id: ID!) {
  deleteCatalogEntry(input: {catalogEntryId: $id}) {
    catalogEntry {
      ...ConceptProps
    }
  }
}
    ${ConceptPropsFragmentDoc}`;
export type DeleteEntryMutationFn = Apollo.MutationFunction<DeleteEntryMutation, DeleteEntryMutationVariables>;

/**
 * __useDeleteEntryMutation__
 *
 * To run a mutation, you first call `useDeleteEntryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteEntryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteEntryMutation, { data, loading, error }] = useDeleteEntryMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteEntryMutation(baseOptions?: Apollo.MutationHookOptions<DeleteEntryMutation, DeleteEntryMutationVariables>) {
        return Apollo.useMutation<DeleteEntryMutation, DeleteEntryMutationVariables>(DeleteEntryDocument, baseOptions);
      }
export type DeleteEntryMutationHookResult = ReturnType<typeof useDeleteEntryMutation>;
export type DeleteEntryMutationResult = Apollo.MutationResult<DeleteEntryMutation>;
export type DeleteEntryMutationOptions = Apollo.BaseMutationOptions<DeleteEntryMutation, DeleteEntryMutationVariables>;
export const SetVersionDocument = gql`
    mutation SetVersion($input: SetVersionInput!) {
  setVersion(input: $input) {
    catalogEntry {
      ...ConceptProps
    }
  }
}
    ${ConceptPropsFragmentDoc}`;
export type SetVersionMutationFn = Apollo.MutationFunction<SetVersionMutation, SetVersionMutationVariables>;

/**
 * __useSetVersionMutation__
 *
 * To run a mutation, you first call `useSetVersionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetVersionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setVersionMutation, { data, loading, error }] = useSetVersionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSetVersionMutation(baseOptions?: Apollo.MutationHookOptions<SetVersionMutation, SetVersionMutationVariables>) {
        return Apollo.useMutation<SetVersionMutation, SetVersionMutationVariables>(SetVersionDocument, baseOptions);
      }
export type SetVersionMutationHookResult = ReturnType<typeof useSetVersionMutation>;
export type SetVersionMutationResult = Apollo.MutationResult<SetVersionMutation>;
export type SetVersionMutationOptions = Apollo.BaseMutationOptions<SetVersionMutation, SetVersionMutationVariables>;
export const AddNameDocument = gql`
    mutation AddName($input: AddNameInput!) {
  addName(input: $input) {
    catalogEntry {
      ...ConceptProps
    }
  }
}
    ${ConceptPropsFragmentDoc}`;
export type AddNameMutationFn = Apollo.MutationFunction<AddNameMutation, AddNameMutationVariables>;

/**
 * __useAddNameMutation__
 *
 * To run a mutation, you first call `useAddNameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddNameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addNameMutation, { data, loading, error }] = useAddNameMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddNameMutation(baseOptions?: Apollo.MutationHookOptions<AddNameMutation, AddNameMutationVariables>) {
        return Apollo.useMutation<AddNameMutation, AddNameMutationVariables>(AddNameDocument, baseOptions);
      }
export type AddNameMutationHookResult = ReturnType<typeof useAddNameMutation>;
export type AddNameMutationResult = Apollo.MutationResult<AddNameMutation>;
export type AddNameMutationOptions = Apollo.BaseMutationOptions<AddNameMutation, AddNameMutationVariables>;
export const UpdateNameDocument = gql`
    mutation UpdateName($input: UpdateNameInput!) {
  updateName(input: $input) {
    catalogEntry {
      ...ConceptProps
    }
  }
}
    ${ConceptPropsFragmentDoc}`;
export type UpdateNameMutationFn = Apollo.MutationFunction<UpdateNameMutation, UpdateNameMutationVariables>;

/**
 * __useUpdateNameMutation__
 *
 * To run a mutation, you first call `useUpdateNameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNameMutation, { data, loading, error }] = useUpdateNameMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateNameMutation(baseOptions?: Apollo.MutationHookOptions<UpdateNameMutation, UpdateNameMutationVariables>) {
        return Apollo.useMutation<UpdateNameMutation, UpdateNameMutationVariables>(UpdateNameDocument, baseOptions);
      }
export type UpdateNameMutationHookResult = ReturnType<typeof useUpdateNameMutation>;
export type UpdateNameMutationResult = Apollo.MutationResult<UpdateNameMutation>;
export type UpdateNameMutationOptions = Apollo.BaseMutationOptions<UpdateNameMutation, UpdateNameMutationVariables>;
export const DeleteNameDocument = gql`
    mutation DeleteName($input: DeleteNameInput!) {
  deleteName(input: $input) {
    catalogEntry {
      ...ConceptProps
    }
  }
}
    ${ConceptPropsFragmentDoc}`;
export type DeleteNameMutationFn = Apollo.MutationFunction<DeleteNameMutation, DeleteNameMutationVariables>;

/**
 * __useDeleteNameMutation__
 *
 * To run a mutation, you first call `useDeleteNameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteNameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteNameMutation, { data, loading, error }] = useDeleteNameMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteNameMutation(baseOptions?: Apollo.MutationHookOptions<DeleteNameMutation, DeleteNameMutationVariables>) {
        return Apollo.useMutation<DeleteNameMutation, DeleteNameMutationVariables>(DeleteNameDocument, baseOptions);
      }
export type DeleteNameMutationHookResult = ReturnType<typeof useDeleteNameMutation>;
export type DeleteNameMutationResult = Apollo.MutationResult<DeleteNameMutation>;
export type DeleteNameMutationOptions = Apollo.BaseMutationOptions<DeleteNameMutation, DeleteNameMutationVariables>;
export const AddDescriptionDocument = gql`
    mutation AddDescription($input: AddDescriptionInput!) {
  addDescription(input: $input) {
    catalogEntry {
      ...ConceptProps
    }
  }
}
    ${ConceptPropsFragmentDoc}`;
export type AddDescriptionMutationFn = Apollo.MutationFunction<AddDescriptionMutation, AddDescriptionMutationVariables>;

/**
 * __useAddDescriptionMutation__
 *
 * To run a mutation, you first call `useAddDescriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddDescriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addDescriptionMutation, { data, loading, error }] = useAddDescriptionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddDescriptionMutation(baseOptions?: Apollo.MutationHookOptions<AddDescriptionMutation, AddDescriptionMutationVariables>) {
        return Apollo.useMutation<AddDescriptionMutation, AddDescriptionMutationVariables>(AddDescriptionDocument, baseOptions);
      }
export type AddDescriptionMutationHookResult = ReturnType<typeof useAddDescriptionMutation>;
export type AddDescriptionMutationResult = Apollo.MutationResult<AddDescriptionMutation>;
export type AddDescriptionMutationOptions = Apollo.BaseMutationOptions<AddDescriptionMutation, AddDescriptionMutationVariables>;
export const UpdateDescriptionDocument = gql`
    mutation UpdateDescription($input: UpdateDescriptionInput!) {
  updateDescription(input: $input) {
    catalogEntry {
      ...ConceptProps
    }
  }
}
    ${ConceptPropsFragmentDoc}`;
export type UpdateDescriptionMutationFn = Apollo.MutationFunction<UpdateDescriptionMutation, UpdateDescriptionMutationVariables>;

/**
 * __useUpdateDescriptionMutation__
 *
 * To run a mutation, you first call `useUpdateDescriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDescriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDescriptionMutation, { data, loading, error }] = useUpdateDescriptionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateDescriptionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateDescriptionMutation, UpdateDescriptionMutationVariables>) {
        return Apollo.useMutation<UpdateDescriptionMutation, UpdateDescriptionMutationVariables>(UpdateDescriptionDocument, baseOptions);
      }
export type UpdateDescriptionMutationHookResult = ReturnType<typeof useUpdateDescriptionMutation>;
export type UpdateDescriptionMutationResult = Apollo.MutationResult<UpdateDescriptionMutation>;
export type UpdateDescriptionMutationOptions = Apollo.BaseMutationOptions<UpdateDescriptionMutation, UpdateDescriptionMutationVariables>;
export const DeleteDescriptionDocument = gql`
    mutation DeleteDescription($input: DeleteDescriptionInput!) {
  deleteDescription(input: $input) {
    catalogEntry {
      ...ConceptProps
    }
  }
}
    ${ConceptPropsFragmentDoc}`;
export type DeleteDescriptionMutationFn = Apollo.MutationFunction<DeleteDescriptionMutation, DeleteDescriptionMutationVariables>;

/**
 * __useDeleteDescriptionMutation__
 *
 * To run a mutation, you first call `useDeleteDescriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteDescriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteDescriptionMutation, { data, loading, error }] = useDeleteDescriptionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteDescriptionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteDescriptionMutation, DeleteDescriptionMutationVariables>) {
        return Apollo.useMutation<DeleteDescriptionMutation, DeleteDescriptionMutationVariables>(DeleteDescriptionDocument, baseOptions);
      }
export type DeleteDescriptionMutationHookResult = ReturnType<typeof useDeleteDescriptionMutation>;
export type DeleteDescriptionMutationResult = Apollo.MutationResult<DeleteDescriptionMutation>;
export type DeleteDescriptionMutationOptions = Apollo.BaseMutationOptions<DeleteDescriptionMutation, DeleteDescriptionMutationVariables>;
export const SetToleranceDocument = gql`
    mutation SetTolerance($input: SetToleranceInput!) {
  setTolerance(input: $input) {
    catalogEntry {
      ...ValueDetailProps
    }
  }
}
    ${ValueDetailPropsFragmentDoc}`;
export type SetToleranceMutationFn = Apollo.MutationFunction<SetToleranceMutation, SetToleranceMutationVariables>;

/**
 * __useSetToleranceMutation__
 *
 * To run a mutation, you first call `useSetToleranceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetToleranceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setToleranceMutation, { data, loading, error }] = useSetToleranceMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSetToleranceMutation(baseOptions?: Apollo.MutationHookOptions<SetToleranceMutation, SetToleranceMutationVariables>) {
        return Apollo.useMutation<SetToleranceMutation, SetToleranceMutationVariables>(SetToleranceDocument, baseOptions);
      }
export type SetToleranceMutationHookResult = ReturnType<typeof useSetToleranceMutation>;
export type SetToleranceMutationResult = Apollo.MutationResult<SetToleranceMutation>;
export type SetToleranceMutationOptions = Apollo.BaseMutationOptions<SetToleranceMutation, SetToleranceMutationVariables>;
export const UnsetToleranceDocument = gql`
    mutation UnsetTolerance($input: UnsetToleranceInput!) {
  unsetTolerance(input: $input) {
    catalogEntry {
      ...ValueDetailProps
    }
  }
}
    ${ValueDetailPropsFragmentDoc}`;
export type UnsetToleranceMutationFn = Apollo.MutationFunction<UnsetToleranceMutation, UnsetToleranceMutationVariables>;

/**
 * __useUnsetToleranceMutation__
 *
 * To run a mutation, you first call `useUnsetToleranceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnsetToleranceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unsetToleranceMutation, { data, loading, error }] = useUnsetToleranceMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUnsetToleranceMutation(baseOptions?: Apollo.MutationHookOptions<UnsetToleranceMutation, UnsetToleranceMutationVariables>) {
        return Apollo.useMutation<UnsetToleranceMutation, UnsetToleranceMutationVariables>(UnsetToleranceDocument, baseOptions);
      }
export type UnsetToleranceMutationHookResult = ReturnType<typeof useUnsetToleranceMutation>;
export type UnsetToleranceMutationResult = Apollo.MutationResult<UnsetToleranceMutation>;
export type UnsetToleranceMutationOptions = Apollo.BaseMutationOptions<UnsetToleranceMutation, UnsetToleranceMutationVariables>;
export const SetNominalValueDocument = gql`
    mutation SetNominalValue($input: SetNominalValueInput!) {
  setNominalValue(input: $input) {
    catalogEntry {
      ...ValueDetailProps
    }
  }
}
    ${ValueDetailPropsFragmentDoc}`;
export type SetNominalValueMutationFn = Apollo.MutationFunction<SetNominalValueMutation, SetNominalValueMutationVariables>;

/**
 * __useSetNominalValueMutation__
 *
 * To run a mutation, you first call `useSetNominalValueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetNominalValueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setNominalValueMutation, { data, loading, error }] = useSetNominalValueMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSetNominalValueMutation(baseOptions?: Apollo.MutationHookOptions<SetNominalValueMutation, SetNominalValueMutationVariables>) {
        return Apollo.useMutation<SetNominalValueMutation, SetNominalValueMutationVariables>(SetNominalValueDocument, baseOptions);
      }
export type SetNominalValueMutationHookResult = ReturnType<typeof useSetNominalValueMutation>;
export type SetNominalValueMutationResult = Apollo.MutationResult<SetNominalValueMutation>;
export type SetNominalValueMutationOptions = Apollo.BaseMutationOptions<SetNominalValueMutation, SetNominalValueMutationVariables>;
export const UnsetNominalValueDocument = gql`
    mutation UnsetNominalValue($input: UnsetNominalValueInput!) {
  unsetNominalValue(input: $input) {
    catalogEntry {
      ...ValueDetailProps
    }
  }
}
    ${ValueDetailPropsFragmentDoc}`;
export type UnsetNominalValueMutationFn = Apollo.MutationFunction<UnsetNominalValueMutation, UnsetNominalValueMutationVariables>;

/**
 * __useUnsetNominalValueMutation__
 *
 * To run a mutation, you first call `useUnsetNominalValueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnsetNominalValueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unsetNominalValueMutation, { data, loading, error }] = useUnsetNominalValueMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUnsetNominalValueMutation(baseOptions?: Apollo.MutationHookOptions<UnsetNominalValueMutation, UnsetNominalValueMutationVariables>) {
        return Apollo.useMutation<UnsetNominalValueMutation, UnsetNominalValueMutationVariables>(UnsetNominalValueDocument, baseOptions);
      }
export type UnsetNominalValueMutationHookResult = ReturnType<typeof useUnsetNominalValueMutation>;
export type UnsetNominalValueMutationResult = Apollo.MutationResult<UnsetNominalValueMutation>;
export type UnsetNominalValueMutationOptions = Apollo.BaseMutationOptions<UnsetNominalValueMutation, UnsetNominalValueMutationVariables>;
export const CreateOneToManyRelationshipDocument = gql`
    mutation CreateOneToManyRelationship($input: CreateOneToManyRelationshipInput!) {
  createOneToManyRelationship(input: $input) {
    relationship {
      ... on XtdRelationship {
        id
      }
    }
  }
}
    `;
export type CreateOneToManyRelationshipMutationFn = Apollo.MutationFunction<CreateOneToManyRelationshipMutation, CreateOneToManyRelationshipMutationVariables>;

/**
 * __useCreateOneToManyRelationshipMutation__
 *
 * To run a mutation, you first call `useCreateOneToManyRelationshipMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOneToManyRelationshipMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOneToManyRelationshipMutation, { data, loading, error }] = useCreateOneToManyRelationshipMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOneToManyRelationshipMutation(baseOptions?: Apollo.MutationHookOptions<CreateOneToManyRelationshipMutation, CreateOneToManyRelationshipMutationVariables>) {
        return Apollo.useMutation<CreateOneToManyRelationshipMutation, CreateOneToManyRelationshipMutationVariables>(CreateOneToManyRelationshipDocument, baseOptions);
      }
export type CreateOneToManyRelationshipMutationHookResult = ReturnType<typeof useCreateOneToManyRelationshipMutation>;
export type CreateOneToManyRelationshipMutationResult = Apollo.MutationResult<CreateOneToManyRelationshipMutation>;
export type CreateOneToManyRelationshipMutationOptions = Apollo.BaseMutationOptions<CreateOneToManyRelationshipMutation, CreateOneToManyRelationshipMutationVariables>;
export const UpdateOneToManyRelationshipDocument = gql`
    mutation UpdateOneToManyRelationship($oldId: ID!, $input: CreateOneToManyRelationshipInput!) {
  deleteRelationship(input: {id: $oldId}) {
    relationship {
      ... on XtdRelationship {
        id
      }
    }
  }
  createOneToManyRelationship(input: $input) {
    relationship {
      ... on XtdRelationship {
        id
      }
    }
  }
}
    `;
export type UpdateOneToManyRelationshipMutationFn = Apollo.MutationFunction<UpdateOneToManyRelationshipMutation, UpdateOneToManyRelationshipMutationVariables>;

/**
 * __useUpdateOneToManyRelationshipMutation__
 *
 * To run a mutation, you first call `useUpdateOneToManyRelationshipMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOneToManyRelationshipMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOneToManyRelationshipMutation, { data, loading, error }] = useUpdateOneToManyRelationshipMutation({
 *   variables: {
 *      oldId: // value for 'oldId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateOneToManyRelationshipMutation(baseOptions?: Apollo.MutationHookOptions<UpdateOneToManyRelationshipMutation, UpdateOneToManyRelationshipMutationVariables>) {
        return Apollo.useMutation<UpdateOneToManyRelationshipMutation, UpdateOneToManyRelationshipMutationVariables>(UpdateOneToManyRelationshipDocument, baseOptions);
      }
export type UpdateOneToManyRelationshipMutationHookResult = ReturnType<typeof useUpdateOneToManyRelationshipMutation>;
export type UpdateOneToManyRelationshipMutationResult = Apollo.MutationResult<UpdateOneToManyRelationshipMutation>;
export type UpdateOneToManyRelationshipMutationOptions = Apollo.BaseMutationOptions<UpdateOneToManyRelationshipMutation, UpdateOneToManyRelationshipMutationVariables>;
export const DeleteRelationshipDocument = gql`
    mutation DeleteRelationship($input: DeleteRelationshipInput!) {
  deleteRelationship(input: $input) {
    relationship {
      ... on XtdRelationship {
        id
      }
    }
  }
}
    `;
export type DeleteRelationshipMutationFn = Apollo.MutationFunction<DeleteRelationshipMutation, DeleteRelationshipMutationVariables>;

/**
 * __useDeleteRelationshipMutation__
 *
 * To run a mutation, you first call `useDeleteRelationshipMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteRelationshipMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteRelationshipMutation, { data, loading, error }] = useDeleteRelationshipMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteRelationshipMutation(baseOptions?: Apollo.MutationHookOptions<DeleteRelationshipMutation, DeleteRelationshipMutationVariables>) {
        return Apollo.useMutation<DeleteRelationshipMutation, DeleteRelationshipMutationVariables>(DeleteRelationshipDocument, baseOptions);
      }
export type DeleteRelationshipMutationHookResult = ReturnType<typeof useDeleteRelationshipMutation>;
export type DeleteRelationshipMutationResult = Apollo.MutationResult<DeleteRelationshipMutation>;
export type DeleteRelationshipMutationOptions = Apollo.BaseMutationOptions<DeleteRelationshipMutation, DeleteRelationshipMutationVariables>;
export const TagBagDocument = gql`
    mutation TagBag($bagId: ID!, $tagId: ID!) {
  addTag(input: {catalogEntryId: $bagId, tagId: $tagId}) {
    catalogEntry {
      ...CollectionDetailProps
    }
  }
}
    ${CollectionDetailPropsFragmentDoc}`;
export type TagBagMutationFn = Apollo.MutationFunction<TagBagMutation, TagBagMutationVariables>;

/**
 * __useTagBagMutation__
 *
 * To run a mutation, you first call `useTagBagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTagBagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [tagBagMutation, { data, loading, error }] = useTagBagMutation({
 *   variables: {
 *      bagId: // value for 'bagId'
 *      tagId: // value for 'tagId'
 *   },
 * });
 */
export function useTagBagMutation(baseOptions?: Apollo.MutationHookOptions<TagBagMutation, TagBagMutationVariables>) {
        return Apollo.useMutation<TagBagMutation, TagBagMutationVariables>(TagBagDocument, baseOptions);
      }
export type TagBagMutationHookResult = ReturnType<typeof useTagBagMutation>;
export type TagBagMutationResult = Apollo.MutationResult<TagBagMutation>;
export type TagBagMutationOptions = Apollo.BaseMutationOptions<TagBagMutation, TagBagMutationVariables>;
export const FindLanguagesDocument = gql`
    query FindLanguages($input: LanguageFilterInput!) {
  languages(input: $input) {
    nodes {
      ...LanguageProps
    }
    totalElements
  }
}
    ${LanguagePropsFragmentDoc}`;

/**
 * __useFindLanguagesQuery__
 *
 * To run a query within a React component, call `useFindLanguagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindLanguagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindLanguagesQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useFindLanguagesQuery(baseOptions: Apollo.QueryHookOptions<FindLanguagesQuery, FindLanguagesQueryVariables>) {
        return Apollo.useQuery<FindLanguagesQuery, FindLanguagesQueryVariables>(FindLanguagesDocument, baseOptions);
      }
export function useFindLanguagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindLanguagesQuery, FindLanguagesQueryVariables>) {
          return Apollo.useLazyQuery<FindLanguagesQuery, FindLanguagesQueryVariables>(FindLanguagesDocument, baseOptions);
        }
export type FindLanguagesQueryHookResult = ReturnType<typeof useFindLanguagesQuery>;
export type FindLanguagesLazyQueryHookResult = ReturnType<typeof useFindLanguagesLazyQuery>;
export type FindLanguagesQueryResult = Apollo.QueryResult<FindLanguagesQuery, FindLanguagesQueryVariables>;
export const FindItemDocument = gql`
    query FindItem($input: SearchInput!) {
  search(input: $input) {
    nodes {
      ...ItemProps
    }
    pageInfo {
      ...PageProps
    }
    totalElements
  }
}
    ${ItemPropsFragmentDoc}
${PagePropsFragmentDoc}`;

/**
 * __useFindItemQuery__
 *
 * To run a query within a React component, call `useFindItemQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindItemQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindItemQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useFindItemQuery(baseOptions: Apollo.QueryHookOptions<FindItemQuery, FindItemQueryVariables>) {
        return Apollo.useQuery<FindItemQuery, FindItemQueryVariables>(FindItemDocument, baseOptions);
      }
export function useFindItemLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindItemQuery, FindItemQueryVariables>) {
          return Apollo.useLazyQuery<FindItemQuery, FindItemQueryVariables>(FindItemDocument, baseOptions);
        }
export type FindItemQueryHookResult = ReturnType<typeof useFindItemQuery>;
export type FindItemLazyQueryHookResult = ReturnType<typeof useFindItemLazyQuery>;
export type FindItemQueryResult = Apollo.QueryResult<FindItemQuery, FindItemQueryVariables>;
export const FindConceptDocument = gql`
    query FindConcept($input: SearchInput!) {
  search(input: $input) {
    nodes {
      ...SearchResultProps
    }
    pageInfo {
      ...PageProps
    }
    totalElements
  }
}
    ${SearchResultPropsFragmentDoc}
${PagePropsFragmentDoc}`;

/**
 * __useFindConceptQuery__
 *
 * To run a query within a React component, call `useFindConceptQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindConceptQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindConceptQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useFindConceptQuery(baseOptions: Apollo.QueryHookOptions<FindConceptQuery, FindConceptQueryVariables>) {
        return Apollo.useQuery<FindConceptQuery, FindConceptQueryVariables>(FindConceptDocument, baseOptions);
      }
export function useFindConceptLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindConceptQuery, FindConceptQueryVariables>) {
          return Apollo.useLazyQuery<FindConceptQuery, FindConceptQueryVariables>(FindConceptDocument, baseOptions);
        }
export type FindConceptQueryHookResult = ReturnType<typeof useFindConceptQuery>;
export type FindConceptLazyQueryHookResult = ReturnType<typeof useFindConceptLazyQuery>;
export type FindConceptQueryResult = Apollo.QueryResult<FindConceptQuery, FindConceptQueryVariables>;
export const PropertyTreeDocument = gql`
    query PropertyTree {
  hierarchy(
    input: {rootNodeFilter: {catalogEntryTypeIn: [Bag], tagged: ["6f96aaa7-e08f-49bb-ac63-93061d4c5db2"]}}
  ) {
    nodes {
      ...ItemProps
    }
    paths
  }
}
    ${ItemPropsFragmentDoc}`;

/**
 * __usePropertyTreeQuery__
 *
 * To run a query within a React component, call `usePropertyTreeQuery` and pass it any options that fit your needs.
 * When your component renders, `usePropertyTreeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePropertyTreeQuery({
 *   variables: {
 *   },
 * });
 */
export function usePropertyTreeQuery(baseOptions?: Apollo.QueryHookOptions<PropertyTreeQuery, PropertyTreeQueryVariables>) {
        return Apollo.useQuery<PropertyTreeQuery, PropertyTreeQueryVariables>(PropertyTreeDocument, baseOptions);
      }
export function usePropertyTreeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PropertyTreeQuery, PropertyTreeQueryVariables>) {
          return Apollo.useLazyQuery<PropertyTreeQuery, PropertyTreeQueryVariables>(PropertyTreeDocument, baseOptions);
        }
export type PropertyTreeQueryHookResult = ReturnType<typeof usePropertyTreeQuery>;
export type PropertyTreeLazyQueryHookResult = ReturnType<typeof usePropertyTreeLazyQuery>;
export type PropertyTreeQueryResult = Apollo.QueryResult<PropertyTreeQuery, PropertyTreeQueryVariables>;
export const GetDocumentEntryDocument = gql`
    query GetDocumentEntry($id: ID!) {
  node(id: $id) {
    ...ExternalDocumentDetailProps
  }
}
    ${ExternalDocumentDetailPropsFragmentDoc}`;

/**
 * __useGetDocumentEntryQuery__
 *
 * To run a query within a React component, call `useGetDocumentEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDocumentEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDocumentEntryQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetDocumentEntryQuery(baseOptions: Apollo.QueryHookOptions<GetDocumentEntryQuery, GetDocumentEntryQueryVariables>) {
        return Apollo.useQuery<GetDocumentEntryQuery, GetDocumentEntryQueryVariables>(GetDocumentEntryDocument, baseOptions);
      }
export function useGetDocumentEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDocumentEntryQuery, GetDocumentEntryQueryVariables>) {
          return Apollo.useLazyQuery<GetDocumentEntryQuery, GetDocumentEntryQueryVariables>(GetDocumentEntryDocument, baseOptions);
        }
export type GetDocumentEntryQueryHookResult = ReturnType<typeof useGetDocumentEntryQuery>;
export type GetDocumentEntryLazyQueryHookResult = ReturnType<typeof useGetDocumentEntryLazyQuery>;
export type GetDocumentEntryQueryResult = Apollo.QueryResult<GetDocumentEntryQuery, GetDocumentEntryQueryVariables>;
export const GetObjectEntryDocument = gql`
    query GetObjectEntry($id: ID!) {
  node(id: $id) {
    ...ObjectDetailProps
  }
}
    ${ObjectDetailPropsFragmentDoc}`;

/**
 * __useGetObjectEntryQuery__
 *
 * To run a query within a React component, call `useGetObjectEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetObjectEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetObjectEntryQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetObjectEntryQuery(baseOptions: Apollo.QueryHookOptions<GetObjectEntryQuery, GetObjectEntryQueryVariables>) {
        return Apollo.useQuery<GetObjectEntryQuery, GetObjectEntryQueryVariables>(GetObjectEntryDocument, baseOptions);
      }
export function useGetObjectEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetObjectEntryQuery, GetObjectEntryQueryVariables>) {
          return Apollo.useLazyQuery<GetObjectEntryQuery, GetObjectEntryQueryVariables>(GetObjectEntryDocument, baseOptions);
        }
export type GetObjectEntryQueryHookResult = ReturnType<typeof useGetObjectEntryQuery>;
export type GetObjectEntryLazyQueryHookResult = ReturnType<typeof useGetObjectEntryLazyQuery>;
export type GetObjectEntryQueryResult = Apollo.QueryResult<GetObjectEntryQuery, GetObjectEntryQueryVariables>;
export const GetPropertyEntryDocument = gql`
    query GetPropertyEntry($id: ID!) {
  node(id: $id) {
    ...PropertyDetailProps
  }
}
    ${PropertyDetailPropsFragmentDoc}`;

/**
 * __useGetPropertyEntryQuery__
 *
 * To run a query within a React component, call `useGetPropertyEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPropertyEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPropertyEntryQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPropertyEntryQuery(baseOptions: Apollo.QueryHookOptions<GetPropertyEntryQuery, GetPropertyEntryQueryVariables>) {
        return Apollo.useQuery<GetPropertyEntryQuery, GetPropertyEntryQueryVariables>(GetPropertyEntryDocument, baseOptions);
      }
export function useGetPropertyEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPropertyEntryQuery, GetPropertyEntryQueryVariables>) {
          return Apollo.useLazyQuery<GetPropertyEntryQuery, GetPropertyEntryQueryVariables>(GetPropertyEntryDocument, baseOptions);
        }
export type GetPropertyEntryQueryHookResult = ReturnType<typeof useGetPropertyEntryQuery>;
export type GetPropertyEntryLazyQueryHookResult = ReturnType<typeof useGetPropertyEntryLazyQuery>;
export type GetPropertyEntryQueryResult = Apollo.QueryResult<GetPropertyEntryQuery, GetPropertyEntryQueryVariables>;
export const GetValueEntryDocument = gql`
    query GetValueEntry($id: ID!) {
  node(id: $id) {
    ...ValueDetailProps
  }
}
    ${ValueDetailPropsFragmentDoc}`;

/**
 * __useGetValueEntryQuery__
 *
 * To run a query within a React component, call `useGetValueEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetValueEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetValueEntryQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetValueEntryQuery(baseOptions: Apollo.QueryHookOptions<GetValueEntryQuery, GetValueEntryQueryVariables>) {
        return Apollo.useQuery<GetValueEntryQuery, GetValueEntryQueryVariables>(GetValueEntryDocument, baseOptions);
      }
export function useGetValueEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetValueEntryQuery, GetValueEntryQueryVariables>) {
          return Apollo.useLazyQuery<GetValueEntryQuery, GetValueEntryQueryVariables>(GetValueEntryDocument, baseOptions);
        }
export type GetValueEntryQueryHookResult = ReturnType<typeof useGetValueEntryQuery>;
export type GetValueEntryLazyQueryHookResult = ReturnType<typeof useGetValueEntryLazyQuery>;
export type GetValueEntryQueryResult = Apollo.QueryResult<GetValueEntryQuery, GetValueEntryQueryVariables>;
export const GetCollectionEntryDocument = gql`
    query GetCollectionEntry($id: ID!) {
  node(id: $id) {
    ...CollectionDetailProps
  }
}
    ${CollectionDetailPropsFragmentDoc}`;

/**
 * __useGetCollectionEntryQuery__
 *
 * To run a query within a React component, call `useGetCollectionEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCollectionEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCollectionEntryQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCollectionEntryQuery(baseOptions: Apollo.QueryHookOptions<GetCollectionEntryQuery, GetCollectionEntryQueryVariables>) {
        return Apollo.useQuery<GetCollectionEntryQuery, GetCollectionEntryQueryVariables>(GetCollectionEntryDocument, baseOptions);
      }
export function useGetCollectionEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCollectionEntryQuery, GetCollectionEntryQueryVariables>) {
          return Apollo.useLazyQuery<GetCollectionEntryQuery, GetCollectionEntryQueryVariables>(GetCollectionEntryDocument, baseOptions);
        }
export type GetCollectionEntryQueryHookResult = ReturnType<typeof useGetCollectionEntryQuery>;
export type GetCollectionEntryLazyQueryHookResult = ReturnType<typeof useGetCollectionEntryLazyQuery>;
export type GetCollectionEntryQueryResult = Apollo.QueryResult<GetCollectionEntryQuery, GetCollectionEntryQueryVariables>;
export const ProfileDocument = gql`
    query Profile {
  profile {
    ...UserProfile
  }
}
    ${UserProfileFragmentDoc}`;

/**
 * __useProfileQuery__
 *
 * To run a query within a React component, call `useProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useProfileQuery(baseOptions?: Apollo.QueryHookOptions<ProfileQuery, ProfileQueryVariables>) {
        return Apollo.useQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, baseOptions);
      }
export function useProfileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProfileQuery, ProfileQueryVariables>) {
          return Apollo.useLazyQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, baseOptions);
        }
export type ProfileQueryHookResult = ReturnType<typeof useProfileQuery>;
export type ProfileLazyQueryHookResult = ReturnType<typeof useProfileLazyQuery>;
export type ProfileQueryResult = Apollo.QueryResult<ProfileQuery, ProfileQueryVariables>;
