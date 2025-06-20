import * as Apollo from '@apollo/client';
import { gql } from '@apollo/client';
import { Tag } from '@mui/icons-material';

export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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

export type AddTextInput = {
  catalogEntryId: Scalars['ID'];
  text: TranslationInput;
};

export type TagInput = {
  catalogEntryId: Scalars['ID'];
  tagId: Scalars['ID'];
};

export type CatalogEntryFilterInput = {
  catalogEntryType?: Maybe<CatalogEntryTypeFilterInput>;
  tags?: Maybe<TagFilterInput>;
};

/**  inputs */
export type CatalogEntryTypeFilterInput = {
  in?: Maybe<Array<CatalogRecordType>>;
};


export enum CatalogRecordType {
  ExternalDocument = 'ExternalDocument',
  Property = 'Property',
  Subject = 'Subject',
  Unit = 'Unit',
  Value = 'Value',
  OrderedValue = 'OrderedValue',
  ValueList = 'ValueList',
  Language = 'Language',
  Dimension = 'Dimension',
  Rational = 'Rational',
  MultiLanguageText = 'MultiLanguageText',
  Text = 'Text',
  Symbol = 'Symbol',
  Interval = 'Interval',
  Dictionary = 'Dictionary',
  QuantityKind = 'QuantityKind',
  Country = 'Country',
  Subdivision = 'Subdivision',
  RelationshipToProperty = 'RelationshipToProperty',
  RelationshipToSubject = 'RelationshipToSubject'
}

export enum RelationshipRecordType {
  BoundaryValues = 'BoundaryValues',
  CountryOfOrigin = 'CountryOfOrigin',
  Dictionary = 'Dictionary',
  Dimension = 'Dimension',
  Maximum = 'Maximum',
  Minimum = 'Minimum',
  PossibleValues = 'PossibleValues',
  Properties = 'Properties',
  QuantityKinds = 'QuantityKinds',
  ReferenceDocuments = 'ReferenceDocuments',
  RelationshipToProperty = 'RelationshipToProperty',
  RelationshipToSubject = 'RelationshipToSubject',
  ReplacedObjects = 'ReplacedObjects',
  ScopeSubjects = 'ScopeSubjects',
  SimilarTo = 'SimilarTo',
  Subject = 'Subject',
  Subdivisions = 'Subdivisions',
  Symbols = 'Symbols',
  TargetProperties = 'TargetProperties',
  TargetSubjects = 'TargetSubjects',
  Units = 'Units',
  Unit = 'Unit',
  Values = 'Values',
  Value = 'Value'
}

export type CreateCatalogEntryInput = {
  catalogEntryType: CatalogRecordType;
  properties: PropertiesInput;
  tags?: Maybe<Array<Scalars['ID']>>;
};


export type CreateRelationshipInput = {
  relationshipType: RelationshipRecordType;
  properties?: Maybe<RelationshipPropertiesInput>;
  fromId: Scalars['ID'];
  toIds: Array<Scalars['ID']>;
};
export type RelationshipPropertiesInput = {
  id?: Maybe<Scalars['ID']>;
  majorVersion?: Maybe<Scalars['Int']>;
  minorVersion?: Maybe<Scalars['Int']>;
  status?: Maybe<StatusOfActivationEnum>;
  names?: Maybe<Array<TranslationInput>>;
  descriptions?: Maybe<Array<TranslationInput>>;
  comments?: Maybe<Array<TranslationInput>>;
  relationshipToSubjectProperties?: Maybe<RelationshipToSubjectPropertiesInput>;
  relationshipToPropertyProperties?: Maybe<RelationshipToPropertyPropertiesInput>;
  valueListProperties?: Maybe<ValueListInput>;
};

export type RelationshipToSubjectPropertiesInput = {
  relationshipType?: Maybe<RelationshipKindEnum>;
};

export type RelationshipToPropertyPropertiesInput = {
  relationshipType?: Maybe<PropertyRelationshipTypeEnum>;
};

export type CreateTagInput = {
  tagId?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
};


export type DeleteCatalogEntryInput = {
  catalogEntryId: Scalars['ID'];
};

export type AddTagInput = {
  catalogEntryId: Scalars['ID'];
  tagId: Scalars['ID'];
}

export type DeleteTextInput = {
  textId: Scalars['ID'];
};


export type DeleteRelationshipInput = {
  relationshipType: RelationshipRecordType;
  fromId: Scalars['ID'];
  toId: Scalars['ID'];
};


export type DeleteTagInput = {
  tagId: Scalars['ID'];
};


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
  catalogEntryTypeIn?: Maybe<Array<CatalogRecordType>>;
  catalogEntryTypeNotIn?: Maybe<Array<CatalogRecordType>>;
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

export type ProfileUpdateInput = {
  username: Scalars['ID'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  email: Scalars['String'];
  organization: Scalars['String'];
};

export type PropertiesInput = {
  id?: Maybe<Scalars['ID']>;
  majorVersion?: Maybe<Scalars['Int']>;
  minorVersion?: Maybe<Scalars['Int']>;
  dateOfCreation?: Maybe<Scalars['String']>;
  status?: Maybe<StatusOfActivationEnum>;
  names: Array<TranslationInput>;
  descriptions?: Maybe<Array<TranslationInput>>;
  comments?: Maybe<Array<TranslationInput>>;
  deprecationExplanation?: Maybe<Array<TranslationInput>>;
  definition?: Maybe<Array<TranslationInput>>;
  languageOfCreator?: Maybe<Scalars['ID']>;
  CountryOfOrigin?: Maybe<Scalars['ID']>;
  examples?: Maybe<Array<TranslationInput>>;
  propertyProperties?: Maybe<PropertyInput>;
  unitProperties?: Maybe<UnitInput>;
  valueProperties?: Maybe<ValueInput>;
  externalDocumentProperties?: Maybe<ExternalDocumentInput>;
  countryProperties?: Maybe<CountryInput>;
  subdivisionProperties?: Maybe<CountryInput>;
  orderedValueProperties?: Maybe<OrderedValueInput>;
  valueListProperties?: Maybe<ValueListInput>;
  intervalProperties?: Maybe<IntervalInput>;
  languageProperties?: Maybe<LanguageInput>;
  textProperties?: Maybe<TextInput>;
  rationalProperties?: Maybe<RationalInput>;
  symbolProperties?: Maybe<SymbolInput>;
  dimensionProperties?: Maybe<DimensionInput>;
};

export enum StatusOfActivationEnum {
  XTD_ACTIVE = 'XTD_ACTIVE',
  XTD_INACTIVE = 'XTD_INACTIVE'
}

export type PropertyInput = {
  dataType?: Maybe<DataTypeEnum>;
  dataFormat?: Maybe<Scalars['String']>;
}

export enum DataTypeEnum {
  XTD_STRING = 'XTD_STRING',
  XTD_INTEGER = 'XTD_INTEGER',
  XTD_REAL = 'XTD_REAL',
  XTD_BOOLEAN = 'XTD_BOOLEAN',
  XTD_RATIONAL = 'XTD_RATIONAL',
  XTD_DATETIME = 'XTD_DATETIME',
  XTD_COMPLEX = 'XTD_COMPLEX'
}

export type UnitInput = {
  scale?: Maybe<UnitScaleEnum>;
  base?: Maybe<UnitBaseEnum>;
  symbol?: Maybe<Array<TranslationInput>>;
  offset?: Maybe<RationalInput>;
  coefficient?: Maybe<RationalInput>;
}

export enum UnitScaleEnum {
  XTD_LINEAR = 'XTD_LINEAR',
  XTD_LOGARITHMIC = 'XTD_LOGARITHMIC'
}

export enum UnitBaseEnum {
  XTD_ONE = 'XTD_ONE',
  XTD_TWO = 'XTD_TWO',
  XTD_E = 'XTD_E',
  XTD_PI = 'XTD_PI',
  XTD_TEN = 'XTD_TEN'
}

export type RationalInput = {
  numerator?: Maybe<Scalars['Int']>;
  denominator?: Maybe<Scalars['Int']>;
}

export type ValueInput = {
  nominalValue?: Maybe<Scalars['String']>;
}

export type ExternalDocumentInput = {
  documentUri?: Maybe<Scalars['String']>;
  author?: Maybe<Scalars['String']>;
  isbn?: Maybe<Scalars['String']>;
  publisher?: Maybe<Scalars['String']>;
  dateOfPublication?: Maybe<Scalars['String']>;
  languageTag?: Maybe<Array<Scalars['ID']>>;
}

export type CountryInput = {
  code?: Maybe<Scalars['String']>;
}

export type OrderedValueInput = {
  order: Scalars['Int'];
}

export type ValueListInput = {
  languageTag?: Scalars['ID'];
}

export type IntervalInput = {
  minimumIncluded?: Maybe<Scalars['Boolean']>;
  maximumIncluded?: Maybe<Scalars['Boolean']>;
}

export type LanguageInput = {
  englishName?: Maybe<Scalars['String']>;
  nativeName?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['String']>;
  comments?: Maybe<Array<Scalars['String']>>;
}

export type TextInput = {
  text: Scalars['String'];
}

export type SymbolInput = {
  symbol: TranslationInput;
}

export type DimensionInput = {
  lengthExponent: RationalInput;
  massExponent: RationalInput;
  timeExponent: RationalInput;
  electricCurrentExponent: RationalInput;
  thermodynamicTemperatureExponent: RationalInput;
  amountOfSubstanceExponent: RationalInput;
  luminousIntensityExponent: RationalInput;
}

export type SearchInput = {
  query?: Maybe<Scalars['String']>;
  filters?: Maybe<Array<CatalogEntryFilterInput>>;
  entityTypeIn?: Maybe<Array<CatalogRecordType>>;
  entityTypeNotIn?: Maybe<Array<CatalogRecordType>>;
  idIn?: Maybe<Array<Scalars['ID']>>;
  idNotIn?: Maybe<Array<Scalars['ID']>>;
  tagged?: Maybe<Array<Scalars['ID']>>;
  pageNumber?: Maybe<Scalars['Int']>;
  pageSize?: Maybe<Scalars['Int']>;
};

export type UpdateMajorVersionInput = {
  catalogEntryId: Scalars['ID'];
  majorVersion: Scalars['Int'];
};

export type UpdateMinorVersionInput = {
  catalogEntryId: Scalars['ID'];
  minorVersion: Scalars['Int'];
};

export type UpdateStatusInput = {
  catalogEntryId: Scalars['ID'];
  status: StatusOfActivationEnum;
};

export type UpdateDataTypeInput = {
  catalogEntryId: Scalars['ID'];
  dataType: DataTypeEnum;
};

export type UpdateNominalValueInput = {
  catalogEntryId: Scalars['ID'];
  nominalValue: Scalars['String'];
};

export type AddCountryOfOriginInput = {
  catalogEntryId: Scalars['ID'];
  countryCode: Scalars['ID'];
};

export type DeleteCountryOfOriginInput = {
  catalogEntryId: Scalars['ID'];
};

export type SignupInput = {
  username: Scalars['ID'];
  password: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  email: Scalars['String'];
  organization: Scalars['String'];
};

export type Tag = {
  __typename?: 'Tag';
  id: Scalars['ID'];
  name: Scalars['String'];
  created: Scalars['String'];
  createdBy: Scalars['String'];
  lastModified: Scalars['String'];
  lastModifiedBy: Scalars['String'];
};

export type TagNode = {
  nodes: {
    id: string;
    name: string;
  }[]
};

export type TagFilterInput = {
  in?: Maybe<Array<Scalars['ID']>>;
};

export type TranslationInput = {
  id?: Maybe<Scalars['ID']>;
  languageTag: Scalars['ID'];
  value: Scalars['String'];
};
export type UpdateTextInput = {
  textId: Scalars['ID'];
  value: Scalars['String'];
};


export type UpdateTagInput = {
  tagId: Scalars['ID'];
  name: Scalars['String'];
};

export enum PropertyRelationshipTypeEnum {
  XTD_DEPENDS = 'XTD_DEPENDS',
  XTD_SPECIALIZES = 'XTD_SPECIALIZES'
}

export enum RelationshipKindEnum {
  XTD_INSTANCE_LEVEL = 'XTD_INSTANCE_LEVEL',
  XTD_SCHEMA_LEVEL = 'XTD_SCHEMA_LEVEL'
}

























































export type UserProfileFragment = { username: string, firstName: string, lastName: string, email: string, organization: string };

export type PagePropsFragment = { totalPages: number, pageNumber: number, hasNext: boolean, hasPrevious: boolean };

export type LanguagePropsFragment = { id: string, code: string, englishName: string, nativeName: string };

export type TextPropsFragment = { id: string, text: string, language: LanguagePropsFragment };

export type MultiLanguageTextPropsFragment = { id: string, texts: Array<TextPropsFragment> };

export type TagPropsFragment = { id: string, name: string };

export type DictionaryPropsFragment = { id: string, name: MultiLanguageTextPropsFragment, recordType: CatalogRecordType, tags: Array<TagPropsFragment>, concepts: Array<ObjectPropsFragment> };

export type IntervalPropsFragment = { id: string, minimumIncluded?: Maybe<boolean>, maximumIncluded?: Maybe<boolean>, minimum?: Maybe<ValueListDetailPropsFragment>, maximum?: Maybe<ValueListDetailPropsFragment> };

export type SymbolPropsFragment = { id: string, symbol: string, language: LanguagePropsFragment };

export type RationalPropsFragment = { id: string, numerator?: Maybe<number>, denominator?: Maybe<number> };

type ObjectProps<T extends string> = {
  __typename: T;
  id: string;
  recordType: CatalogRecordType;
  majorVersion?: Maybe<number>;
  minorVersion?: Maybe<number>;
  dateOfCreation?: Maybe<string>;
  status: StatusOfActivationEnum;
  name?: Maybe<string>;
  names: Array<MultiLanguageTextPropsFragment>;
  comment?: Maybe<string>;
  comments?: Maybe<Array<MultiLanguageTextPropsFragment>>;
  tags: Array<TagPropsFragment>;
  deprecationExplanation?: Maybe<Array<MultiLanguageTextPropsFragment>>;
  dictionary?: Maybe<DictionaryPropsFragment>;
  replacedObjects?: Maybe<Array<ObjectProps<string>>>;
  replacingObjects?: Maybe<Array<ObjectProps<string>>>;
};

type ObjectProps_XtdExternalDocument_Fragment = ObjectProps<'XtdExternalDocument'>;
type ObjectProps_XtdProperty_Fragment = ObjectProps<'XtdProperty'>;
type ObjectProps_XtdSubject_Fragment = ObjectProps<'XtdSubject'>;
type ObjectProps_XtdUnit_Fragment = ObjectProps<'XtdUnit'>;
type ObjectProps_XtdValue_Fragment = ObjectProps<'XtdValue'>;
type ObjectProps_XtdOrderedValue_Fragment = ObjectProps<'XtdOrderedValue'> & { order: number };
type ObjectProps_XtdValueList_Fragment = ObjectProps<'XtdValueList'>;
type ObjectProps_XtdDimension_Fragment = ObjectProps<'XtdDimension'>;
type ObjectProps_XtdCountry_Fragment = ObjectProps<'XtdCountry'>;
type ObjectProps_XtdSubdivision_Fragment = ObjectProps<'XtdSubdivision'>;
type ObjectProps_XtdRelationshipToSubject_Fragment = ObjectProps<'XtdRelationshipToSubject'>;
type ObjectProps_XtdRelationshipToProperty_Fragment = ObjectProps<'XtdRelationshipToProperty'>;
type ObjectProps_XtdQuantityKind_Fragment = ObjectProps<'XtdQuantityKind'>;

export type ObjectPropsFragment = ObjectProps_XtdExternalDocument_Fragment | ObjectProps_XtdProperty_Fragment | ObjectProps_XtdSubject_Fragment | ObjectProps_XtdUnit_Fragment | ObjectProps_XtdValue_Fragment | ObjectProps_XtdOrderedValue_Fragment | ObjectProps_XtdValueList_Fragment | ObjectProps_XtdDimension_Fragment | ObjectProps_XtdCountry_Fragment | ObjectProps_XtdSubdivision_Fragment | ObjectProps_XtdRelationshipToSubject_Fragment | ObjectProps_XtdRelationshipToProperty_Fragment | ObjectProps_XtdQuantityKind_Fragment;

export type ExportCatalogRecord_Fragment = { __typename: 'ExportResult', id: string, type?: Maybe<string>, tags?: Maybe<string>, name?: Maybe<string>, name_en?: Maybe<string>, description?: Maybe<string>, majorVersion?: Maybe<number>, minorVersion?: Maybe<number>, created?: Maybe<string>, createdBy?: Maybe<string>, lastModified?: Maybe<string>, lastModifiedBy?: Maybe<string>, status?: Maybe<StatusOfActivationEnum>, languageOfCreator?: Maybe<string>, countryOfOrigin?: Maybe<string>, deprecationExplanation?: Maybe<string>, languages?: Maybe<string>, examples?: Maybe<string>, dataType?: Maybe<DataTypeEnum>, dataFormat?: Maybe<string>, scale?: Maybe<UnitScaleEnum>, base?: Maybe<UnitBaseEnum>, uri?: Maybe<string>, author?: Maybe<string>, publisher?: Maybe<string>, isbn?: Maybe<string>, dateOfPublication?: Maybe<string> };

export type ExportCatalogRecordRelationship_Fragment = { __typename: 'ExportRelationshipResult', entity1: string, relationship: string, entity2: string };

export type SearchResultPropsFragment = { __typename: 'XtdRoot', id: string, recordType: CatalogRecordType, name?: Maybe<string>, comment?: Maybe<string>, tags: Array<TagPropsFragment> }; // description?: Maybe<string>, 
// export type SearchResultPropsFragment =
//   | ({ __typename: 'XtdObject', id: string, recordType: CatalogRecordType, name?: Maybe<string>, comment?: Maybe<string>, tags: Array<TagPropsFragment> })
//   | ({ __typename: 'XtdDictionary', id: string, recordType: CatalogRecordType, dname?: { texts: { text: string }[] }, tags: Array<TagPropsFragment> })
//   | ({ __typename: 'XtdRoot', id: string, recordType: CatalogRecordType, tags: Array<TagPropsFragment> });

export type FindTagsResultFragment = { id: string, name: string };

type ConceptProps_Base_Fragment = {
  description?: Maybe<string>;
  descriptions?: Maybe<Array<MultiLanguageTextPropsFragment>>;
  definition?: Maybe<MultiLanguageTextPropsFragment>;
  examples?: Maybe<Array<MultiLanguageTextPropsFragment>>;
  languageOfCreator?: Maybe<LanguagePropsFragment>;
  countryOfOrigin?: Maybe<CountryDetailPropsFragment>;
  referenceDocuments?: Maybe<Array<ExternalDocumentDetailPropsFragment>>;
  similarTo?: Maybe<Array<ConceptPropsFragment>>;
};

// Spezifische Typen erweitern die Basisstruktur
type ConceptProps_XtdExternalDocument_Fragment = ConceptProps_Base_Fragment & ObjectProps_XtdExternalDocument_Fragment;
type ConceptProps_XtdProperty_Fragment = ConceptProps_Base_Fragment & ObjectProps_XtdProperty_Fragment;
type ConceptProps_XtdSubject_Fragment = ConceptProps_Base_Fragment & ObjectProps_XtdSubject_Fragment;
type ConceptProps_XtdUnit_Fragment = ConceptProps_Base_Fragment & ObjectProps_XtdUnit_Fragment;
type ConceptProps_XtdValueList_Fragment = ConceptProps_Base_Fragment & ObjectProps_XtdValueList_Fragment;
type ConceptProps_XtdDimension_Fragment = ConceptProps_Base_Fragment & ObjectProps_XtdDimension_Fragment;
type ConceptProps_XtdCountry_Fragment = ConceptProps_Base_Fragment & ObjectProps_XtdCountry_Fragment;
type ConceptProps_XtdSubdivision_Fragment = ConceptProps_Base_Fragment & ObjectProps_XtdSubdivision_Fragment;
type ConceptProps_XtdRelationshipToProperty_Fragment = ConceptProps_Base_Fragment & ObjectProps_XtdRelationshipToProperty_Fragment;
type ConceptProps_XtdQuantityKind_Fragment = ConceptProps_Base_Fragment & ObjectProps_XtdQuantityKind_Fragment;

export type ConceptPropsFragment = ConceptProps_XtdExternalDocument_Fragment | ConceptProps_XtdProperty_Fragment | ConceptProps_XtdSubject_Fragment | ConceptProps_XtdUnit_Fragment | ConceptProps_XtdValueList_Fragment | ConceptProps_XtdDimension_Fragment | ConceptProps_XtdCountry_Fragment | ConceptProps_XtdSubdivision_Fragment | ConceptProps_XtdRelationshipToProperty_Fragment | ConceptProps_XtdQuantityKind_Fragment;

type MetaProps_Fragment = { created: string, createdBy: string, lastModified: string, lastModifiedBy: string };

type ObjectDetailProps_XtdExternalDocument_Fragment = MetaProps_Fragment & ConceptProps_XtdExternalDocument_Fragment;
type ObjectDetailProps_XtdProperty_Fragment = MetaProps_Fragment & ConceptProps_XtdProperty_Fragment;
type ObjectDetailProps_XtdSubject_Fragment = MetaProps_Fragment & ConceptProps_XtdSubject_Fragment;
type ObjectDetailProps_XtdUnit_Fragment = MetaProps_Fragment & ConceptProps_XtdUnit_Fragment;
type ObjectDetailProps_XtdValue_Fragment = MetaProps_Fragment & ObjectProps_XtdValue_Fragment;
type ObjectDetailProps_XtdOrderedValue_Fragment = MetaProps_Fragment & ObjectProps_XtdOrderedValue_Fragment;
type ObjectDetailProps_XtdValueList_Fragment = MetaProps_Fragment & ConceptProps_XtdValueList_Fragment;
type ObjectDetailProps_XtdDimension_Fragment = MetaProps_Fragment & ConceptProps_XtdDimension_Fragment;
type ObjectDetailProps_XtdCountry_Fragment = MetaProps_Fragment & ConceptProps_XtdCountry_Fragment;
type ObjectDetailProps_XtdSubdivision_Fragment = MetaProps_Fragment & ConceptProps_XtdSubdivision_Fragment;
type ObjectDetailProps_XtdRelationshipToProperty_Fragment = MetaProps_Fragment & ConceptProps_XtdRelationshipToProperty_Fragment;
type ObjectDetailProps_XtdRelationshipToSubject_Fragment = MetaProps_Fragment & ObjectProps_XtdRelationshipToSubject_Fragment;
type ObjectDetailProps_XtdQuantityKind_Fragment = MetaProps_Fragment & ConceptProps_XtdQuantityKind_Fragment;
type DictionaryDetailPropsFragment = MetaProps_Fragment & DictionaryPropsFragment;

export type ObjectDetailPropsFragment = ObjectDetailProps_XtdExternalDocument_Fragment | ObjectDetailProps_XtdProperty_Fragment | ObjectDetailProps_XtdSubject_Fragment | ObjectDetailProps_XtdUnit_Fragment | ObjectDetailProps_XtdValue_Fragment | ObjectDetailProps_XtdOrderedValue_Fragment | ObjectDetailProps_XtdValueList_Fragment | ObjectDetailProps_XtdDimension_Fragment | ObjectDetailProps_XtdCountry_Fragment | ObjectDetailProps_XtdSubdivision_Fragment | ObjectDetailProps_XtdRelationshipToProperty_Fragment | ObjectDetailProps_XtdRelationshipToSubject_Fragment | ObjectDetailProps_XtdQuantityKind_Fragment;

export type ExternalDocumentDetailPropsFragment = ObjectDetailProps_XtdExternalDocument_Fragment & {
  documentUri?: Maybe<string>,
  author?: Maybe<string>,
  isbn?: Maybe<string>,
  publisher?: Maybe<string>,
  dateOfPublication?: Maybe<string>,
  languages: Array<LanguagePropsFragment>,
  documents?: Maybe<Array<ConceptPropsFragment>>
};

export type SubjectDetailPropsFragment = ObjectDetailProps_XtdSubject_Fragment & {
  properties?: Maybe<Array<PropertyDetailPropsFragment>>,
  connectedSubjects?: Maybe<Array<RelationshipToSubjectDetailPropsFragment>>,
  connectingSubjects?: Maybe<Array<RelationshipToSubjectDetailPropsFragment>>
};

export type PropertyDetailPropsFragment = ObjectDetailProps_XtdProperty_Fragment & {
  dataType: DataTypeEnum,
  dataFormat?: Maybe<string>,
  symbols?: Maybe<Array<SymbolPropsFragment>>,
  boundaryValues?: Maybe<Array<IntervalPropsFragment>>,
  possibleValues?: Maybe<Array<ValueListDetailPropsFragment>>,
  dimension?: Maybe<DimensionDetailPropsFragment>,
  quantityKinds?: Maybe<Array<QuantityKindDetailPropsFragment>>,
  units?: Maybe<Array<UnitDetailPropsFragment>>,
  subjects?: Maybe<Array<SubjectDetailPropsFragment>>,
  connectedProperties?: Maybe<Array<RelationshipToPropertyDetailPropsFragment>>
};

export type ValueListDetailPropsFragment = ObjectDetailProps_XtdValueList_Fragment & {
  values: Array<OrderedValueDetailPropsFragment>,
  properties: Array<PropertyDetailPropsFragment>,
  unit?: Maybe<UnitDetailPropsFragment>,
  language?: Maybe<LanguagePropsFragment>
};

export type OrderedValueDetailPropsFragment = ObjectDetailProps_XtdOrderedValue_Fragment & {
  order: number,
  orderedValue: ValueDetailPropsFragment,
  valueLists?: Maybe<Array<ValueListDetailPropsFragment>>
};

export type UnitDetailPropsFragment = ObjectDetailProps_XtdUnit_Fragment & {
  scale?: Maybe<UnitScaleEnum>,
  base?: Maybe<UnitBaseEnum>,
  offset?: Maybe<RationalPropsFragment>,
  coefficient?: Maybe<RationalPropsFragment>,
  properties?: Array<PropertyDetailPropsFragment>,
  valueLists?: Maybe<Array<ValueListDetailPropsFragment>>,
  dimension?: Maybe<DimensionDetailPropsFragment>,
};

export type ValueDetailPropsFragment = ObjectDetailProps_XtdValue_Fragment & {
  nominalValue: string,
  orderedValues?: Maybe<Array<OrderedValueDetailPropsFragment>>
};

export type DimensionDetailPropsFragment = ObjectDetailProps_XtdDimension_Fragment & {
  lengthExponent: RationalPropsFragment,
  massExponent: RationalPropsFragment,
  timeExponent: RationalPropsFragment,
  electricCurrentExponent: RationalPropsFragment,
  thermodynamicTemperatureExponent: RationalPropsFragment,
  amountOfSubstanceExponent: RationalPropsFragment,
  luminousIntensityExponent: RationalPropsFragment
};

export type CountryDetailPropsFragment = ObjectDetailProps_XtdCountry_Fragment & {
  code: string,
  subdivisions: Array<SubdivisionDetailPropsFragment>
};

export type SubdivisionDetailPropsFragment = ObjectDetailProps_XtdSubdivision_Fragment & {
  code: string,
  subdivisions: Array<SubdivisionDetailPropsFragment>
};

export type RelationshipToPropertyDetailPropsFragment = {
  relationshipType: PropertyRelationshipTypeEnum,
  targetProperties: Array<PropertyDetailPropsFragment>
};

export type RelationshipToSubjectDetailPropsFragment = ObjectDetailProps_XtdRelationshipToSubject_Fragment & {
  relationshipType: RelationshipRecordType,
  targetSubjects: Array<SubjectDetailPropsFragment>,
  connectingSubject: SubjectDetailPropsFragment
};

export type QuantityKindDetailPropsFragment = ObjectDetailProps_XtdQuantityKind_Fragment & {
  units?: Maybe<Array<UnitDetailPropsFragment>>,
  dimension: DimensionDetailPropsFragment
};

// Muatation types

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


export type CreateEntryMutation = { createCatalogEntry?: Maybe<{ catalogEntry?: Maybe<ConceptProps_XtdExternalDocument_Fragment | ConceptProps_XtdSubject_Fragment | ConceptProps_XtdProperty_Fragment | ConceptProps_XtdUnit_Fragment | ObjectProps_XtdValue_Fragment | ObjectProps_XtdOrderedValue_Fragment | ConceptProps_XtdValueList_Fragment | LanguagePropsFragment | ConceptProps_XtdDimension_Fragment | RationalPropsFragment | MultiLanguageTextPropsFragment | TextPropsFragment | SymbolPropsFragment | IntervalPropsFragment | DictionaryPropsFragment | ConceptProps_XtdQuantityKind_Fragment | ConceptProps_XtdCountry_Fragment | ConceptProps_XtdSubdivision_Fragment> }> };

export type DeleteEntryMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteEntryMutation = { deleteCatalogEntry?: Maybe<{ catalogEntry?: Maybe<ConceptProps_XtdExternalDocument_Fragment | ConceptProps_XtdSubject_Fragment | ConceptProps_XtdProperty_Fragment | ConceptProps_XtdUnit_Fragment | ObjectProps_XtdValue_Fragment | ObjectProps_XtdOrderedValue_Fragment | ConceptProps_XtdValueList_Fragment | LanguagePropsFragment | ConceptProps_XtdDimension_Fragment | RationalPropsFragment | MultiLanguageTextPropsFragment | TextPropsFragment | SymbolPropsFragment | IntervalPropsFragment | DictionaryPropsFragment | ConceptProps_XtdQuantityKind_Fragment | ConceptProps_XtdCountry_Fragment | ConceptProps_XtdSubdivision_Fragment> }> };

export type UpdateMajorVersionMutationVariables = Exact<{
  input: UpdateMajorVersionInput;
}>;

export type UpdateMajorVersionMutation = { updateMajorVersion?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };

export type UpdateMinorVersionMutationVariables = Exact<{
  input: UpdateMinorVersionInput;
}>;

export type UpdateMinorVersionMutation = { updateMinorVersion?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };


export type UpdateStatusMutationVariables = Exact<{
  input: UpdateStatusInput;
}>;

export type UpdateStatusMutation = { updateStatus?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };


export type UpdateDataTypeMutationVariables = Exact<{
  input: UpdateDataTypeInput;
}>;

export type UpdateDataTypeMutation = { updateDataType?: Maybe<{ catalogEntry?: Maybe<PropertyDetailPropsFragment> }> };

export type AddNameMutationVariables = Exact<{
  input: AddTextInput;
}>;

export type UpdateNominalValueMutationVariables = Exact<{
  input: UpdateNominalValueInput;
}>;

export type UpdateNominalValueMutation = { updateNominalValue?: Maybe<{ catalogEntry?: Maybe<ValueDetailPropsFragment> }> };

export type AddNameMutation = { addName?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };

export type UpdateNameMutationVariables = Exact<{
  input: UpdateTextInput;
}>;

export type UpdateNameMutation = { updateName?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };

export type DeleteNameMutationVariables = Exact<{
  input: DeleteTextInput;
}>;

export type DeleteNameMutation = { deleteName?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };


export type AddCommentMutationVariables = Exact<{
  input: AddTextInput;
}>;

export type AddCommentMutation = { addComment?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };

export type UpdateCommentMutationVariables = Exact<{
  input: UpdateTextInput;
}>;

export type UpdateCommentMutation = { updateComment?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };

export type DeleteCommentMutationVariables = Exact<{
  input: DeleteTextInput;
}>;

export type DeleteCommentMutation = { deleteComment?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };


export type AddDescriptionMutationVariables = Exact<{
  input: AddTextInput;
}>;

export type AddDescriptionMutation = { addDescription?: Maybe<{ catalogEntry?: Maybe<ConceptPropsFragment> }> };

export type UpdateDescriptionMutationVariables = Exact<{
  input: UpdateTextInput;
}>;

export type UpdateDescriptionMutation = { updateDescription?: Maybe<{ catalogEntry?: Maybe<ConceptPropsFragment> }> };

export type DeleteDescriptionMutationVariables = Exact<{
  input: DeleteTextInput;
}>;

export type DeleteDescriptionMutation = { deleteDescription?: Maybe<{ catalogEntry?: Maybe<ConceptPropsFragment> }> };


export type AddDeprecationExplanationMutationVariables = Exact<{
  input: AddTextInput;
}>;

export type AddDeprecationExplanationMutation = { addDeprecationExplanation?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };

export type UpdateDeprecationExplanationMutationVariables = Exact<{
  input: UpdateTextInput;
}>;

export type UpdateDeprecationExplanationMutation = { updateDeprecationExplanation?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };

export type DeleteDeprecationExplanationMutationVariables = Exact<{
  input: DeleteTextInput;
}>;

export type DeleteDeprecationExplanationMutation = { deleteDeprecationExplanation?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };

export type TagMutationVariables = Exact<{
  bagId: Scalars['ID'];
  tagId: Scalars['ID'];
}>;


export type AddDefinitionMutationVariables = Exact<{
  input: AddTextInput;
}>;

export type AddDefinitionMutation = { addDefinition?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };

export type UpdateDefinitionMutationVariables = Exact<{
  input: UpdateTextInput;
}>;

export type UpdateDefinitionMutation = { updateDefinition?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };

export type DeleteDefinitionMutationVariables = Exact<{
  input: DeleteTextInput;
}>;

export type DeleteDefinitionMutation = { deleteDefinition?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };


export type AddExampleMutationVariables = Exact<{
  input: AddTextInput;
}>;

export type AddExampleMutation = { addExample?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };

export type UpdateExampleMutationVariables = Exact<{
  input: UpdateTextInput;
}>;

export type UpdateExampleMutation = { updateExample?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };

export type DeleteExampleMutationVariables = Exact<{
  input: DeleteTextInput;
}>;

export type DeleteExampleMutation = { deleteExample?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };


export type AddCountryOfOriginMutationVariables = Exact<{
  input: AddCountryOfOriginInput;
}>;

export type AddCountryOfOriginMutation = { addCountryOfOrigin?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };

export type DeleteCountryOfOriginMutationVariables = Exact<{
  input: DeleteCountryOfOriginInput;
}>;

export type DeleteCountryOfOriginMutation = { deleteCountryOfOrigin?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };

export type AddTagMutationVariables = Exact<{
  input: AddTagInput;
}>;

export type AddTagMutation = { addTag?: Maybe<{ catalogEntry: { __typename: string } }> };
// __typename ist erforderlich, da es explizit in der Mutation enthalten ist.

export type UpdateTagMutationVariables = Exact<{
  input: UpdateTagInput;
}>;

export type UpdateTagMutation = { updateTag?: Maybe<{ tag?: Maybe<Tag> }> };

export type DeleteTagMutationVariables = Exact<{
  input: DeleteTagInput;
}>;

export type DeleteTagMutation = { deleteTag?: Maybe<{ tag?: Maybe<Tag> }> };

export type RemoveTagMutationVariables = Exact<{
  input: DeleteTagInput;
}>;

export type RemoveTagMutation = { removeTag?: Maybe<{ catalogEntry?: Maybe<ObjectPropsFragment> }> };

export type CreateTagMutation = (
  { __typename?: 'Mutation' }
  & {
    createTag?: Maybe<(
      { __typename?: 'CreateTagPayload' }
      & {
        tag?: Maybe<(
          { __typename?: 'Tag' }
          & Pick<Tag, 'id'>
        )>
      }
    )>
  }
);

export type CreateTagMutationVariables = Exact<{
  input: CreateTagInput;
}>;



export type CreateRelationshipMutationVariables = Exact<{
  input: CreateRelationshipInput;
}>;


export type CreateRelationshipMutation = { createRelationship?: Maybe<ObjectPropsFragment> };

export type DeleteRelationshipMutationVariables = Exact<{
  input: DeleteRelationshipInput;
}>;

export type DeleteRelationshipMutation = { deleteRelationship?: Maybe<ObjectPropsFragment> };


// Query types 

export type FindLanguagesQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindLanguagesQuery = { findLanguages?: Maybe<{ totalElements: number, nodes: Array<LanguagePropsFragment> }> };

export type FindItemQueryVariables = Exact<{
  input: SearchInput;
  pageSize?: Maybe<Scalars['Int']>;
  pageNumber?: Maybe<Scalars['Int']>;
}>;

export type FindItemQuery = { search: { totalElements: number, nodes: Array<SearchResultPropsFragment>, pageInfo: PagePropsFragment } };

export type FindTagsQuery = { findTags: { totalElements: number, nodes: Array<FindTagsResultFragment> } };

export type FindTagsQueryVariables = Exact<{
  pageSize?: Maybe<Scalars['Int']>;
}>;

export type FindExternalDocumentsQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindExternalDocumentsQuery = { findExternalDocuments?: Maybe<{ totalElements: number, nodes: Array<ExternalDocumentDetailPropsFragment> }> };

export type FindPropertiesQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindPropertiesQuery = { findProperties?: Maybe<{ totalElements: number, nodes: Array<PropertyDetailPropsFragment> }> };

export type FindSubjectsQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindSubjectsQuery = { findSubjects?: Maybe<{ totalElements: number, nodes: Array<SubjectDetailPropsFragment> }> };

export type FindUnitsQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindUnitsQuery = { findUnits?: Maybe<{ totalElements: number, nodes: Array<UnitDetailPropsFragment> }> };

export type FindValuesQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindValuesQuery = { findValues?: Maybe<{ totalElements: number, nodes: Array<ValueDetailPropsFragment> }> };

export type FindOrderedValuesQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindOrderedValuesQuery = { findOrderedValues?: Maybe<{ totalElements: number, nodes: Array<OrderedValueDetailPropsFragment> }> };

export type FindValueListsQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindValueListsQuery = { findValueLists?: Maybe<{ totalElements: number, nodes: Array<ValueListDetailPropsFragment> }> };

export type FindDimensionsQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindDimensionsQuery = { findDimensions?: Maybe<{ totalElements: number, nodes: Array<DimensionDetailPropsFragment> }> };

export type FindCountriesQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindCountriesQuery = { findCountries?: Maybe<{ totalElements: number, nodes: Array<CountryDetailPropsFragment> }> };

export type FindSubdivisionsQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindSubdivisionsQuery = { findSubdivisions?: Maybe<{ totalElements: number, nodes: Array<SubdivisionDetailPropsFragment> }> };

export type FindRelationshipToSubjectQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindRelationshipToSubjectQuery = { findRelationshipsToSubject?: Maybe<{ totalElements: number, nodes: Array<RelationshipToSubjectDetailPropsFragment> }> };

export type FindRelationshipToPropertyQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindRelationshipToPropertyQuery = { findRelationshipsToProperty?: Maybe<{ totalElements: number, nodes: Array<RelationshipToPropertyDetailPropsFragment> }> };

export type FindQuantityKindsQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindQuantityKindsQuery = { findQuantityKinds?: Maybe<{ totalElements: number, nodes: Array<QuantityKindDetailPropsFragment> }> };

export type FindRationalsQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindRationalsQuery = { findRationals?: Maybe<{ totalElements: number, nodes: Array<RationalPropsFragment> }> };

export type FindSymbolsQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindSymbolsQuery = { findSymbols?: Maybe<{ totalElements: number, nodes: Array<SymbolPropsFragment> }> };

export type FindIntervalsQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindIntervalsQuery = { findIntervals?: Maybe<{ totalElements: number, nodes: Array<IntervalPropsFragment> }> };

export type FindDictionariesQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindDictionariesQuery = { findDictionaries?: Maybe<{ totalElements: number, nodes: Array<DictionaryDetailPropsFragment>, pageInfo: PagePropsFragment }> };

export type FindMultiLanguageTextsQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindMultiLanguageTextsQuery = { findMultiLanguageTexts?: Maybe<{ totalElements: number, nodes: Array<MultiLanguageTextPropsFragment> }> };

export type FindTextsQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindTextsQuery = { findTexts?: Maybe<{ totalElements: number, nodes: Array<TextPropsFragment> }> };

export type FindConceptsQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindConceptsQuery = { findConcepts?: Maybe<{ totalElements: number, nodes: Array<ConceptPropsFragment> }> };

export type FindObjectsQueryVariables = Exact<{
  input: FilterInput;
}>;

export type FindObjectsQuery = { findObjects?: Maybe<{ totalElements: number, nodes: Array<ObjectPropsFragment> }> };

export type PropertyTreeQueryVariables = Exact<{ [key: string]: never; }>;


export type PropertyTreeQuery = { hierarchy: { paths: Array<Array<string>>, nodes: Array<ObjectPropsFragment> } };


export type FindVerificationTreeQueryVariables = Exact<{ [key: string]: never; }>;

export type FindPropGroupWithoutPropTreeQuery = { findPropGroupWithoutProp: { paths: Array<Array<string>>, nodes: Array<ObjectPropsFragment> } };

export type FindPropWithoutSubjectOrPropGroupTreeQuery = { findPropWithoutSubjectOrPropGroup: { paths: Array<Array<string>>, nodes: Array<ObjectPropsFragment> } };

export type FindModelWithoutGroupTreeQuery = { findModelWithoutGroup: { paths: Array<Array<string>>, nodes: Array<ObjectPropsFragment> } };

export type FindGroupWithoutSubjectTreeQuery = { findGroupWithoutSubject: { paths: Array<Array<string>>, nodes: Array<ObjectPropsFragment> } };

export type FindSubjectWithoutPropTreeQuery = { findSubjectWithoutProp: { paths: Array<Array<string>>, nodes: Array<ObjectPropsFragment> } };

export type FindValueListWithoutPropTreeQuery = { FindValueListWithoutProp: { paths: Array<Array<string>>, nodes: Array<ObjectPropsFragment> } };

export type FindUnitWithoutValueListTreeQuery = { FindUnitWithoutValueList: { paths: Array<Array<string>>, nodes: Array<ObjectPropsFragment> } };

export type FindValueWithoutValueListTreeQuery = { FindValueWithoutValueList: { paths: Array<Array<string>>, nodes: Array<ObjectPropsFragment> } };

export type FindMissingTagsTreeQuery = { findMissingTags: { paths: Array<Array<string>>, nodes: Array<ObjectPropsFragment> } };

export type FindMissingEnglishNameTreeQuery = { findMissingEnglishName: { paths: Array<Array<string>>, nodes: Array<ObjectPropsFragment> } };

export type FindMultipleIDsTreeQuery = { findMultipleIDs: { paths: Array<Array<string>>, nodes: Array<ObjectPropsFragment> } };

export type FindMissingDescriptionTreeQuery = { findMissingDescription: { paths: Array<Array<string>>, nodes: Array<ObjectPropsFragment> } };

export type FindMissingEnglishDescriptionTreeQuery = { findMissingEnglishDescription: { paths: Array<Array<string>>, nodes: Array<ObjectPropsFragment> } };

export type FindMultipleNamesTreeQuery = { findMultipleNames: { paths: Array<Array<string>>, nodes: Array<ObjectPropsFragment> } };

export type FindMultipleNamesAcrossClassesTreeQuery = { findMultipleNamesAcrossClasses: { paths: Array<Array<string>>, nodes: Array<ObjectPropsFragment> } };

export type FindExportCatalogRecordsTreeQuery = { findExportCatalogRecords: { paths: Array<Array<string>>, nodes: Array<ExportCatalogRecord_Fragment> } };

export type FindExportCatalogRecordsRelationshipsTreeQuery = { findExportCatalogRecordsRelationships: { paths: Array<Array<string>>, nodes: Array<ExportCatalogRecordRelationship_Fragment> } };


export type GetDocumentEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetDocumentEntryQuery = { node?: Maybe<ExternalDocumentDetailPropsFragment> };


export type GetObjectEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetObjectEntryQuery = { node?: Maybe<ObjectDetailPropsFragment> };


export type GetSubjectEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetSubjectEntryQuery = { node?: Maybe<SubjectDetailPropsFragment> };


export type GetPropertyEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetPropertyEntryQuery = { node?: Maybe<PropertyDetailPropsFragment> };


export type GetValueListEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetValueListEntryQuery = { node?: Maybe<ValueListDetailPropsFragment> };


export type GetUnitEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetUnitEntryQuery = { node?: Maybe<UnitDetailPropsFragment> };


export type GetValueEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetValueEntryQuery = { node?: Maybe<ValueDetailPropsFragment> };

export type GetOrderedValueEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetOrderedValueEntryQuery = { node?: Maybe<OrderedValueDetailPropsFragment> };

export type GetRelationshipToSubjectEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetRelationshipToSubjectEntryQuery = { node?: Maybe<RelationshipToSubjectDetailPropsFragment> };

export type GetRelationshipToPropertyEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetRelationshipToPropertyEntryQuery = { node?: Maybe<RelationshipToPropertyDetailPropsFragment> };

export type GetLanguageEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetLanguageEntryQuery = { node?: Maybe<LanguagePropsFragment> };

export type GetLanguageByCodeEntryQueryVariables = Exact<{
  code: Scalars['String'];
}>;

export type GetLanguageByCodeEntryQuery = { node?: Maybe<LanguagePropsFragment> };

export type GetDimensionEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetDimensionEntryQuery = { node?: Maybe<DimensionDetailPropsFragment> };

export type GetRationalEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetRationalEntryQuery = { node?: Maybe<RationalPropsFragment> };

export type GetMultiLanguageTextEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetMultiLanguageTextEntryQuery = { node?: Maybe<MultiLanguageTextPropsFragment> };

export type GetTextEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetTextEntryQuery = { node?: Maybe<TextPropsFragment> };

export type GetSymbolEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetSymbolEntryQuery = { node?: Maybe<SymbolPropsFragment> };

export type GetIntervalEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetIntervalEntryQuery = { node?: Maybe<IntervalPropsFragment> };

export type GetDictionaryEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetDictionaryEntryQuery = { node?: Maybe<DictionaryDetailPropsFragment> };

export type GetCountryEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;
export type GetCountryEntryQuery = { node?: Maybe<CountryDetailPropsFragment> };

export type GetSubdivisionEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetSubdivisionEntryQuery = { node?: Maybe<SubdivisionDetailPropsFragment> };

export type GetQuantityKindEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetQuantityKindEntryQuery = { node?: Maybe<QuantityKindDetailPropsFragment> };

export type GetTagEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetConceptEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetConceptEntryQuery = { node?: Maybe<ConceptPropsFragment> };



export type GetTagEntryQuery = { node?: Maybe<TagPropsFragment> };

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
export const RelationsPropsFragmentDoc = gql`
    fragment RelationsProps on XtdObject {
      id
      name(input: {languageTags: ["de", "en"]})
      tags {
        ...TagProps
      }
    }
    ${TagPropsFragmentDoc}`;
export const SearchResultPropsFragmentDoc = gql`
    fragment SearchResultProps on XtdObject {
  __typename
  id
  recordType
  # ... on XtdObject {
    name(input: {languageTags: ["de-DE", "en-US"]})
    # description(input: {languageTags: ["de-DE", "en-US"]})
    comment(input: {languageTags: ["de-DE", "en-US"]})
  # }
  # ... on XtdDictionary {
  #   id
  #   dname: name {
  #     texts {
  #       text
  #     }
  #   }
  # }
  tags {
    ...TagProps
  }
}
    ${TagPropsFragmentDoc}`;
export const SearchResultDictionaryPropsFragmentDoc = gql`
    fragment SearchResultDictionaryProps on XtdDictionary {
  __typename
  id
  recordType
  dname: name {
    texts {
      text
    }
  }
  tags {
    ...TagProps
  }
}
    ${TagPropsFragmentDoc}`;
export const MetaPropsFragmentDoc = gql`
    fragment MetaProps on XtdRoot {
  created
  createdBy
  lastModified
  lastModifiedBy
}
    `;
export const LanguagePropsFragmentDoc = gql`
    fragment LanguageProps on XtdLanguage {
    id
    code
    englishName
    nativeName
}
    `;
export const TranslationPropsFragmentDoc = gql`
    fragment TranslationProps on XtdMultiLanguageText {
    id
    texts {
        id
        text
        language {
            ...LanguageProps
        }
    }
}
    ${LanguagePropsFragmentDoc}`;
export const ObjectPropsFragmentDoc = gql`
fragment ObjectProps on XtdObject {
    ...MetaProps
    __typename
    id
    recordType
    majorVersion
    minorVersion
    dateOfCreation
    status
    name(input: { languageTags: ["de-DE", "en-US"] })
    names {
        ...TranslationProps
    }
    comment(input: { languageTags: ["de-DE", "en-US"] })
    comments {
        ...TranslationProps
    }
    tags {
        ...TagProps
    }
    dictionary {
        id
        name {
            ...TranslationProps
        }
    }
    replacedObjects {
        id
    }
    replacingObjects {
        id
    }
    deprecationExplanation {
        ...TranslationProps
    }
}
    ${MetaPropsFragmentDoc}
    ${TagPropsFragmentDoc}
    ${TranslationPropsFragmentDoc}
    `;
export const ExternalDocumentPropsFragmentDoc = gql`
fragment ExternalDocumentProps on XtdExternalDocument {
    ...ObjectProps
    documentUri
    author
    isbn
    publisher
    dateOfPublication
    languages {
        ...LanguageProps
    }
}
    ${ObjectPropsFragmentDoc}
    ${LanguagePropsFragmentDoc}`;
export const ConceptPropsFragmentDoc = gql`
fragment ConceptProps on XtdConcept {
    ...ObjectProps
    description(input: { languageTags: ["de-DE", "en-US"] })
    descriptions {
        ...TranslationProps
    }
    definition {
        ...TranslationProps
    }
    examples {
        ...TranslationProps
    }
    languageOfCreator {
        ...LanguageProps
    }
    referenceDocuments {
        ...ExternalDocumentProps
    }
    similarTo {
        ...RelationsProps
    }
    countryOfOrigin {
        code
        ...RelationsProps
    }
}
    ${ObjectPropsFragmentDoc}
${TranslationPropsFragmentDoc}
${ExternalDocumentPropsFragmentDoc}
${TagPropsFragmentDoc}
${RelationsPropsFragmentDoc}
${LanguagePropsFragmentDoc}`;
export const ConceptDetailPropsFragmentDoc = gql`
  fragment ConceptDetailProps on XtdConcept {
      ...ConceptProps
  }
${ConceptPropsFragmentDoc}`;
export const ExternalDocumentDetailPropsFragmentDoc = gql`
    fragment ExternalDocumentDetailProps on XtdExternalDocument {
  ...ExternalDocumentProps
  ...ConceptProps
  documents {
    ...RelationsProps
  }
}
${ExternalDocumentPropsFragmentDoc}
${RelationsPropsFragmentDoc}
${ConceptPropsFragmentDoc}`;
export const RationalPropsFragmentDoc = gql`
  fragment RationalProps on XtdRational {
      id
      numerator
      denominator
  }
`;
export const DimensionPropsFragmentDoc = gql`
fragment DimensionProps on XtdDimension {
    ...ConceptProps
    amountOfSubstanceExponent {
    ...RationalProps
    }
    luminousIntensityExponent{
    ...RationalProps
    }
    lengthExponent {
    ...RationalProps
    }
    massExponent {
    ...RationalProps
    }
    timeExponent {
    ...RationalProps
    }
    electricCurrentExponent {
    ...RationalProps
    }
    thermodynamicTemperatureExponent {
    ...RationalProps
    }   
}
    ${ConceptPropsFragmentDoc}
${RationalPropsFragmentDoc}`;
export const RelationshipToSubjectPropsFragmentDoc = gql`
  fragment RelationshipToSubjectProps on XtdRelationshipToSubject {
    ...ObjectProps
  }
  ${ObjectPropsFragmentDoc}`;
export const ObjectDetailPropsFragmentDoc = gql`
    fragment ObjectDetailProps on XtdObject {
  ...ObjectProps
}
${ObjectPropsFragmentDoc}`;
export const ValuePropsFragmentDoc = gql`
  fragment ValueProps on XtdValue {
      ...ObjectProps
      nominalValue
  }
  ${ObjectPropsFragmentDoc}`;
export const ValueDetailPropsFragmentDoc = gql`
  fragment ValueDetailProps on XtdValue {
      ...ValueProps
      orderedValues {
        ...RelationsProps
        valueLists {
          ...RelationsProps
        }
      }
  }
  ${ValuePropsFragmentDoc}
  ${RelationsPropsFragmentDoc}`;
export const PropertyPropsFragmentDoc = gql`
  fragment PropertyProps on XtdProperty {
      ...ConceptDetailProps
      dataType
      dataFormat
  }
  ${ConceptDetailPropsFragmentDoc}`;
export const SubjectDetailPropsFragmentDoc = gql`
  fragment SubjectDetailProps on XtdSubject {
    ...ConceptDetailProps
    properties {
        ...PropertyProps
        possibleValues {
            id
            values {
                id
                order
                orderedValue {
                    ...ValueProps
                }
            }
        }
    }
    connectedSubjects {
        ...RelationsProps
        targetSubjects {
          ...RelationsProps
        }
    }
    connectingSubjects {
        ...RelationsProps
        connectingSubject {
            ...RelationsProps 
        }
    }
  }
  ${ConceptDetailPropsFragmentDoc}
${ValuePropsFragmentDoc}
${RelationsPropsFragmentDoc}
${PropertyPropsFragmentDoc}
`;
export const RelationshipToSubjectDetailPropsFragmentDoc = gql`
  fragment RelationshipToSubjectProps on XtdRelationshipToSubject {
    ...RelationshipToSubjectProps
    scopeSubjects {
        ...RelationsProps
    }
    targetSubjects {
        ...RelationsProps
    }
    relationshipType {
        kind
    }
    relatingSubject {
        ...RelationsProps
    }
}
${RelationshipToSubjectPropsFragmentDoc}
${RelationsPropsFragmentDoc}`;
export const SymbolPropsFragmentDoc = gql`
  fragment SymbolProps on XtdSymbol {
      subject {
          ...RelationsProps
      }
      symbol {
          text
          language {
              ...LanguageProps
          }
      }
  }
${RelationsPropsFragmentDoc}
${LanguagePropsFragmentDoc}`;
export const UnitPropsFragmentDoc = gql`
  fragment UnitProps on XtdUnit {
      ...ConceptProps
      scale
      base
  }
    ${ConceptPropsFragmentDoc}`;
export const ValueListPropsFragmentDoc = gql`
  fragment ValueListProps on XtdValueList {
    ...ConceptProps
  }
  ${ConceptPropsFragmentDoc}`;
export const IntervalPropsFragmentDoc = gql`
  fragment IntervalProps on XtdInterval {
    id
    minimumIncluded
    maximumIncluded
    minimum {
      ...RelationsProps
    }
    maximum {
      ...RelationsProps
    }
  }
  ${RelationsPropsFragmentDoc}`;
export const RelationshipToPropertyPropsFragmentDoc = gql`
  fragment RelationshipToPropertyProps on XtdRelationshipToProperty {
      ...ObjectProps
  }
  ${ObjectPropsFragmentDoc}`;
export const QuantityKindPropsFragmentDoc = gql`
  fragment QuantityKindProps on XtdQuantityKind {
    ...ConceptProps
    units {
        ...RelationsProps
    }
    dimension {
        ...DimensionProps
    }
}
    ${ConceptPropsFragmentDoc}
${RelationsPropsFragmentDoc}
${DimensionPropsFragmentDoc}`;
export const PropertyDetailPropsFragmentDoc = gql`
  fragment PropertyDetailProps on XtdProperty {
      ...PropertyProps
      connectedProperties {
          ...RelationshipToPropertyProps
      }
      symbols {
          ...SymbolProps
      }
      boundaryValues {
          ...IntervalProps
      }
      dimension {
          ...DimensionProps
      }
      quantityKinds {
          ...QuantityKindProps
      }
      units {
          ...RelationsProps  
      }
      possibleValues {
          ...RelationsProps
          values {
              id
              order
              orderedValue {
                  ...ValueProps
              }
          }
      }
      subjects {
          ...SubjectDetailProps
      }
  }
  ${PropertyPropsFragmentDoc}
${RelationshipToPropertyPropsFragmentDoc}
${SymbolPropsFragmentDoc}
${IntervalPropsFragmentDoc}
${DimensionPropsFragmentDoc}
${QuantityKindPropsFragmentDoc}
${RelationsPropsFragmentDoc}
${ValuePropsFragmentDoc}
${SubjectDetailPropsFragmentDoc}`;
export const RelationshipToPropertyDetailPropsFragmentDoc = gql`
  fragment RelationshipToPropertyDetailProps on XtdRelationshipToProperty {
      ...RelationshipToPropertyProps
      relationshipType
      targetProperties {
          ...PropertyDetailProps
      }
  }
    ${RelationshipToPropertyPropsFragmentDoc}
${PropertyDetailPropsFragmentDoc}`;
export const UnitDetailPropsFragmentDoc = gql`
  fragment UnitDetailProps on XtdUnit {
      ...UnitProps
      symbol {
          ...TranslationProps
      }
      offset {
          ...RationalProps
      }
      coefficient {
          ...RationalProps
      }
      dimension {
          ...DimensionProps
      }
      properties {
          ...RelationsProps
      }
      valueLists {
          ...RelationsProps
      }
  }
    ${TranslationPropsFragmentDoc}
${UnitPropsFragmentDoc}
${RationalPropsFragmentDoc}
${RelationsPropsFragmentDoc}
${DimensionPropsFragmentDoc}`;
export const ValueListDetailPropsFragmentDoc = gql`
  fragment ValueListDetailProps on XtdValueList {
      ...ValueListProps
      properties {
          ...PropertyProps
      }
      unit {
          ...UnitProps
      }
      values {
          ...ObjectProps
          order
          orderedValue {
              ...ValueProps
          }
      }
      language {
          ...LanguageProps
      }
  }
    ${ValueListPropsFragmentDoc}
${ObjectPropsFragmentDoc}
${PropertyPropsFragmentDoc}
${UnitPropsFragmentDoc}
${LanguagePropsFragmentDoc}
${ValuePropsFragmentDoc}`;

export const VerificationPropsFragmentDoc = gql`
  fragment VerificationProps on XtdObject {
          __typename
      id
      name
      tags {
        ...TagProps
      }
      recordType
  }
  ${TagPropsFragmentDoc}`;

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
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
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
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
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

export const UpdateMajorVersionDocument = gql`
    mutation UpdateMajorVersion($input: UpdateMajorVersionInput!) {
  updateMajorVersion(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
export type UpdateMajorVersionMutationFn = Apollo.MutationFunction<UpdateMajorVersionMutation, UpdateMajorVersionMutationVariables>;

/**
 * __useUpdateMajorVersionMutation__
 *
 * To run a mutation, you first call `useUpdateMajorVersionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMajorVersionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMajorVersionMutation, { data, loading, error }] = useUpdateMajorVersionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateMajorVersionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMajorVersionMutation, UpdateMajorVersionMutationVariables>) {
  return Apollo.useMutation<UpdateMajorVersionMutation, UpdateMajorVersionMutationVariables>(UpdateMajorVersionDocument, baseOptions);
}
export type UpdateMajorVersionMutationHookResult = ReturnType<typeof useUpdateMajorVersionMutation>;
export type UpdateMajorVersionMutationResult = Apollo.MutationResult<UpdateMajorVersionMutation>;
export type UpdateMajorVersionMutationOptions = Apollo.BaseMutationOptions<UpdateMajorVersionMutation, UpdateMajorVersionMutationVariables>;
export const UpdateMinorVersionDocument = gql`
    mutation UpdateMinorVersion($input: UpdateMinorVersionInput!) {
  updateMinorVersion(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
export type UpdateMinorVersionMutationFn = Apollo.MutationFunction<UpdateMinorVersionMutation, UpdateMinorVersionMutationVariables>;

/**
 * __useUpdateMinorVersionMutation__
 *
 * To run a mutation, you first call `useUpdateMinorVersionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMinorVersionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMinorVersionMutation, { data, loading, error }] = useUpdateMinorVersionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateMinorVersionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMinorVersionMutation, UpdateMinorVersionMutationVariables>) {
  return Apollo.useMutation<UpdateMinorVersionMutation, UpdateMinorVersionMutationVariables>(UpdateMinorVersionDocument, baseOptions);
}
export type UpdateMinorVersionMutationHookResult = ReturnType<typeof useUpdateMajorVersionMutation>;
export type UpdateMinorVersionMutationResult = Apollo.MutationResult<UpdateMajorVersionMutation>;
export type UpdateMinorVersionMutationOptions = Apollo.BaseMutationOptions<UpdateMajorVersionMutation, UpdateMajorVersionMutationVariables>;
export const AddNameDocument = gql`
    mutation AddName($input: AddTextInput!) {
  addName(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
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
    mutation UpdateName($input: UpdateTextInput!) {
  updateName(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
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
    mutation DeleteName($input: DeleteTextInput!) {
  deleteName(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
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
    mutation AddDescription($input: AddTextInput!) {
  addDescription(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
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
    mutation UpdateDescription($input: UpdateTextInput!) {
  updateDescription(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
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
    mutation DeleteDescription($input: DeleteTextInput!) {
  deleteDescription(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
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

export const AddCommentDocument = gql`
    mutation AddComment($input: AddTextInput!) {
  addComment(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
export type AddCommentMutationFn = Apollo.MutationFunction<AddCommentMutation, AddCommentMutationVariables>;
/**
 * __useAddCommentMutation__
 *
 * To run a mutation, you first call `useAddCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addCommentMutation, { data, loading, error }] = useAddCommentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddCommentMutation(baseOptions?: Apollo.MutationHookOptions<AddCommentMutation, AddCommentMutationVariables>) {
  return Apollo.useMutation<AddCommentMutation, AddCommentMutationVariables>(AddCommentDocument, baseOptions);
}
export type AddCommentMutationHookResult = ReturnType<typeof useAddCommentMutation>;
export type AddCommentMutationResult = Apollo.MutationResult<AddCommentMutation>;
export type AddCommentMutationOptions = Apollo.BaseMutationOptions<AddCommentMutation, AddCommentMutationVariables>;
export const UpdateCommentDocument = gql`
mutation UpdateComment($input: UpdateTextInput!) {
updateComment(input: $input) {
catalogEntry {
...ObjectProps
}
}
}
${ObjectPropsFragmentDoc}`;
export type UpdateCommentMutationFn = Apollo.MutationFunction<UpdateCommentMutation, UpdateCommentMutationVariables>;

/**
* __useUpdateCommentMutation__
*
* To run a mutation, you first call `useUpdateCommentMutation` within a React component and pass it any options that fit your needs.
* When your component renders, `useUpdateCommentMutation` returns a tuple that includes:
* - A mutate function that you can call at any time to execute the mutation
* - An object with fields that represent the current status of the mutation's execution
*
* @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
*
* @example
* const [updateCommentMutation, { data, loading, error }] = useUpdateCommentMutation({
*   variables: {
*      input: // value for 'input'
*   },
* });
*/
export function useUpdateCommentMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCommentMutation, UpdateCommentMutationVariables>) {
  return Apollo.useMutation<UpdateCommentMutation, UpdateCommentMutationVariables>(UpdateCommentDocument, baseOptions);
}
export type UpdateCommentMutationHookResult = ReturnType<typeof useUpdateCommentMutation>;
export type UpdateCommentMutationResult = Apollo.MutationResult<UpdateCommentMutation>;
export type UpdateCommentMutationOptions = Apollo.BaseMutationOptions<UpdateCommentMutation, UpdateCommentMutationVariables>;
export const DeleteCommentDocument = gql`
mutation DeleteComment($input: DeleteTextInput!) {
deleteComment(input: $input) {
catalogEntry {
...ObjectProps
}
}
}
${ObjectPropsFragmentDoc}`;
export type DeleteCommentMutationFn = Apollo.MutationFunction<DeleteCommentMutation, DeleteCommentMutationVariables>;

/**
* __useDeleteCommentMutation__
*
* To run a mutation, you first call `useDeleteCommentMutation` within a React component and pass it any options that fit your needs.
* When your component renders, `useDeleteCommentMutation` returns a tuple that includes:
* - A mutate function that you can call at any time to execute the mutation
* - An object with fields that represent the current status of the mutation's execution
*
* @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
*
* @example
* const [deleteCommentMutation, { data, loading, error }] = useDeleteCommentMutation({
*   variables: {
*      input: // value for 'input'
*   },
* });
*/
export function useDeleteCommentMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCommentMutation, DeleteCommentMutationVariables>) {
  return Apollo.useMutation<DeleteCommentMutation, DeleteCommentMutationVariables>(DeleteCommentDocument, baseOptions);
}
export type DeleteCommentMutationHookResult = ReturnType<typeof useDeleteCommentMutation>;
export type DeleteCommentMutationResult = Apollo.MutationResult<DeleteCommentMutation>;
export type DeleteCommentMutationOptions = Apollo.BaseMutationOptions<DeleteCommentMutation, DeleteCommentMutationVariables>;

export const UpdateStatusDocument = gql`
    mutation UpdateStatus($input: UpdateStatusInput!) {
  updateStatus(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;

export type UpdateStatusMutationFn = Apollo.MutationFunction<UpdateStatusMutation, UpdateStatusMutationVariables>;
/**
 * __useUpdateStatusMutation__
 *
 * To run a mutation, you first call `useUpdateStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
* - An object with fields that represent the current status of the mutation's execution
* 
* @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
* 
* @example
* const [updateStatusMutation, { data, loading, error }] = useUpdateStatusMutation({
*  variables: {
*     input: // value for 'input'
*  },
*   
* });
*/
export function useUpdateStatusMutation(baseOptions?: Apollo.MutationHookOptions<UpdateStatusMutation, UpdateStatusMutationVariables>) {
  return Apollo.useMutation<UpdateStatusMutation, UpdateStatusMutationVariables>(UpdateStatusDocument, baseOptions);
}
export type UpdateStatusMutationHookResult = ReturnType<typeof useUpdateStatusMutation>;
export type UpdateStatusMutationResult = Apollo.MutationResult<UpdateStatusMutation>;
export type UpdateStatusMutationOptions = Apollo.BaseMutationOptions<UpdateStatusMutation, UpdateStatusMutationVariables>;

export const UpdateDataTypeDocument = gql`
    mutation UpdateDataType($input: UpdateDataTypeInput!) {
  updateDataType(input: $input) {
    catalogEntry {
      ...PropertyProps
    }
  }
}
    ${PropertyPropsFragmentDoc}`;

export type UpdateDataTypeMutationFn = Apollo.MutationFunction<UpdateDataTypeMutation, UpdateDataTypeMutationVariables>;
/**
 * __useUpdateDataTypeMutation__
 *
 * To run a mutation, you first call `useUpdateDataTypeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDataTypeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDataTypeMutation, { data, loading, error }] = useUpdateDataTypeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateDataTypeMutation(baseOptions?: Apollo.MutationHookOptions<UpdateDataTypeMutation, UpdateDataTypeMutationVariables>) {
  return Apollo.useMutation<UpdateDataTypeMutation, UpdateDataTypeMutationVariables>(UpdateDataTypeDocument, baseOptions);
}
export type UpdateDataTypeMutationHookResult = ReturnType<typeof useUpdateDataTypeMutation>;
export type UpdateDataTypeMutationResult = Apollo.MutationResult<UpdateDataTypeMutation>;
export type UpdateDataTypeMutationOptions = Apollo.BaseMutationOptions<UpdateDataTypeMutation, UpdateDataTypeMutationVariables>;

export const updateNominalValueDocument = gql`
    mutation UpdateNominalValue($input: UpdateNominalValueInput!) {
  updateNominalValue(input: $input) {
    catalogEntry {
      ...ValueProps
    }
  }
}
    ${ValuePropsFragmentDoc}`;

export type UpdateNominalValueMutationFn = Apollo.MutationFunction<UpdateNominalValueMutation, UpdateNominalValueMutationVariables>;

/**
 * __useUpdateNominalValueMutation__
 *
 * To run a mutation, you first call `useUpdateNominalValueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNominalValueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNominalValueMutation, { data, loading, error }] = useUpdateNominalValueMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */

export function useUpdateNominalValueMutation(baseOptions?: Apollo.MutationHookOptions<UpdateNominalValueMutation, UpdateNominalValueMutationVariables>) {
  return Apollo.useMutation<UpdateNominalValueMutation, UpdateNominalValueMutationVariables>(updateNominalValueDocument, baseOptions);
}
export type UpdateNominalValueMutationHookResult = ReturnType<typeof useUpdateNominalValueMutation>;
export type UpdateNominalValueMutationResult = Apollo.MutationResult<UpdateNominalValueMutation>;
export type UpdateNominalValueMutationOptions = Apollo.BaseMutationOptions<UpdateNominalValueMutation, UpdateNominalValueMutationVariables>;

export const AddDeprecationExplanationDocument = gql`
    mutation AddDeprecationExplanation($input: AddTextInput!) {
  addDeprecationExplanation(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
export type AddDeprecationExplanationMutationFn = Apollo.MutationFunction<AddDeprecationExplanationMutation, AddDeprecationExplanationMutationVariables>;
/**
 * __useAddDeprecationExplanationMutation__
 *
 * To run a mutation, you first call `useAddDeprecationExplanationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddDeprecationExplanationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addDeprecationExplanationMutation, { data, loading, error }] = useAddDeprecationExplanationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddDeprecationExplanationMutation(baseOptions?: Apollo.MutationHookOptions<AddDeprecationExplanationMutation, AddDeprecationExplanationMutationVariables>) {
  return Apollo.useMutation<AddDeprecationExplanationMutation, AddDeprecationExplanationMutationVariables>(AddDeprecationExplanationDocument, baseOptions);
}
export type AddDeprecationExplanationMutationHookResult = ReturnType<typeof useAddDeprecationExplanationMutation>;
export type AddDeprecationExplanationMutationResult = Apollo.MutationResult<AddDeprecationExplanationMutation>;
export type AddDeprecationExplanationMutationOptions = Apollo.BaseMutationOptions<AddDeprecationExplanationMutation, AddDeprecationExplanationMutationVariables>;
export const UpdateDeprecationExplanationDocument = gql`
    mutation UpdateDeprecationExplanation($input: UpdateTextInput!) {
  updateDeprecationExplanation(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
export type UpdateDeprecationExplanationMutationFn = Apollo.MutationFunction<UpdateDeprecationExplanationMutation, UpdateDeprecationExplanationMutationVariables>;

/**
 * __useUpdateDeprecationExplanationMutation__
 *
 * To run a mutation, you first call `useUpdateDeprecationExplanationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDeprecationExplanationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDeprecationExplanationMutation, { data, loading, error }] = useUpdateDeprecationExplanationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateDeprecationExplanationMutation(baseOptions?: Apollo.MutationHookOptions<UpdateDeprecationExplanationMutation, UpdateDeprecationExplanationMutationVariables>) {
  return Apollo.useMutation<UpdateDeprecationExplanationMutation, UpdateDeprecationExplanationMutationVariables>(UpdateDeprecationExplanationDocument, baseOptions);
}
export type UpdateDeprecationExplanationMutationHookResult = ReturnType<typeof useUpdateDeprecationExplanationMutation>;
export type UpdateDeprecationExplanationMutationResult = Apollo.MutationResult<UpdateDeprecationExplanationMutation>;
export type UpdateDeprecationExplanationMutationOptions = Apollo.BaseMutationOptions<UpdateDeprecationExplanationMutation, UpdateDeprecationExplanationMutationVariables>;
export const DeleteDeprecationExplanationDocument = gql`
    mutation DeleteDeprecationExplanation($input: DeleteTextInput!) {
  deleteDeprecationExplanation(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
export type DeleteDeprecationExplanationMutationFn = Apollo.MutationFunction<DeleteDeprecationExplanationMutation, DeleteDeprecationExplanationMutationVariables>;

/**
 * __useDeleteDeprecationExplanationMutation__
 *
 * To run a mutation, you first call `useDeleteDeprecationExplanationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteDeprecationExplanationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteDeprecationExplanationMutation, { data, loading, error }] = useDeleteDeprecationExplanationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteDeprecationExplanationMutation(baseOptions?: Apollo.MutationHookOptions<DeleteDeprecationExplanationMutation, DeleteDeprecationExplanationMutationVariables>) {
  return Apollo.useMutation<DeleteDeprecationExplanationMutation, DeleteDeprecationExplanationMutationVariables>(DeleteDeprecationExplanationDocument, baseOptions);
}
export type DeleteDeprecationExplanationMutationHookResult = ReturnType<typeof useDeleteDeprecationExplanationMutation>;
export type DeleteDeprecationExplanationMutationResult = Apollo.MutationResult<DeleteDeprecationExplanationMutation>;
export type DeleteDeprecationExplanationMutationOptions = Apollo.BaseMutationOptions<DeleteDeprecationExplanationMutation, DeleteDeprecationExplanationMutationVariables>;
export const AddDefinitionDocument = gql`
    mutation AddDefinition($input: AddTextInput!) {
  addDefinition(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
export type AddDefinitionMutationFn = Apollo.MutationFunction<AddDefinitionMutation, AddDefinitionMutationVariables>;

/**
 * __useAddDefinitionMutation__
 *
 * To run a mutation, you first call `useAddDefinitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddDefinitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addDefinitionMutation, { data, loading, error }] = useAddDefinitionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddDefinitionMutation(baseOptions?: Apollo.MutationHookOptions<AddDefinitionMutation, AddDefinitionMutationVariables>) {
  return Apollo.useMutation<AddDefinitionMutation, AddDefinitionMutationVariables>(AddDefinitionDocument, baseOptions);
}
export type AddDefinitionMutationHookResult = ReturnType<typeof useAddDefinitionMutation>;
export type AddDefinitionMutationResult = Apollo.MutationResult<AddDefinitionMutation>;
export type AddDefinitionMutationOptions = Apollo.BaseMutationOptions<AddDefinitionMutation, AddDefinitionMutationVariables>;
export const UpdateDefinitionDocument = gql`
    mutation UpdateDefinition($input: UpdateTextInput!) {
  updateDefinition(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
export type UpdateDefinitionMutationFn = Apollo.MutationFunction<UpdateDefinitionMutation, UpdateDefinitionMutationVariables>;

/**
 * __useUpdateDefinitionMutation__
 *
 * To run a mutation, you first call `useUpdateDefinitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDefinitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 * 
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 * 
 * @example
 * const [updateDefinitionMutation, { data, loading, error }] = useUpdateDefinitionMutation({
 *  variables: {
 *     input: // value for 'input'
 *  },
 * });
 */
export function useUpdateDefinitionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateDefinitionMutation, UpdateDefinitionMutationVariables>) {
  return Apollo.useMutation<UpdateDefinitionMutation, UpdateDefinitionMutationVariables>(UpdateDefinitionDocument, baseOptions);
}
export type UpdateDefinitionMutationHookResult = ReturnType<typeof useUpdateDefinitionMutation>;
export type UpdateDefinitionMutationResult = Apollo.MutationResult<UpdateDefinitionMutation>;
export type UpdateDefinitionMutationOptions = Apollo.BaseMutationOptions<UpdateDefinitionMutation, UpdateDefinitionMutationVariables>;
export const DeleteDefinitionDocument = gql`
    mutation DeleteDefinition($input: DeleteTextInput!) {
  deleteDefinition(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
export type DeleteDefinitionMutationFn = Apollo.MutationFunction<DeleteDefinitionMutation, DeleteDefinitionMutationVariables>;

/**
 * __useDeleteDefinitionMutation__
 *
 * To run a mutation, you first call `useDeleteDefinitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteDefinitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 * 
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 * 
 * @example
 * const [deleteDefinitionMutation, { data, loading, error }] = useDeleteDefinitionMutation({
 *  variables: {
 *     input: // value for 'input'
 *  },
 * });
 */
export function useDeleteDefinitionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteDefinitionMutation, DeleteDefinitionMutationVariables>) {
  return Apollo.useMutation<DeleteDefinitionMutation, DeleteDefinitionMutationVariables>(DeleteDefinitionDocument, baseOptions);
}
export type DeleteDefinitionMutationHookResult = ReturnType<typeof useDeleteDefinitionMutation>;
export type DeleteDefinitionMutationResult = Apollo.MutationResult<DeleteDefinitionMutation>;
export type DeleteDefinitionMutationOptions = Apollo.BaseMutationOptions<DeleteDefinitionMutation, DeleteDefinitionMutationVariables>;
export const AddExampleDocument = gql`
    mutation AddExample($input: AddTextInput!) {
  addExample(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
export type AddExampleMutationFn = Apollo.MutationFunction<AddExampleMutation, AddExampleMutationVariables>;

/**
 * __useAddExampleMutation__
 *
 * To run a mutation, you first call `useAddExampleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddExampleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addExampleMutation, { data, loading, error }] = useAddExampleMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddExampleMutation(baseOptions?: Apollo.MutationHookOptions<AddExampleMutation, AddExampleMutationVariables>) {
  return Apollo.useMutation<AddExampleMutation, AddExampleMutationVariables>(AddExampleDocument, baseOptions);
}
export type AddExampleMutationHookResult = ReturnType<typeof useAddExampleMutation>;
export type AddExampleMutationResult = Apollo.MutationResult<AddExampleMutation>;
export type AddExampleMutationOptions = Apollo.BaseMutationOptions<AddExampleMutation, AddExampleMutationVariables>;
export const UpdateExampleDocument = gql`
    mutation UpdateExample($input: UpdateTextInput!) {
  updateExample(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
export type UpdateExampleMutationFn = Apollo.MutationFunction<UpdateExampleMutation, UpdateExampleMutationVariables>;

/**
 * __useUpdateExampleMutation__
 *
 * To run a mutation, you first call `useUpdateExampleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateExampleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 * 
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 * 
 * @example
 * const [updateExampleMutation, { data, loading, error }] = useUpdateExampleMutation({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
*/
export function useUpdateExampleMutation(baseOptions?: Apollo.MutationHookOptions<UpdateExampleMutation, UpdateExampleMutationVariables>) {
  return Apollo.useMutation<UpdateExampleMutation, UpdateExampleMutationVariables>(UpdateExampleDocument, baseOptions);
}
export type UpdateExampleMutationHookResult = ReturnType<typeof useUpdateExampleMutation>;
export type UpdateExampleMutationResult = Apollo.MutationResult<UpdateExampleMutation>;
export type UpdateExampleMutationOptions = Apollo.BaseMutationOptions<UpdateExampleMutation, UpdateExampleMutationVariables>;
export const DeleteExampleDocument = gql`
    mutation DeleteExample($input: DeleteTextInput!) {
  deleteExample(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
export type DeleteExampleMutationFn = Apollo.MutationFunction<DeleteExampleMutation, DeleteExampleMutationVariables>;

/**
 * __useDeleteExampleMutation__
 *
 * To run a mutation, you first call `useDeleteExampleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteExampleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 * 
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 * 
 * @example
 * const [deleteExampleMutation, { data, loading, error }] = useDeleteExampleMutation({
 *  variables: {
 *     input: // value for 'input'
 *  },
 * });
 */
export function useDeleteExampleMutation(baseOptions?: Apollo.MutationHookOptions<DeleteExampleMutation, DeleteExampleMutationVariables>) {
  return Apollo.useMutation<DeleteExampleMutation, DeleteExampleMutationVariables>(DeleteExampleDocument, baseOptions);
}
export type DeleteExampleMutationHookResult = ReturnType<typeof useDeleteExampleMutation>;
export type DeleteExampleMutationResult = Apollo.MutationResult<DeleteExampleMutation>;
export type DeleteExampleMutationOptions = Apollo.BaseMutationOptions<DeleteExampleMutation, DeleteExampleMutationVariables>;
export const AddCountryOfOriginDocument = gql`
    mutation AddCountryOfOrigin($input: AddTextInput!) {
  addCountryOfOrigin(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
export type AddCountryOfOriginMutationFn = Apollo.MutationFunction<AddCountryOfOriginMutation, AddCountryOfOriginMutationVariables>;

/**
 * __useAddCountryOfOriginMutation__
 *
 * To run a mutation, you first call `useAddCountryOfOriginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddCountryOfOriginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 * 
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 * 
 * @example
 * const [addCountryOfOriginMutation, { data, loading, error }] = useAddCountryOfOriginMutation({
 *  variables: {
 *     input: // value for 'input'
 *  },
 * });
*/
export function useAddCountryOfOriginMutation(baseOptions?: Apollo.MutationHookOptions<AddCountryOfOriginMutation, AddCountryOfOriginMutationVariables>) {
  return Apollo.useMutation<AddCountryOfOriginMutation, AddCountryOfOriginMutationVariables>(AddCountryOfOriginDocument, baseOptions);
}
export type AddCountryOfOriginMutationHookResult = ReturnType<typeof useAddCountryOfOriginMutation>;
export type AddCountryOfOriginMutationResult = Apollo.MutationResult<AddCountryOfOriginMutation>;
export type AddCountryOfOriginMutationOptions = Apollo.BaseMutationOptions<AddCountryOfOriginMutation, AddCountryOfOriginMutationVariables>;
export const DeleteCountryOfOriginDocument = gql`
    mutation DeleteCountryOfOrigin($input: DeleteTextInput!) {
  deleteCountryOfOrigin(input: $input) {
    catalogEntry {
      ...ObjectProps
    }
  }
}
    ${ObjectPropsFragmentDoc}`;
export type DeleteCountryOfOriginMutationFn = Apollo.MutationFunction<DeleteCountryOfOriginMutation, DeleteCountryOfOriginMutationVariables>;

/**
 * __useDeleteCountryOfOriginMutation__
 *
 * To run a mutation, you first call `useDeleteCountryOfOriginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCountryOfOriginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 * 
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 * 
 * @example
 * const [deleteCountryOfOriginMutation, { data, loading, error }] = useDeleteCountryOfOriginMutation({
 *  variables: {
 *     input: // value for 'input'
 *  },
 * });
*/
export function useDeleteCountryOfOriginMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCountryOfOriginMutation, DeleteCountryOfOriginMutationVariables>) {
  return Apollo.useMutation<DeleteCountryOfOriginMutation, DeleteCountryOfOriginMutationVariables>(DeleteCountryOfOriginDocument, baseOptions);
}
export type DeleteCountryOfOriginMutationHookResult = ReturnType<typeof useDeleteCountryOfOriginMutation>;
export type DeleteCountryOfOriginMutationResult = Apollo.MutationResult<DeleteCountryOfOriginMutation>;
export type DeleteCountryOfOriginMutationOptions = Apollo.BaseMutationOptions<DeleteCountryOfOriginMutation, DeleteCountryOfOriginMutationVariables>;
export const CreateTagDocument = gql`
    mutation createTag($input: CreateTagInput!) {
      createTag(input: $input) {
        tag {
          id
          name
        }
      }
    }
`;
export type CreateTagMutationFn = Apollo.MutationFunction<CreateTagMutation, CreateTagMutationVariables>;

/**
 * __useCreateTagMutation__
 *
 * To run a mutation, you first call `useCreateTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTagMutation, { data, loading, error }] = useCreateTagMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateTagMutation(baseOptions?: Apollo.MutationHookOptions<CreateTagMutation, CreateTagMutationVariables>) {
  return Apollo.useMutation<CreateTagMutation, CreateTagMutationVariables>(CreateTagDocument, baseOptions);
}
export type CreateTagMutationHookResult = ReturnType<typeof useCreateTagMutation>;
export type CreateTagMutationResult = Apollo.MutationResult<CreateTagMutation>;
export type CreateTagOptions = Apollo.BaseMutationOptions<CreateTagMutation, CreateTagMutationVariables>;
export const AddTagDocument = gql`
  mutation addTag($input: AddTagInput!) {
    addTag(input: $input) {
      catalogEntry {
        __typename
      }
    }
  }
`;

export type AddTagMutationFn = Apollo.MutationFunction<AddTagMutation, AddTagMutationVariables>;

/**
 * __useAddTagMutation__
 *
 * To run a mutation, you first call `useAddTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addTagMutation, { data, loading, error }] = useAddTagMutation({
 *   variables: {
 *      datasetId: // value for 'datasetId'
 *      tag: // value for 'tag'
 *   },
 * });
 */
export function useAddTagMutation(baseOptions?: Apollo.MutationHookOptions<AddTagMutation, AddTagMutationVariables>) {
  return Apollo.useMutation<AddTagMutation, AddTagMutationVariables>(AddTagDocument, baseOptions);
}
export type AddTagMutationHookResult = ReturnType<typeof useAddTagMutation>;
export type AddTagMutationResult = Apollo.MutationResult<AddTagMutation>;
export type AddTagMutationOptions = Apollo.BaseMutationOptions<AddTagMutation, AddTagMutationVariables>;
export const RemoveTagDocument = gql`
  mutation removeTag($input: RemoveTagInput!) {
    removeTag(input: $input) {
      catalogEntry {
        __typename
      }
    }
  }
`;
export type RemoveTagMutationFn = Apollo.MutationFunction<RemoveTagMutation, RemoveTagMutationVariables>;

/**
 * __useRemoveTagMutation__
 *
 * To run a mutation, you first call `useRemoveTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 * 
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 * 
 * @example
 * const [removeTagMutation, { data, loading, error }] = useRemoveTagMutation({
 *  variables: {
 *     datasetId: // value for 'datasetId'
 *    tag: // value for 'tag'
 *  },
 * });
 */
export function useRemoveTagMutation(baseOptions?: Apollo.MutationHookOptions<RemoveTagMutation, RemoveTagMutationVariables>) {
  return Apollo.useMutation<RemoveTagMutation, RemoveTagMutationVariables>(RemoveTagDocument, baseOptions);
}
export type RemoveTagMutationHookResult = ReturnType<typeof useRemoveTagMutation>;
export type RemoveTagMutationResult = Apollo.MutationResult<RemoveTagMutation>;
export type RemoveTagMutationOptions = Apollo.BaseMutationOptions<RemoveTagMutation, RemoveTagMutationVariables>;
export const UpdateTagDocument = gql`
  mutation updateTag($input: UpdateTagInput!) {
    updateTag(input: $input) {
      tag {
        id
        name
      }
    }
  }
`;
export type UpdateTagMutationFn = Apollo.MutationFunction<UpdateTagMutation, UpdateTagMutationVariables>;

/**
 * __useUpdateTagMutation__
 *
 * To run a mutation, you first call `useUpdateTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 * 
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 * 
 * @example
 * const [updateTagMutation, { data, loading, error }] = useUpdateTagMutation({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
 * 
  */
export function useUpdateTagMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTagMutation, UpdateTagMutationVariables>) {
  return Apollo.useMutation<UpdateTagMutation, UpdateTagMutationVariables>(UpdateTagDocument, baseOptions);
}
export type UpdateTagMutationHookResult = ReturnType<typeof useUpdateTagMutation>;
export type UpdateTagMutationResult = Apollo.MutationResult<UpdateTagMutation>;
export type UpdateTagMutationOptions = Apollo.BaseMutationOptions<UpdateTagMutation, UpdateTagMutationVariables>;
export const DeleteTagMutationDocument = gql`
  mutation deleteTag($input: DeleteTagInput!) {
    deleteTag(input: $input) {
      catalogEntry {
        __typename
      }
    }
  }
`;
export type DeleteTagMutationMutationFn = Apollo.MutationFunction<DeleteTagMutation, DeleteTagMutationVariables>;

/**
 * __useDeleteTagMutationMutation__
 *
 * To run a mutation, you first call `useDeleteTagMutationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTagMutationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTagMutationMutation, { data, loading, error }] = useDeleteTagMutationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteTagMutationMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTagMutation, DeleteTagMutationVariables>) {
  return Apollo.useMutation<DeleteTagMutation, DeleteTagMutationVariables>(DeleteTagMutationDocument, baseOptions);
}
export type DeleteTagMutationMutationHookResult = ReturnType<typeof useDeleteTagMutationMutation>;
export type DeleteTagMutationMutationResult = Apollo.MutationResult<DeleteTagMutation>;
export type DeleteTagMutationMutationOptions = Apollo.BaseMutationOptions<DeleteTagMutation, DeleteTagMutationVariables>;
export const CreateRelationshipDocument = gql`
    mutation CreateRelationship($input: CreateRelationshipInput!) {
  createRelationship(input: $input) {
      catalogEntry {
        __typename
      }
  }
}
    `;
export type CreateRelationshipMutationFn = Apollo.MutationFunction<CreateRelationshipMutation, CreateRelationshipMutationVariables>;

/**
 * __useCreateRelationshipMutation__
 *
 * To run a mutation, you first call `useCreateRelationshipMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRelationshipMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRelationshipMutation, { data, loading, error }] = useCreateRelationshipMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateRelationshipMutation(baseOptions?: Apollo.MutationHookOptions<CreateRelationshipMutation, CreateRelationshipMutationVariables>) {
  return Apollo.useMutation<CreateRelationshipMutation, CreateRelationshipMutationVariables>(CreateRelationshipDocument, baseOptions);
}
export type CreateRelationshipMutationHookResult = ReturnType<typeof useCreateRelationshipMutation>;
export type CreateRelationshipMutationResult = Apollo.MutationResult<CreateRelationshipMutation>;
export type CreateRelationshipMutationOptions = Apollo.BaseMutationOptions<CreateRelationshipMutation, CreateRelationshipMutationVariables>;

export const DeleteRelationshipDocument = gql`
    mutation DeleteRelationship($input: DeleteRelationshipInput!) {
  deleteRelationship(input: $input) {
      catalogEntry {
        __typename
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
export const FindLanguagesDocument = gql`
    query FindLanguages($input: FilterInput!) {
  findLanguages(input: $input) {
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
    query FindItem($input: SearchInput!, $pageSize: Int, $pageNumber: Int) {
  search(input: $input, pageSize: $pageSize, pageNumber: $pageNumber) {
    nodes {
      ...SearchResultProps
      ...SearchResultDictionaryProps
    }
    pageInfo {
      ...PageProps
    }
    totalElements
  }
}
    ${SearchResultPropsFragmentDoc}
    ${SearchResultDictionaryPropsFragmentDoc}
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
 *      pageSize: // value for 'pageSize'
 *      pageNumber: // value for 'pageNumber'
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
export const FindTagsDocument = gql`
    query FindTags($pageSize: Int) {  
  findTags(input: {pageSize: $pageSize}) {
    nodes {
      id,
      name
    }
    totalElements
  }
}
`;

/**
 * __useFindTagsQuery__
 *
 * To run a query within a React component, call `useFindTagsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindTagsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindTagsQuery({
 *   variables: {
 *      input: // value for 'input'
 *      pageSize: // value for 'pageSize'
 *      pageNumber: // value for 'pageNumber'
 *   },
 * });
 */
export function useFindTagsQuery(baseOptions?: Apollo.QueryHookOptions<FindTagsQuery, FindTagsQueryVariables>) {
  return Apollo.useQuery<FindTagsQuery, FindTagsQueryVariables>(FindTagsDocument, baseOptions);
}
export function useFindTagsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindTagsQuery, FindTagsQueryVariables>) {
  return Apollo.useLazyQuery<FindTagsQuery, FindTagsQueryVariables>(FindTagsDocument, baseOptions);
}
export type FindTagsQueryHookResult = ReturnType<typeof useFindTagsQuery>;
export type FindTagsLazyQueryHookResult = ReturnType<typeof useFindTagsLazyQuery>;
export type FindTagsQueryResult = Apollo.QueryResult<FindTagsQuery, FindTagsQueryVariables>;
// --------------------------------------
export const PropertyTreeDocument = gql`
    query PropertyTree {
  hierarchy(
    input: {rootNodeFilter: {entityTypeIn: [Subject], tagged: ["5997da9b-a716-45ae-84a9-e2a7d186bcf9"]}}
  ) {
    nodes {
      recordType
      id 
      name
      tags {
        id
        name
      }
    }
    paths
  }
}
    
    `;

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

// FindPropGroupWithoutProp

export const FindPropGroupWithoutPropTreeDocument = gql`
    query FindPropGroupWithoutPropTree {
      findPropGroupWithoutProp{
    nodes {
      ...VerificationProps
    }
    paths
  }
}
    ${VerificationPropsFragmentDoc}`;

export function useFindPropGroupWithoutPropTreeQuery(baseOptions?: Apollo.QueryHookOptions<FindPropGroupWithoutPropTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useQuery<FindPropGroupWithoutPropTreeQuery, FindVerificationTreeQueryVariables>(FindPropGroupWithoutPropTreeDocument, baseOptions);
}
export function useFindPropGroupWithoutPropTreeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindPropGroupWithoutPropTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useLazyQuery<FindPropGroupWithoutPropTreeQuery, FindVerificationTreeQueryVariables>(FindPropGroupWithoutPropTreeDocument, baseOptions);
}
export type FindPropGroupWithoutPropTreeQueryHookResult = ReturnType<typeof useFindPropGroupWithoutPropTreeQuery>;
export type FindPropGroupWithoutPropTreeLazyQueryHookResult = ReturnType<typeof useFindPropGroupWithoutPropTreeLazyQuery>;
export type FindPropGroupWithoutPropTreeQueryResult = Apollo.QueryResult<FindPropGroupWithoutPropTreeQuery, FindVerificationTreeQueryVariables>;

// FindPropWithoutSubjectOrPropGroup

export const FindPropWithoutSubjectOrPropGroupTreeDocument = gql`
    query FindPropWithoutSubjectOrPropGroupTree {
      findPropWithoutSubjectOrPropGroup{
    nodes {
      ...VerificationProps
    }
    paths
  }
}
    ${VerificationPropsFragmentDoc}`;

export function useFindPropWithoutSubjectOrPropGroupTreeQuery(baseOptions?: Apollo.QueryHookOptions<FindPropWithoutSubjectOrPropGroupTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useQuery<FindPropWithoutSubjectOrPropGroupTreeQuery, FindVerificationTreeQueryVariables>(FindPropWithoutSubjectOrPropGroupTreeDocument, baseOptions);
}
export function useFindPropWithoutSubjectOrPropGroupTreeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindPropWithoutSubjectOrPropGroupTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useLazyQuery<FindPropWithoutSubjectOrPropGroupTreeQuery, FindVerificationTreeQueryVariables>(FindPropWithoutSubjectOrPropGroupTreeDocument, baseOptions);
}
export type FindPropWithoutSubjectOrPropGroupTreeQueryHookResult = ReturnType<typeof useFindPropWithoutSubjectOrPropGroupTreeQuery>;
export type FindPropWithoutSubjectOrPropGroupTreeLazyQueryHookResult = ReturnType<typeof useFindPropWithoutSubjectOrPropGroupTreeLazyQuery>;
export type FindPropWithoutSubjectOrPropGroupTreeQueryResult = Apollo.QueryResult<FindPropWithoutSubjectOrPropGroupTreeQuery, FindVerificationTreeQueryVariables>;

// FindGroupWithoutSubject

export const FindGroupWithoutSubjectTreeDocument = gql`
    query FindGroupWithoutSubjectTree {
      findGroupWithoutSubject{
    nodes {
      ...VerificationProps
    }
    paths
  }
}
    ${VerificationPropsFragmentDoc}
    `;
export function useFindGroupWithoutSubjectTreeQuery(baseOptions?: Apollo.QueryHookOptions<FindGroupWithoutSubjectTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useQuery<FindGroupWithoutSubjectTreeQuery, FindVerificationTreeQueryVariables>(FindGroupWithoutSubjectTreeDocument, baseOptions);
}
export function useFindGroupWithoutSubjectTreeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindGroupWithoutSubjectTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useLazyQuery<FindGroupWithoutSubjectTreeQuery, FindVerificationTreeQueryVariables>(FindGroupWithoutSubjectTreeDocument, baseOptions);
}
export type FindGroupWithoutSubjectTreeQueryHookResult = ReturnType<typeof useFindGroupWithoutSubjectTreeQuery>;
export type FindGroupWithoutSubjectTreeLazyQueryHookResult = ReturnType<typeof useFindGroupWithoutSubjectTreeLazyQuery>;
export type FindGroupWithoutSubjectTreeQueryResult = Apollo.QueryResult<FindGroupWithoutSubjectTreeQuery, FindVerificationTreeQueryVariables>;

// FindSubjectWithoutProp

export const FindSubjectWithoutPropTreeDocument = gql`
    query FindSubjectWithoutPropTree {
      findSubjectWithoutProp{
    nodes {
      ...VerificationProps
    }
    paths
  }
}
    ${VerificationPropsFragmentDoc}`;

export function useFindSubjectWithoutPropTreeQuery(baseOptions?: Apollo.QueryHookOptions<FindSubjectWithoutPropTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useQuery<FindSubjectWithoutPropTreeQuery, FindVerificationTreeQueryVariables>(FindSubjectWithoutPropTreeDocument, baseOptions);
}
export function useFindSubjectWithoutPropTreeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindSubjectWithoutPropTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useLazyQuery<FindSubjectWithoutPropTreeQuery, FindVerificationTreeQueryVariables>(FindSubjectWithoutPropTreeDocument, baseOptions);
}
export type FindSubjectWithoutPropTreeQueryHookResult = ReturnType<typeof useFindSubjectWithoutPropTreeQuery>;
export type FindSubjectWithoutPropTreeLazyQueryHookResult = ReturnType<typeof useFindSubjectWithoutPropTreeLazyQuery>;
export type FindSubjectWithoutPropTreeQueryResult = Apollo.QueryResult<FindSubjectWithoutPropTreeQuery, FindVerificationTreeQueryVariables>;

// FindValueListWithoutProp

export const FindValueListWithoutPropTreeDocument = gql`
    query FindValueListWithoutPropTree {
      findValueListWithoutProp{
    nodes {
      ...VerificationProps
    }
    paths
  }
}
    ${VerificationPropsFragmentDoc}`;

export function useFindValueListWithoutPropTreeQuery(baseOptions?: Apollo.QueryHookOptions<FindValueListWithoutPropTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useQuery<FindValueListWithoutPropTreeQuery, FindVerificationTreeQueryVariables>(FindValueListWithoutPropTreeDocument, baseOptions);
}
export function useFindValueListWithoutPropTreeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindValueListWithoutPropTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useLazyQuery<FindValueListWithoutPropTreeQuery, FindVerificationTreeQueryVariables>(FindValueListWithoutPropTreeDocument, baseOptions);
}
export type FindValueListWithoutPropTreeQueryHookResult = ReturnType<typeof useFindValueListWithoutPropTreeQuery>;
export type FindValueListWithoutPropTreeLazyQueryHookResult = ReturnType<typeof useFindValueListWithoutPropTreeLazyQuery>;
export type FindValueListWithoutPropTreeQueryResult = Apollo.QueryResult<FindValueListWithoutPropTreeQuery, FindVerificationTreeQueryVariables>;

// FindUnitWithoutValueList

export const FindUnitWithoutValueListTreeDocument = gql`
    query FindUnitWithoutValueListTree {
      findUnitWithoutValueList{
    nodes {
      ...VerificationProps
    }
    paths
  }
}
    ${VerificationPropsFragmentDoc}`;

export function useFindUnitWithoutValueListTreeQuery(baseOptions?: Apollo.QueryHookOptions<FindUnitWithoutValueListTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useQuery<FindUnitWithoutValueListTreeQuery, FindVerificationTreeQueryVariables>(FindUnitWithoutValueListTreeDocument, baseOptions);
}
export function useFindUnitWithoutValueListTreeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindUnitWithoutValueListTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useLazyQuery<FindUnitWithoutValueListTreeQuery, FindVerificationTreeQueryVariables>(FindUnitWithoutValueListTreeDocument, baseOptions);
}
export type FindUnitWithoutValueListTreeQueryHookResult = ReturnType<typeof useFindUnitWithoutValueListTreeQuery>;
export type FindUnitWithoutValueListTreeLazyQueryHookResult = ReturnType<typeof useFindUnitWithoutValueListTreeLazyQuery>;
export type FindUnitWithoutValueListTreeQueryResult = Apollo.QueryResult<FindUnitWithoutValueListTreeQuery, FindVerificationTreeQueryVariables>;

// FindValueWithoutValueList

export const FindValueWithoutValueListTreeDocument = gql`
    query FindValueWithoutValueListTree {
      findValueWithoutValueList{
    nodes {
      ...VerificationProps
    }
    paths
  }
}
    ${VerificationPropsFragmentDoc}`;

export function useFindValueWithoutValueListTreeQuery(baseOptions?: Apollo.QueryHookOptions<FindValueWithoutValueListTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useQuery<FindValueWithoutValueListTreeQuery, FindVerificationTreeQueryVariables>(FindValueWithoutValueListTreeDocument, baseOptions);
}
export function useFindValueWithoutValueListTreeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindValueWithoutValueListTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useLazyQuery<FindValueWithoutValueListTreeQuery, FindVerificationTreeQueryVariables>(FindValueWithoutValueListTreeDocument, baseOptions);
}
export type FindValueWithoutValueListTreeQueryHookResult = ReturnType<typeof useFindValueWithoutValueListTreeQuery>;
export type FindValueWithoutValueListTreeLazyQueryHookResult = ReturnType<typeof useFindValueWithoutValueListTreeLazyQuery>;
export type FindValueWithoutValueListTreeQueryResult = Apollo.QueryResult<FindValueWithoutValueListTreeQuery, FindVerificationTreeQueryVariables>;

// FindMissingTags

export const FindMissingTagsTreeDocument = gql`
    query FindMissingTagsTree {
      findMissingTags{
    nodes {
      ...VerificationProps
    }
    paths
  }
}
    ${VerificationPropsFragmentDoc}`;
export function useFindMissingTagsTreeQuery(baseOptions?: Apollo.QueryHookOptions<FindMissingTagsTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useQuery<FindMissingTagsTreeQuery, FindVerificationTreeQueryVariables>(FindMissingTagsTreeDocument, baseOptions);
}
export function useFindMissingTagsTreeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindMissingTagsTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useLazyQuery<FindMissingTagsTreeQuery, FindVerificationTreeQueryVariables>(FindMissingTagsTreeDocument, baseOptions);
}
export type FindMissingTagsTreeQueryHookResult = ReturnType<typeof useFindMissingTagsTreeQuery>;
export type FindMissingTagsTreeLazyQueryHookResult = ReturnType<typeof useFindMissingTagsTreeLazyQuery>;
export type FindMissingTagsTreeQueryResult = Apollo.QueryResult<FindMissingTagsTreeQuery, FindVerificationTreeQueryVariables>;

// FindMissingEnglishNameTree

export const FindMissingEnglishNameTreeDocument = gql`
    query FindMissingEnglishNameTree {
      findMissingEnglishName {
    nodes {
      ...VerificationProps
    }
    paths
  }
}
    ${VerificationPropsFragmentDoc}`;

export function useFindMissingEnglishNameTreeQuery(baseOptions?: Apollo.QueryHookOptions<FindMissingEnglishNameTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useQuery<FindMissingEnglishNameTreeQuery, FindVerificationTreeQueryVariables>(FindMissingEnglishNameTreeDocument, baseOptions);
}
export function useFindMissingEnglishNameTreeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindMissingEnglishNameTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useLazyQuery<FindMissingEnglishNameTreeQuery, FindVerificationTreeQueryVariables>(FindMissingEnglishNameTreeDocument, baseOptions);
}
export type FindMissingEnglishNameTreeQueryHookResult = ReturnType<typeof useFindMissingEnglishNameTreeQuery>;
export type FindMissingEnglishNameTreeLazyQueryHookResult = ReturnType<typeof useFindMissingEnglishNameTreeLazyQuery>;
export type FindMissingEnglishNameTreeQueryResult = Apollo.QueryResult<FindMissingEnglishNameTreeQuery, FindVerificationTreeQueryVariables>;

// FindMultipleIDsTree

export const FindMultipleIDsTreeDocument = gql`
    query FindMultipleIDsTree {
      findMultipleIDs{
    nodes {
      ...VerificationProps
    }
    paths
  }
}
    ${VerificationPropsFragmentDoc}`;

export function useFindMultipleIDsTreeQuery(baseOptions?: Apollo.QueryHookOptions<FindMultipleIDsTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useQuery<FindMultipleIDsTreeQuery, FindVerificationTreeQueryVariables>(FindMultipleIDsTreeDocument, baseOptions);
}
export function useFindMultipleIDsTreeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindMultipleIDsTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useLazyQuery<FindMultipleIDsTreeQuery, FindVerificationTreeQueryVariables>(FindMultipleIDsTreeDocument, baseOptions);
}
export type FindMultipleIDsTreeQueryHookResult = ReturnType<typeof useFindMultipleIDsTreeQuery>;
export type FindMultipleIDsTreeLazyQueryHookResult = ReturnType<typeof useFindMultipleIDsTreeLazyQuery>;
export type FindMultipleIDsTreeQueryResult = Apollo.QueryResult<FindMultipleIDsTreeQuery, FindVerificationTreeQueryVariables>;

// FindMissingDescription

export const FindMissingDescriptionTreeDocument = gql`
    query FindMissingDescriptionTree {
      findMissingDescription {
    nodes {
      ...VerificationProps
    }
    paths
  }
}
    ${VerificationPropsFragmentDoc}`;

export function useFindMissingDescriptionTreeQuery(baseOptions?: Apollo.QueryHookOptions<FindMissingDescriptionTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useQuery<FindMissingDescriptionTreeQuery, FindVerificationTreeQueryVariables>(FindMissingDescriptionTreeDocument, baseOptions);
}
export function useFindMissingDescriptionTreeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindMissingDescriptionTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useLazyQuery<FindMissingDescriptionTreeQuery, FindVerificationTreeQueryVariables>(FindMissingDescriptionTreeDocument, baseOptions);
}
export type FindMissingDescriptionTreeQueryHookResult = ReturnType<typeof useFindMissingDescriptionTreeQuery>;
export type FindMissingDescriptionTreeLazyQueryHookResult = ReturnType<typeof useFindMissingDescriptionTreeLazyQuery>;
export type FindMissingDescriptionTreeQueryResult = Apollo.QueryResult<FindMissingDescriptionTreeQuery, FindVerificationTreeQueryVariables>;

// FindMissingEnglishDescription

export const FindMissingEnglishDescriptionTreeDocument = gql`
    query FindMissingEnglishDescriptionTree {
      findMissingEnglishDescription {
    nodes {
      ...VerificationProps
    }
    paths
  }
}
    ${VerificationPropsFragmentDoc}`;

export function useFindMissingEnglishDescriptionTreeQuery(baseOptions?: Apollo.QueryHookOptions<FindMissingEnglishDescriptionTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useQuery<FindMissingEnglishDescriptionTreeQuery, FindVerificationTreeQueryVariables>(FindMissingEnglishDescriptionTreeDocument, baseOptions);
}
export function useFindMissingEnglishDescriptionTreeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindMissingEnglishDescriptionTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useLazyQuery<FindMissingEnglishDescriptionTreeQuery, FindVerificationTreeQueryVariables>(FindMissingEnglishDescriptionTreeDocument, baseOptions);
}
export type FindMissingEnglishDescriptionTreeQueryHookResult = ReturnType<typeof useFindMissingEnglishDescriptionTreeQuery>;
export type FindMissingEnglishDescriptionTreeLazyQueryHookResult = ReturnType<typeof useFindMissingEnglishDescriptionTreeLazyQuery>;
export type FindMissingEnglishDescriptionTreeQueryResult = Apollo.QueryResult<FindMissingEnglishDescriptionTreeQuery, FindVerificationTreeQueryVariables>;

// FindMultipleNames

export const FindMultipleNamesTreeDocument = gql`
    query FindMultipleNamesTree {
      findMultipleNames {
    nodes {
      ...VerificationProps
    }
    paths
  }
}
    ${VerificationPropsFragmentDoc}`;

export function useFindMultipleNamesTreeQuery(baseOptions?: Apollo.QueryHookOptions<FindMultipleNamesTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useQuery<FindMultipleNamesTreeQuery, FindVerificationTreeQueryVariables>(FindMultipleNamesTreeDocument, baseOptions);
}
export function useFindMultipleNamesTreeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindMultipleNamesTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useLazyQuery<FindMultipleNamesTreeQuery, FindVerificationTreeQueryVariables>(FindMultipleNamesTreeDocument, baseOptions);
}
export type FindMultipleNamesTreeQueryHookResult = ReturnType<typeof useFindMultipleNamesTreeQuery>;
export type FindMultipleNamesTreeLazyQueryHookResult = ReturnType<typeof useFindMultipleNamesTreeLazyQuery>;
export type FindMultipleNamesTreeQueryResult = Apollo.QueryResult<FindMultipleNamesTreeQuery, FindVerificationTreeQueryVariables>;

// FindMultipleNamesAcrossClasses

export const FindMultipleNamesAcrossClassesTreeDocument = gql`
    query FindMultipleNamesAcrossClassesTree {
      findMultipleNamesAcrossClasses {
    nodes {
      ...VerificationProps
    }
    paths
  }
}
    ${VerificationPropsFragmentDoc}`;

export function useFindMultipleNamesAcrossClassesTreeQuery(baseOptions?: Apollo.QueryHookOptions<FindMultipleNamesAcrossClassesTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useQuery<FindMultipleNamesAcrossClassesTreeQuery, FindVerificationTreeQueryVariables>(FindMultipleNamesAcrossClassesTreeDocument, baseOptions);
}
export function useFindMultipleNamesAcrossClassesTreeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindMultipleNamesAcrossClassesTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useLazyQuery<FindMultipleNamesAcrossClassesTreeQuery, FindVerificationTreeQueryVariables>(FindMultipleNamesAcrossClassesTreeDocument, baseOptions);
}
export type FindMultipleNamesAcrossClassesTreeQueryHookResult = ReturnType<typeof useFindMultipleNamesAcrossClassesTreeQuery>;
export type FindMultipleNamesAcrossClassesTreeLazyQueryHookResult = ReturnType<typeof useFindMultipleNamesAcrossClassesTreeLazyQuery>;
export type FindMultipleNamesAcrossClassesTreeQueryResult = Apollo.QueryResult<FindMultipleNamesAcrossClassesTreeQuery, FindVerificationTreeQueryVariables>;

export const FindExternalDocumentsQueryDocument = gql`
    query FindExternalDocumentsQuery($input: FilterInput!) {
  findExternalDocuments(input: $input) {
    nodes {
      ...ExternalDocumentProps
    }
    totalElements
  }
}
    ${ExternalDocumentPropsFragmentDoc}`;

/**
 * __useFindExternalDocumentsQuery__
 * 
 * To run a query within a React component, call `useFindExternalDocumentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindExternalDocumentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindExternalDocumentsQuery({
 *  variables: {
 *     input: // value for 'input'
 *  },
 * });
  */
export function useFindExternalDocumentsQuery(baseOptions: Apollo.QueryHookOptions<FindExternalDocumentsQuery, FindExternalDocumentsQueryVariables>) {
  return Apollo.useQuery<FindExternalDocumentsQuery, FindExternalDocumentsQueryVariables>(FindExternalDocumentsQueryDocument, baseOptions);
}
export function useFindExternalDocumentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindExternalDocumentsQuery, FindExternalDocumentsQueryVariables>) {
  return Apollo.useLazyQuery<FindExternalDocumentsQuery, FindExternalDocumentsQueryVariables>(FindExternalDocumentsQueryDocument, baseOptions);
}
export type FindExternalDocumentsQueryHookResult = ReturnType<typeof useFindExternalDocumentsQuery>;
export type FindExternalDocumentsLazyQueryHookResult = ReturnType<typeof useFindExternalDocumentsLazyQuery>;
export type FindExternalDocumentsQueryResult = Apollo.QueryResult<FindExternalDocumentsQuery, FindExternalDocumentsQueryVariables>;

export const FindPropertiesQueryDocument = gql`
    query FindPropertiesQuery($input: FilterInput!) {
  findProperties(input: $input) {
    nodes {
      ...PropertyDetailProps
    }
    totalElements
  }
}
    ${PropertyDetailPropsFragmentDoc}`;
/**
 * __useFindPropertiesQuery__
 * 
 * To run a query within a React component, call `useFindPropertiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindPropertiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindPropertiesQuery({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
 */
export function useFindPropertiesQuery(baseOptions: Apollo.QueryHookOptions<FindPropertiesQuery, FindPropertiesQueryVariables>) {
  return Apollo.useQuery<FindPropertiesQuery, FindPropertiesQueryVariables>(FindPropertiesQueryDocument, baseOptions);
}
export function useFindPropertiesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindPropertiesQuery, FindPropertiesQueryVariables>) {
  return Apollo.useLazyQuery<FindPropertiesQuery, FindPropertiesQueryVariables>(FindPropertiesQueryDocument, baseOptions);
}
export type FindPropertiesQueryHookResult = ReturnType<typeof useFindPropertiesQuery>;
export type FindPropertiesLazyQueryHookResult = ReturnType<typeof useFindPropertiesLazyQuery>;
export type FindPropertiesQueryResult = Apollo.QueryResult<FindPropertiesQuery, FindPropertiesQueryVariables>;
export const FindSubjectsQueryDocument = gql`
    query FindSubjectsQuery($input: FilterInput!) {
  findSubjects(input: $input) {
    nodes {
      ...SubjectDetailProps
    }
    totalElements
  }
}
    ${SubjectDetailPropsFragmentDoc}`;
/**
 * __useFindSubjectsQuery__
 * 
 * To run a query within a React component, call `useFindSubjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindSubjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindSubjectsQuery({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
  */
export function useFindSubjectsQuery(baseOptions: Apollo.QueryHookOptions<FindSubjectsQuery, FindSubjectsQueryVariables>) {
  return Apollo.useQuery<FindSubjectsQuery, FindSubjectsQueryVariables>(FindSubjectsQueryDocument, baseOptions);
}
export function useFindSubjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindSubjectsQuery, FindSubjectsQueryVariables>) {
  return Apollo.useLazyQuery<FindSubjectsQuery, FindSubjectsQueryVariables>(FindSubjectsQueryDocument, baseOptions);
}
export type FindSubjectsQueryHookResult = ReturnType<typeof useFindSubjectsQuery>;
export type FindSubjectsLazyQueryHookResult = ReturnType<typeof useFindSubjectsLazyQuery>;
export type FindSubjectsQueryResult = Apollo.QueryResult<FindSubjectsQuery, FindSubjectsQueryVariables>;
export const FindUnitsQueryDocument = gql`
    query FindUnitsQuery($input: FilterInput!) {
  findUnits(input: $input) {
    nodes {
      ...UnitDetailProps
    }
    totalElements
  }
}
    ${UnitDetailPropsFragmentDoc}`;
/**
 * __useFindUnitsQuery__
 * 
 * To run a query within a React component, call `useFindUnitsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindUnitsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindUnitsQuery({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
  */
export function useFindUnitsQuery(baseOptions: Apollo.QueryHookOptions<FindUnitsQuery, FindUnitsQueryVariables>) {
  return Apollo.useQuery<FindUnitsQuery, FindUnitsQueryVariables>(FindUnitsQueryDocument, baseOptions);
}
export function useFindUnitsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindUnitsQuery, FindUnitsQueryVariables>) {
  return Apollo.useLazyQuery<FindUnitsQuery, FindUnitsQueryVariables>(FindUnitsQueryDocument, baseOptions);
}
export type FindUnitsQueryHookResult = ReturnType<typeof useFindUnitsQuery>;
export type FindUnitsLazyQueryHookResult = ReturnType<typeof useFindUnitsLazyQuery>;
export type FindUnitsQueryResult = Apollo.QueryResult<FindUnitsQuery, FindUnitsQueryVariables>;
export const FindValuesQueryDocument = gql`
    query FindValuesQuery($input: FilterInput!) {
  findValues(input: $input) {
    nodes {
      ...ValueProps
    }
    totalElements
  }
}
    ${ValuePropsFragmentDoc}`;
/**
 * __useFindValuesQuery__
 * 
 * To run a query within a React component, call `useFindValuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindValuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *  
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindValuesQuery({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
 */
export function useFindValuesQuery(baseOptions: Apollo.QueryHookOptions<FindValuesQuery, FindValuesQueryVariables>) {
  return Apollo.useQuery<FindValuesQuery, FindValuesQueryVariables>(FindValuesQueryDocument, baseOptions);
}
export function useFindValuesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindValuesQuery, FindValuesQueryVariables>) {
  return Apollo.useLazyQuery<FindValuesQuery, FindValuesQueryVariables>(FindValuesQueryDocument, baseOptions);
}
export type FindValuesQueryHookResult = ReturnType<typeof useFindValuesQuery>;
export type FindValuesLazyQueryHookResult = ReturnType<typeof useFindValuesLazyQuery>;
export type FindValuesQueryResult = Apollo.QueryResult<FindValuesQuery, FindValuesQueryVariables>;
export const FindValueListsQueryDocument = gql`
    query FindValueListsQuery($input: FilterInput!) {
  findValueLists(input: $input) {
    nodes {
      ...ValueListDetailProps
    }
    totalElements
  }
}
    ${ValueListDetailPropsFragmentDoc}`;
/**
 * __useFindValueListsQuery__
 * 
 * To run a query within a React component, call `useFindValueListsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindValueListsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindValueListsQuery({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
  */
export function useFindValueListsQuery(baseOptions: Apollo.QueryHookOptions<FindValueListsQuery, FindValueListsQueryVariables>) {
  return Apollo.useQuery<FindValueListsQuery, FindValueListsQueryVariables>(FindValueListsQueryDocument, baseOptions);
}
export function useFindValueListsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindValueListsQuery, FindValueListsQueryVariables>) {
  return Apollo.useLazyQuery<FindValueListsQuery, FindValueListsQueryVariables>(FindValueListsQueryDocument, baseOptions);
}
export type FindValueListsQueryHookResult = ReturnType<typeof useFindValueListsQuery>;
export type FindValueListsLazyQueryHookResult = ReturnType<typeof useFindValueListsLazyQuery>;
export type FindValueListsQueryResult = Apollo.QueryResult<FindValueListsQuery, FindValueListsQueryVariables>;
export const FindOrderedValuesQueryDocument = gql`
    query FindOrderedValuesQuery($input: FilterInput!) {
  findOrderedValues(input: $input) {
    nodes {
      order
      {
        ...ValueProps
      }
    }
    totalElements
  }
}
    ${ValuePropsFragmentDoc}`;
/**
 * __useFindOrderedValuesQuery__
 * 
 * To run a query within a React component, call `useFindOrderedValuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindOrderedValuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindOrderedValuesQuery({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
  */
export function useFindOrderedValuesQuery(baseOptions: Apollo.QueryHookOptions<FindOrderedValuesQuery, FindOrderedValuesQueryVariables>) {
  return Apollo.useQuery<FindOrderedValuesQuery, FindOrderedValuesQueryVariables>(FindOrderedValuesQueryDocument, baseOptions);
}
export function useFindOrderedValuesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindOrderedValuesQuery, FindOrderedValuesQueryVariables>) {
  return Apollo.useLazyQuery<FindOrderedValuesQuery, FindOrderedValuesQueryVariables>(FindOrderedValuesQueryDocument, baseOptions);
}
export type FindOrderedValuesQueryHookResult = ReturnType<typeof useFindOrderedValuesQuery>;
export type FindOrderedValuesLazyQueryHookResult = ReturnType<typeof useFindOrderedValuesLazyQuery>;
export type FindOrderedValuesQueryResult = Apollo.QueryResult<FindOrderedValuesQuery, FindOrderedValuesQueryVariables>;
export const FindRelationshipToSubjectQueryDocument = gql`
    query FindRelationshipToSubjectQuery($input: FilterInput!) {
  findRelationshipToSubject(input: $input) {
    nodes {
      ...ObjectProps
      connectingSubject {
        ...SubjectDetailProps
      }
      scopeSubjects {
        ...SubjectDetailProps
      }
      targetSubjects {
        ...SubjectDetailProps
      }
    }
    totalElements
  }
}
    ${SubjectDetailPropsFragmentDoc}
    ${ObjectPropsFragmentDoc}`;
/**
 * __useFindRelationshipToSubjectQuery__
 *  
 * To run a query within a React component, call `useFindRelationshipToSubjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindRelationshipToSubjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindRelationshipToSubjectQuery({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
  */
export function useFindRelationshipToSubjectQuery(baseOptions: Apollo.QueryHookOptions<FindRelationshipToSubjectQuery, FindRelationshipToSubjectQueryVariables>) {
  return Apollo.useQuery<FindRelationshipToSubjectQuery, FindRelationshipToSubjectQueryVariables>(FindRelationshipToSubjectQueryDocument, baseOptions);
}
export function useFindRelationshipToSubjectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindRelationshipToSubjectQuery, FindRelationshipToSubjectQueryVariables>) {
  return Apollo.useLazyQuery<FindRelationshipToSubjectQuery, FindRelationshipToSubjectQueryVariables>(FindRelationshipToSubjectQueryDocument, baseOptions);
}
export type FindRelationshipToSubjectQueryHookResult = ReturnType<typeof useFindRelationshipToSubjectQuery>;
export type FindRelationshipToSubjectLazyQueryHookResult = ReturnType<typeof useFindRelationshipToSubjectLazyQuery>;
export type FindRelationshipToSubjectQueryResult = Apollo.QueryResult<FindRelationshipToSubjectQuery, FindRelationshipToSubjectQueryVariables>;
export const FindRelationshipToPropertyQueryDocument = gql`
    query FindRelationshipToPropertyQuery($input: FilterInput!) {
  findRelationshipToProperty(input: $input) {
    nodes {
      ...ObjectProps
      connectingProperty {
        ...PropertyDetailProps
      }
      targetProperties {
        ...PropertyDetailProps
      }
    }
    totalElements
  }
}
    ${ObjectPropsFragmentDoc}`;
/**
 * __useFindRelationshipToPropertyQuery__
 * 
 * To run a query within a React component, call `useFindRelationshipToPropertyQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindRelationshipToPropertyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindRelationshipToPropertyQuery({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
  */
export function useFindRelationshipToPropertyQuery(baseOptions: Apollo.QueryHookOptions<FindRelationshipToPropertyQuery, FindRelationshipToPropertyQueryVariables>) {
  return Apollo.useQuery<FindRelationshipToPropertyQuery, FindRelationshipToPropertyQueryVariables>(FindRelationshipToPropertyQueryDocument, baseOptions);
}
export function useFindRelationshipToPropertyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindRelationshipToPropertyQuery, FindRelationshipToPropertyQueryVariables>) {
  return Apollo.useLazyQuery<FindRelationshipToPropertyQuery, FindRelationshipToPropertyQueryVariables>(FindRelationshipToPropertyQueryDocument, baseOptions);
}
export type FindRelationshipToPropertyQueryHookResult = ReturnType<typeof useFindRelationshipToPropertyQuery>;
export type FindRelationshipToPropertyLazyQueryHookResult = ReturnType<typeof useFindRelationshipToPropertyLazyQuery>;
export type FindRelationshipToPropertyQueryResult = Apollo.QueryResult<FindRelationshipToPropertyQuery, FindRelationshipToPropertyQueryVariables>;
export const FindDimensionsQueryDocument = gql`
    query FindDimensionsQuery($input: FilterInput!) {
  findDimensions(input: $input) {
    nodes {
      ...DimensionProps
    }
    totalElements
  }
}
    ${DimensionPropsFragmentDoc}`;
/**
 * __useFindDimensionsQuery__
 * 
 * To run a query within a React component, call `useFindDimensionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindDimensionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindDimensionsQuery({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
  */
export function useFindDimensionsQuery(baseOptions: Apollo.QueryHookOptions<FindDimensionsQuery, FindDimensionsQueryVariables>) {
  return Apollo.useQuery<FindDimensionsQuery, FindDimensionsQueryVariables>(FindDimensionsQueryDocument, baseOptions);
}
export function useFindDimensionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindDimensionsQuery, FindDimensionsQueryVariables>) {
  return Apollo.useLazyQuery<FindDimensionsQuery, FindDimensionsQueryVariables>(FindDimensionsQueryDocument, baseOptions);
}
export type FindDimensionsQueryHookResult = ReturnType<typeof useFindDimensionsQuery>;
export type FindDimensionsLazyQueryHookResult = ReturnType<typeof useFindDimensionsLazyQuery>;
export type FindDimensionsQueryResult = Apollo.QueryResult<FindDimensionsQuery, FindDimensionsQueryVariables>;
export const FindRationalsQueryDocument = gql`
    query FindRationalsQuery($input: FilterInput!) {
  findRationals(input: $input) {
    nodes {
      ...RationalProps
    }
    totalElements 
  }
}
    ${RationalPropsFragmentDoc}`;
/**
 * __useFindRationalsQuery__
 * 
 * To run a query within a React component, call `useFindRationalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindRationalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindRationalsQuery({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
  */
export function useFindRationalsQuery(baseOptions: Apollo.QueryHookOptions<FindRationalsQuery, FindRationalsQueryVariables>) {
  return Apollo.useQuery<FindRationalsQuery, FindRationalsQueryVariables>(FindRationalsQueryDocument, baseOptions);
}
export function useFindRationalsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindRationalsQuery, FindRationalsQueryVariables>) {
  return Apollo.useLazyQuery<FindRationalsQuery, FindRationalsQueryVariables>(FindRationalsQueryDocument, baseOptions);
}
export type FindRationalsQueryHookResult = ReturnType<typeof useFindRationalsQuery>;
export type FindRationalsLazyQueryHookResult = ReturnType<typeof useFindRationalsLazyQuery>;
export type FindRationalsQueryResult = Apollo.QueryResult<FindRationalsQuery, FindRationalsQueryVariables>;
export const FindMultiLanguageTextsQueryDocument = gql`
    query FindMultiLanguageTextsQuery($input: FilterInput!) {
  findMultiLanguageTexts(input: $input) {
    nodes {
      ...TranslationProps
    }
    totalElements
  }
}
${TranslationPropsFragmentDoc}`;
/**
 * __useFindMultiLanguageTextsQuery__
 *  
 * To run a query within a React component, call `useFindMultiLanguageTextsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindMultiLanguageTextsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindMultiLanguageTextsQuery({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
  */
export function useFindMultiLanguageTextsQuery(baseOptions: Apollo.QueryHookOptions<FindMultiLanguageTextsQuery, FindMultiLanguageTextsQueryVariables>) {
  return Apollo.useQuery<FindMultiLanguageTextsQuery, FindMultiLanguageTextsQueryVariables>(FindMultiLanguageTextsQueryDocument, baseOptions);
}
export function useFindMultiLanguageTextsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindMultiLanguageTextsQuery, FindMultiLanguageTextsQueryVariables>) {
  return Apollo.useLazyQuery<FindMultiLanguageTextsQuery, FindMultiLanguageTextsQueryVariables>(FindMultiLanguageTextsQueryDocument, baseOptions);
}
export type FindMultiLanguageTextsQueryHookResult = ReturnType<typeof useFindMultiLanguageTextsQuery>;
export type FindMultiLanguageTextsLazyQueryHookResult = ReturnType<typeof useFindMultiLanguageTextsLazyQuery>;
export type FindMultiLanguageTextsQueryResult = Apollo.QueryResult<FindMultiLanguageTextsQuery, FindMultiLanguageTextsQueryVariables>;
export const FindTextsQueryDocument = gql`
    query FindTextsQuery($input: FilterInput!) {
  findTexts(input: $input) {
    nodes {
      ...TranslationProps
    }
    totalElements
  }
}
${TranslationPropsFragmentDoc}`;
/**
 * __useFindTextsQuery__
 * 
 * To run a query within a React component, call `useFindTextsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindTextsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindTextsQuery({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
  */
export function useFindTextsQuery(baseOptions: Apollo.QueryHookOptions<FindTextsQuery, FindTextsQueryVariables>) {
  return Apollo.useQuery<FindTextsQuery, FindTextsQueryVariables>(FindTextsQueryDocument, baseOptions);
}
export function useFindTextsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindTextsQuery, FindTextsQueryVariables>) {
  return Apollo.useLazyQuery<FindTextsQuery, FindTextsQueryVariables>(FindTextsQueryDocument, baseOptions);
}
export type FindTextsQueryHookResult = ReturnType<typeof useFindTextsQuery>;
export type FindTextsLazyQueryHookResult = ReturnType<typeof useFindTextsLazyQuery>;
export type FindTextsQueryResult = Apollo.QueryResult<FindTextsQuery, FindTextsQueryVariables>;
export const FindSymbolsQueryDocument = gql`
    query FindSymbolsQuery($input: FilterInput!) {
  findSymbols(input: $input) {
    nodes {
      ...SymbolProps
    }
    totalElements
  }
}
    ${SymbolPropsFragmentDoc}`;
/**
 * __useFindSymbolsQuery__
 * 
 * To run a query within a React component, call `useFindSymbolsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindSymbolsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindSymbolsQuery({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
  */
export function useFindSymbolsQuery(baseOptions: Apollo.QueryHookOptions<FindSymbolsQuery, FindSymbolsQueryVariables>) {
  return Apollo.useQuery<FindSymbolsQuery, FindSymbolsQueryVariables>(FindSymbolsQueryDocument, baseOptions);
}
export function useFindSymbolsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindSymbolsQuery, FindSymbolsQueryVariables>) {
  return Apollo.useLazyQuery<FindSymbolsQuery, FindSymbolsQueryVariables>(FindSymbolsQueryDocument, baseOptions);
}
export type FindSymbolsQueryHookResult = ReturnType<typeof useFindSymbolsQuery>;
export type FindSymbolsLazyQueryHookResult = ReturnType<typeof useFindSymbolsLazyQuery>;
export type FindSymbolsQueryResult = Apollo.QueryResult<FindSymbolsQuery, FindSymbolsQueryVariables>;
export const FindIntervalsQueryDocument = gql`
    query FindIntervalsQuery($input: FilterInput!) {
  findIntervals(input: $input) {
    nodes {
      ...IntervalProps
    }
    totalElements
  }
}
    ${IntervalPropsFragmentDoc}`;
/**
 * __useFindIntervalsQuery__
 * 
 * To run a query within a React component, call `useFindIntervalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindIntervalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindIntervalsQuery({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
  */
export function useFindIntervalsQuery(baseOptions: Apollo.QueryHookOptions<FindIntervalsQuery, FindIntervalsQueryVariables>) {
  return Apollo.useQuery<FindIntervalsQuery, FindIntervalsQueryVariables>(FindIntervalsQueryDocument, baseOptions);
}
export function useFindIntervalsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindIntervalsQuery, FindIntervalsQueryVariables>) {
  return Apollo.useLazyQuery<FindIntervalsQuery, FindIntervalsQueryVariables>(FindIntervalsQueryDocument, baseOptions);
}
export type FindIntervalsQueryHookResult = ReturnType<typeof useFindIntervalsQuery>;
export type FindIntervalsLazyQueryHookResult = ReturnType<typeof useFindIntervalsLazyQuery>;
export type FindIntervalsQueryResult = Apollo.QueryResult<FindIntervalsQuery, FindIntervalsQueryVariables>;
export const FindDictionariesQueryDocument = gql`
    query FindDictionariesQuery($input: FilterInput!) {
  findDictionaries(input: $input) {
    nodes {
      ...MetaProps
      id
      name {
        ...TranslationProps
      }
      tags {
        id
        name
      }
    }
    pageInfo {
      ...PageProps
    }
    totalElements
  }
}
    ${MetaPropsFragmentDoc}
    ${TranslationPropsFragmentDoc}
    ${PagePropsFragmentDoc}`;
/**
 * __useFindDictionariesQuery__
 * 
 * To run a query within a React component, call `useFindDictionariesQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindDictionariesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindDictionariesQuery({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
  */
export function useFindDictionariesQuery(baseOptions: Apollo.QueryHookOptions<FindDictionariesQuery, FindDictionariesQueryVariables>) {
  return Apollo.useQuery<FindDictionariesQuery, FindDictionariesQueryVariables>(FindDictionariesQueryDocument, baseOptions);
}
export function useFindDictionariesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindDictionariesQuery, FindDictionariesQueryVariables>) {
  return Apollo.useLazyQuery<FindDictionariesQuery, FindDictionariesQueryVariables>(FindDictionariesQueryDocument, baseOptions);
}
export type FindDictionariesQueryHookResult = ReturnType<typeof useFindDictionariesQuery>;
export type FindDictionariesLazyQueryHookResult = ReturnType<typeof useFindDictionariesLazyQuery>;
export type FindDictionariesQueryResult = Apollo.QueryResult<FindDictionariesQuery, FindDictionariesQueryVariables>;
export const FindSubdivisionsQueryDocument = gql`
    query FindSubdivisionsQuery($input: FilterInput!) {
  findSubdivisions(input: $input) {
    nodes {
      code
      ...ConceptProps
    }
    totalElements
  }
}
    ${ConceptPropsFragmentDoc}`;
/**
 * __useFindSubdivisionsQuery__
 * 
 * To run a query within a React component, call `useFindSubdivisionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindSubdivisionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindSubdivisionsQuery({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
  */
export function useFindSubdivisionsQuery(baseOptions: Apollo.QueryHookOptions<FindSubdivisionsQuery, FindSubdivisionsQueryVariables>) {
  return Apollo.useQuery<FindSubdivisionsQuery, FindSubdivisionsQueryVariables>(FindSubdivisionsQueryDocument, baseOptions);
}
export function useFindSubdivisionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindSubdivisionsQuery, FindSubdivisionsQueryVariables>) {
  return Apollo.useLazyQuery<FindSubdivisionsQuery, FindSubdivisionsQueryVariables>(FindSubdivisionsQueryDocument, baseOptions);
}
export type FindSubdivisionsQueryHookResult = ReturnType<typeof useFindSubdivisionsQuery>;
export type FindSubdivisionsLazyQueryHookResult = ReturnType<typeof useFindSubdivisionsLazyQuery>;
export type FindSubdivisionsQueryResult = Apollo.QueryResult<FindSubdivisionsQuery, FindSubdivisionsQueryVariables>;
export const FindCountriesQueryDocument = gql`
    query FindCountriesQuery($input: FilterInput!) {
  findCountries(input: $input) {
    nodes {
      code
      ...RelationsProps
    }
    totalElements
  }
}
    ${RelationsPropsFragmentDoc}`;
/**
 * __useFindCountriesQuery__
 * 
 * To run a query within a React component, call `useFindCountriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindCountriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindCountriesQuery({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
  */
export function useFindCountriesQuery(baseOptions: Apollo.QueryHookOptions<FindCountriesQuery, FindCountriesQueryVariables>) {
  return Apollo.useQuery<FindCountriesQuery, FindCountriesQueryVariables>(FindCountriesQueryDocument, baseOptions);
}
export function useFindCountriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindCountriesQuery, FindCountriesQueryVariables>) {
  return Apollo.useLazyQuery<FindCountriesQuery, FindCountriesQueryVariables>(FindCountriesQueryDocument, baseOptions);
}
export type FindCountriesQueryHookResult = ReturnType<typeof useFindCountriesQuery>;
export type FindCountriesLazyQueryHookResult = ReturnType<typeof useFindCountriesLazyQuery>;
export type FindCountriesQueryResult = Apollo.QueryResult<FindCountriesQuery, FindCountriesQueryVariables>;
export const FindQuantityKindsQueryDocument = gql`
    query FindQuantityKindsQuery($input: FilterInput!) {
  findQuantityKinds(input: $input) {
    nodes {
      ...QuantityKindProps
    }
    totalElements
  }
}
    ${QuantityKindPropsFragmentDoc}`;
/**
 * __useFindQuantityKindsQuery__
 * 
 * To run a query within a React component, call `useFindQuantityKindsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindQuantityKindsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindQuantityKindsQuery({
 *  variables: {
 *    input: // value for 'input'
 *  },
 * });
  */
export function useFindQuantityKindsQuery(baseOptions: Apollo.QueryHookOptions<FindQuantityKindsQuery, FindQuantityKindsQueryVariables>) {
  return Apollo.useQuery<FindQuantityKindsQuery, FindQuantityKindsQueryVariables>(FindQuantityKindsQueryDocument, baseOptions);
}
export function useFindQuantityKindsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindQuantityKindsQuery, FindQuantityKindsQueryVariables>) {
  return Apollo.useLazyQuery<FindQuantityKindsQuery, FindQuantityKindsQueryVariables>(FindQuantityKindsQueryDocument, baseOptions);
}
export type FindQuantityKindsQueryHookResult = ReturnType<typeof useFindQuantityKindsQuery>;
export type FindQuantityKindsLazyQueryHookResult = ReturnType<typeof useFindQuantityKindsLazyQuery>;
export type FindQuantityKindsQueryResult = Apollo.QueryResult<FindQuantityKindsQuery, FindQuantityKindsQueryVariables>;
export const FindConceptsQueryDocument = gql`
    query FindConceptsQuery($input: FilterInput!) {
  findConcepts(input: $input) {
    nodes {
      ...ConceptDetailProps
    }
    totalElements
  }
}
    ${ConceptDetailPropsFragmentDoc}`;
/**
 * __useFindConceptsQuery__
 * 
 * To run a query within a React component, call `useFindConceptsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindConceptsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindConceptsQuery({
 *  variables: {
 *   input: // value for 'input'
 *  },
 * });
  */
export function useFindConceptsQuery(baseOptions: Apollo.QueryHookOptions<FindConceptsQuery, FindConceptsQueryVariables>) {
  return Apollo.useQuery<FindConceptsQuery, FindConceptsQueryVariables>(FindConceptsQueryDocument, baseOptions);
}
export function useFindConceptsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindConceptsQuery, FindConceptsQueryVariables>) {
  return Apollo.useLazyQuery<FindConceptsQuery, FindConceptsQueryVariables>(FindConceptsQueryDocument, baseOptions);
}
export type FindConceptsQueryHookResult = ReturnType<typeof useFindConceptsQuery>;
export type FindConceptsLazyQueryHookResult = ReturnType<typeof useFindConceptsLazyQuery>;
export type FindConceptsQueryResult = Apollo.QueryResult<FindConceptsQuery, FindConceptsQueryVariables>;
export const FindObjectsQueryDocument = gql`
    query FindObjectsQuery($input: FilterInput!) {
  findObjects(input: $input) {
    nodes {
      ...ObjectDetailProps
    }
    totalElements
  }
}
    ${ObjectDetailPropsFragmentDoc}`;
/**
 * __useFindObjectsQuery__
 * 
 * To run a query within a React component, call `useFindObjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindObjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useFindObjectsQuery({
 *  variables: {
 *   input: // value for 'input'
 *  },
 * });
  */
export function useFindObjectsQuery(baseOptions: Apollo.QueryHookOptions<FindObjectsQuery, FindObjectsQueryVariables>) {
  return Apollo.useQuery<FindObjectsQuery, FindObjectsQueryVariables>(FindObjectsQueryDocument, baseOptions);
}
export function useFindObjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindObjectsQuery, FindObjectsQueryVariables>) {
  return Apollo.useLazyQuery<FindObjectsQuery, FindObjectsQueryVariables>(FindObjectsQueryDocument, baseOptions);
}
export type FindObjectsQueryHookResult = ReturnType<typeof useFindObjectsQuery>;
export type FindObjectsLazyQueryHookResult = ReturnType<typeof useFindObjectsLazyQuery>;
export type FindObjectsQueryResult = Apollo.QueryResult<FindObjectsQuery, FindObjectsQueryVariables>;
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
export const GetSubjectEntryDocument = gql`
    query GetSubjectEntry($id: ID!) {
  node: getSubject(id: $id) {
    ...SubjectDetailProps
  }
}
    ${SubjectDetailPropsFragmentDoc}`;

/**
 * __useGetSubjectEntryQuery__
 *
 * To run a query within a React component, call `useGetSubjectEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSubjectEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSubjectEntryQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetSubjectEntryQuery(baseOptions: Apollo.QueryHookOptions<GetSubjectEntryQuery, GetSubjectEntryQueryVariables>) {
  return Apollo.useQuery<GetSubjectEntryQuery, GetSubjectEntryQueryVariables>(GetSubjectEntryDocument, baseOptions);
}
export function useGetSubjectEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSubjectEntryQuery, GetSubjectEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetSubjectEntryQuery, GetSubjectEntryQueryVariables>(GetSubjectEntryDocument, baseOptions);
}
export type GetSubjectEntryQueryHookResult = ReturnType<typeof useGetSubjectEntryQuery>;
export type GetSubjectEntryLazyQueryHookResult = ReturnType<typeof useGetSubjectEntryLazyQuery>;
export type GetSubjectEntryQueryResult = Apollo.QueryResult<GetSubjectEntryQuery, GetSubjectEntryQueryVariables>;
export const GetPropertyEntryDocument = gql`
    query GetPropertyEntry($id: ID!) {
  node: getProperty(id: $id) {
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
export const GetValueListEntryDocument = gql`
    query GetValueListEntry($id: ID!) {
  node: getValueList(id: $id) {
    ...ValueListDetailProps
  }
}
    ${ValueListDetailPropsFragmentDoc}`;

/**
 * __useGetValueListEntryQuery__
 *
 * To run a query within a React component, call `useGetValueListEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetValueListEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetValueListEntryQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetValueListEntryQuery(baseOptions: Apollo.QueryHookOptions<GetValueListEntryQuery, GetValueListEntryQueryVariables>) {
  return Apollo.useQuery<GetValueListEntryQuery, GetValueListEntryQueryVariables>(GetValueListEntryDocument, baseOptions);
}
export function useGetValueListEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetValueListEntryQuery, GetValueListEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetValueListEntryQuery, GetValueListEntryQueryVariables>(GetValueListEntryDocument, baseOptions);
}
export type GetValueListEntryQueryHookResult = ReturnType<typeof useGetValueListEntryQuery>;
export type GetValueListEntryLazyQueryHookResult = ReturnType<typeof useGetValueListEntryLazyQuery>;
export type GetValueListEntryQueryResult = Apollo.QueryResult<GetValueListEntryQuery, GetValueListEntryQueryVariables>;
export const GetUnitEntryDocument = gql`
    query GetUnitEntry($id: ID!) {
  node: getUnit(id: $id) {
    ...UnitDetailProps
  }
}
    ${UnitDetailPropsFragmentDoc}`;

/**
 * __useGetUnitEntryQuery__
 *
 * To run a query within a React component, call `useGetUnitEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUnitEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUnitEntryQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUnitEntryQuery(baseOptions: Apollo.QueryHookOptions<GetUnitEntryQuery, GetUnitEntryQueryVariables>) {
  return Apollo.useQuery<GetUnitEntryQuery, GetUnitEntryQueryVariables>(GetUnitEntryDocument, baseOptions);
}
export function useGetUnitEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUnitEntryQuery, GetUnitEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetUnitEntryQuery, GetUnitEntryQueryVariables>(GetUnitEntryDocument, baseOptions);
}
export type GetUnitEntryQueryHookResult = ReturnType<typeof useGetUnitEntryQuery>;
export type GetUnitEntryLazyQueryHookResult = ReturnType<typeof useGetUnitEntryLazyQuery>;
export type GetUnitEntryQueryResult = Apollo.QueryResult<GetUnitEntryQuery, GetUnitEntryQueryVariables>;
export const GetValueEntryDocument = gql`
    query GetValueEntry($id: ID!) {
  node: getValue(id: $id) {
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
export const GetTagEntryDocument = gql`
    query GetTagEntry($id: ID!) {
  node: getTag(id: $id) {
    ...TagProps
  }
}
    ${TagPropsFragmentDoc}`;
/**
 * __useGetTagQueryQuery__
 * 
 * To run a query within a React component, call `useGetTagQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTagQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useGetTagQueryQuery({
 *  variables: {
 *   id: // value for 'id'
 *  },
 * });
  */
export function useGetTagQuery(baseOptions: Apollo.QueryHookOptions<GetTagEntryQuery, GetTagEntryQueryVariables>) {
  return Apollo.useQuery<GetTagEntryQuery, GetTagEntryQueryVariables>(GetTagEntryDocument, baseOptions);
}
export function useGetTagLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTagEntryQuery, GetTagEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetTagEntryQuery, GetTagEntryQueryVariables>(GetTagEntryDocument, baseOptions);
}
export type GetTagQueryHookResult = ReturnType<typeof useGetTagQuery>;
export type GetTagLazyQueryHookResult = ReturnType<typeof useGetTagLazyQuery>;
export type GetTagQueryResult = Apollo.QueryResult<GetTagEntryQuery, GetTagEntryQueryVariables>;
export const GetOrderedValueEntryDocument = gql`
    query GetOrderedValueEntry($id: ID!) {
  node: getOrderedValue(id: $id) {
    order 
    orderedValue {
      ...ValueProps
    }
    valueLists {
      ...RelationsProps
    }
  }
}
    ${ValuePropsFragmentDoc}
    ${RelationsPropsFragmentDoc}`;
/**
 * __useGetOrderedValueEntryQuery__
 * 
 * To run a query within a React component, call `useGetOrderedValueEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrderedValueEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useGetOrderedValueEntryQuery({
 *  variables: {
 *   id: // value for 'id'
 *  },
 * });
  */
export function useGetOrderedValueEntryQuery(baseOptions: Apollo.QueryHookOptions<GetOrderedValueEntryQuery, GetOrderedValueEntryQueryVariables>) {
  return Apollo.useQuery<GetOrderedValueEntryQuery, GetOrderedValueEntryQueryVariables>(GetOrderedValueEntryDocument, baseOptions);
}
export function useGetOrderedValueEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrderedValueEntryQuery, GetOrderedValueEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetOrderedValueEntryQuery, GetOrderedValueEntryQueryVariables>(GetOrderedValueEntryDocument, baseOptions);
}
export type GetOrderedValueEntryQueryHookResult = ReturnType<typeof useGetOrderedValueEntryQuery>;
export type GetOrderedValueEntryLazyQueryHookResult = ReturnType<typeof useGetOrderedValueEntryLazyQuery>;
export type GetOrderedValueEntryQueryResult = Apollo.QueryResult<GetOrderedValueEntryQuery, GetOrderedValueEntryQueryVariables>;
export const GetRelationshipToSubjectEntryDocument = gql`
    query GetRelationshipToSubjectEntry($id: ID!) {
  node: getRelationshipToSubject(id: $id) {
    ...RelationshipToSubjectDetailProps
  }
}
    ${RelationshipToSubjectDetailPropsFragmentDoc}`;
/**
 * __useGetRelationshipToSubjectEntryQuery__
 * 
 * To run a query within a React component, call `useGetRelationshipToSubjectEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRelationshipToSubjectEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useGetRelationshipToSubjectEntryQuery({
 *  variables: {
 *   id: // value for 'id'
 *  },
 * });
  */
export function useGetRelationshipToSubjectEntryQuery(baseOptions: Apollo.QueryHookOptions<GetRelationshipToSubjectEntryQuery, GetRelationshipToSubjectEntryQueryVariables>) {
  return Apollo.useQuery<GetRelationshipToSubjectEntryQuery, GetRelationshipToSubjectEntryQueryVariables>(GetRelationshipToSubjectEntryDocument, baseOptions);
}
export function useGetRelationshipToSubjectEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRelationshipToSubjectEntryQuery, GetRelationshipToSubjectEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetRelationshipToSubjectEntryQuery, GetRelationshipToSubjectEntryQueryVariables>(GetRelationshipToSubjectEntryDocument, baseOptions);
}
export type GetRelationshipToSubjectEntryQueryHookResult = ReturnType<typeof useGetRelationshipToSubjectEntryQuery>;
export type GetRelationshipToSubjectEntryLazyQueryHookResult = ReturnType<typeof useGetRelationshipToSubjectEntryLazyQuery>;
export type GetRelationshipToSubjectEntryQueryResult = Apollo.QueryResult<GetRelationshipToSubjectEntryQuery, GetRelationshipToSubjectEntryQueryVariables>;
export const GetRelationshipToPropertyEntryDocument = gql`
    query GetRelationshipToPropertyEntry($id: ID!) {
  node: getRelationshipToProperty(id: $id) {
    ...RelationshipToPropertyDetailProps
  }
}
    ${RelationshipToPropertyDetailPropsFragmentDoc}`;
/**
 * __useGetRelationshipToPropertyEntryQuery__
 * 
 * To run a query within a React component, call `useGetRelationshipToPropertyEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRelationshipToPropertyEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useGetRelationshipToPropertyEntryQuery({
 *  variables: {
 *   id: // value for 'id'
 *  },
 * });
  */
export function useGetRelationshipToPropertyEntryQuery(baseOptions: Apollo.QueryHookOptions<GetRelationshipToPropertyEntryQuery, GetRelationshipToPropertyEntryQueryVariables>) {
  return Apollo.useQuery<GetRelationshipToPropertyEntryQuery, GetRelationshipToPropertyEntryQueryVariables>(GetRelationshipToPropertyEntryDocument, baseOptions);
}
export function useGetRelationshipToPropertyEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRelationshipToPropertyEntryQuery, GetRelationshipToPropertyEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetRelationshipToPropertyEntryQuery, GetRelationshipToPropertyEntryQueryVariables>(GetRelationshipToPropertyEntryDocument, baseOptions);
}
export type GetRelationshipToPropertyEntryQueryHookResult = ReturnType<typeof useGetRelationshipToPropertyEntryQuery>;
export type GetRelationshipToPropertyEntryLazyQueryHookResult = ReturnType<typeof useGetRelationshipToPropertyEntryLazyQuery>;
export type GetRelationshipToPropertyEntryQueryResult = Apollo.QueryResult<GetRelationshipToPropertyEntryQuery, GetRelationshipToPropertyEntryQueryVariables>;
export const GetLanguageEntryDocument = gql`
    query GetLanguageEntry($id: ID!) {
  node: getLanguage(id: $id) {
    ...LanguageProps
  }
}
    ${LanguagePropsFragmentDoc}`;
/**
 * __useGetLanguageEntryQuery__
 * 
 * To run a query within a React component, call `useGetLanguageEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLanguageEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useGetLanguageEntryQuery({
 *  variables: {
 *   id: // value for 'id'
 *  },
 * });
  */
export function useGetLanguageEntryQuery(baseOptions: Apollo.QueryHookOptions<GetLanguageEntryQuery, GetLanguageEntryQueryVariables>) {
  return Apollo.useQuery<GetLanguageEntryQuery, GetLanguageEntryQueryVariables>(GetLanguageEntryDocument, baseOptions);
}
export function useGetLanguageEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLanguageEntryQuery, GetLanguageEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetLanguageEntryQuery, GetLanguageEntryQueryVariables>(GetLanguageEntryDocument, baseOptions);
}
export type GetLanguageEntryQueryHookResult = ReturnType<typeof useGetLanguageEntryQuery>;
export type GetLanguageEntryLazyQueryHookResult = ReturnType<typeof useGetLanguageEntryLazyQuery>;
export type GetLanguageEntryQueryResult = Apollo.QueryResult<GetLanguageEntryQuery, GetLanguageEntryQueryVariables>;
export const GetLanguageByCodeEntryDocument = gql`
    query GetLanguageByCodeEntry($code: String!) {
  node: getLanguageByCode(code: $code) {
    ...LanguageProps
  }
}
    ${LanguagePropsFragmentDoc}`;
/**
 * __useGetLanguageByCodeEntryQuery__
 * 
 * To run a query within a React component, call `useGetLanguageByCodeEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLanguageByCodeEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useGetLanguageByCodeEntryQuery({
 *  variables: {
 *   code: // value for 'code'
 *  },
 * });
  */
export function useGetLanguageByCodeEntryQuery(baseOptions: Apollo.QueryHookOptions<GetLanguageByCodeEntryQuery, GetLanguageByCodeEntryQueryVariables>) {
  return Apollo.useQuery<GetLanguageByCodeEntryQuery, GetLanguageByCodeEntryQueryVariables>(GetLanguageByCodeEntryDocument, baseOptions);
}
export function useGetLanguageByCodeEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLanguageByCodeEntryQuery, GetLanguageByCodeEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetLanguageByCodeEntryQuery, GetLanguageByCodeEntryQueryVariables>(GetLanguageByCodeEntryDocument, baseOptions);
}
export type GetLanguageByCodeEntryQueryHookResult = ReturnType<typeof useGetLanguageByCodeEntryQuery>;
export type GetLanguageByCodeEntryLazyQueryHookResult = ReturnType<typeof useGetLanguageByCodeEntryLazyQuery>;
export type GetLanguageByCodeEntryQueryResult = Apollo.QueryResult<GetLanguageByCodeEntryQuery, GetLanguageByCodeEntryQueryVariables>;
export const GetDimensionEntryDocument = gql`
    query GetDimensionEntry($id: ID!) {
  node: getDimension(id: $id) {
    ...DimensionProps
  }
}
    ${DimensionPropsFragmentDoc}`;
/**
 * __useGetDimensionEntryQuery__
 * 
 * To run a query within a React component, call `useGetDimensionEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDimensionEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useGetDimensionEntryQuery({
 *  variables: {
 *   id: // value for 'id'
 *  },
 * });
  */
export function useGetDimensionEntryQuery(baseOptions: Apollo.QueryHookOptions<GetDimensionEntryQuery, GetDimensionEntryQueryVariables>) {
  return Apollo.useQuery<GetDimensionEntryQuery, GetDimensionEntryQueryVariables>(GetDimensionEntryDocument, baseOptions);
}
export function useGetDimensionEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDimensionEntryQuery, GetDimensionEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetDimensionEntryQuery, GetDimensionEntryQueryVariables>(GetDimensionEntryDocument, baseOptions);
}
export type GetDimensionEntryQueryHookResult = ReturnType<typeof useGetDimensionEntryQuery>;
export type GetDimensionEntryLazyQueryHookResult = ReturnType<typeof useGetDimensionEntryLazyQuery>;
export type GetDimensionEntryQueryResult = Apollo.QueryResult<GetDimensionEntryQuery, GetDimensionEntryQueryVariables>;
export const GetRationalEntryDocument = gql`
    query GetRationalEntry($id: ID!) {
  node: getRational(id: $id) {
    ...RationalProps
  }
}
    ${RationalPropsFragmentDoc}`;
/**
 * __useGetRationalEntryQuery__
 * 
 * To run a query within a React component, call `useGetRationalEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRationalEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useGetRationalEntryQuery({
 *  variables: {
 *   id: // value for 'id'
 *  },
 * });
  */
export function useGetRationalEntryQuery(baseOptions: Apollo.QueryHookOptions<GetRationalEntryQuery, GetRationalEntryQueryVariables>) {
  return Apollo.useQuery<GetRationalEntryQuery, GetRationalEntryQueryVariables>(GetRationalEntryDocument, baseOptions);
}
export function useGetRationalEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRationalEntryQuery, GetRationalEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetRationalEntryQuery, GetRationalEntryQueryVariables>(GetRationalEntryDocument, baseOptions);
}
export type GetRationalEntryQueryHookResult = ReturnType<typeof useGetRationalEntryQuery>;
export type GetRationalEntryLazyQueryHookResult = ReturnType<typeof useGetRationalEntryLazyQuery>;
export type GetRationalEntryQueryResult = Apollo.QueryResult<GetRationalEntryQuery, GetRationalEntryQueryVariables>;
export const GetMultiLanguageTextEntryDocument = gql`
    query GetMultiLanguageTextEntry($id: ID!) {
  node: getMultiLanguageText(id: $id) {
    ...TranslationProps
  }
}
    ${TranslationPropsFragmentDoc}`;
/**
 * __useGetMultiLanguageTextEntryQuery__
 * 
 * To run a query within a React component, call `useGetMultiLanguageTextEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMultiLanguageTextEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useGetMultiLanguageTextEntryQuery({
 *  variables: {
 *   id: // value for 'id'
 *  },
 * });
  */
export function useGetMultiLanguageTextEntryQuery(baseOptions: Apollo.QueryHookOptions<GetMultiLanguageTextEntryQuery, GetMultiLanguageTextEntryQueryVariables>) {
  return Apollo.useQuery<GetMultiLanguageTextEntryQuery, GetMultiLanguageTextEntryQueryVariables>(GetMultiLanguageTextEntryDocument, baseOptions);
}
export function useGetMultiLanguageTextEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMultiLanguageTextEntryQuery, GetMultiLanguageTextEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetMultiLanguageTextEntryQuery, GetMultiLanguageTextEntryQueryVariables>(GetMultiLanguageTextEntryDocument, baseOptions);
}
export type GetMultiLanguageTextEntryQueryHookResult = ReturnType<typeof useGetMultiLanguageTextEntryQuery>;
export type GetMultiLanguageTextEntryLazyQueryHookResult = ReturnType<typeof useGetMultiLanguageTextEntryLazyQuery>;
export type GetMultiLanguageTextEntryQueryResult = Apollo.QueryResult<GetMultiLanguageTextEntryQuery, GetMultiLanguageTextEntryQueryVariables>;
export const GetTextEntryDocument = gql`
    query GetTextEntry($id: ID!) {
  node: getText(id: $id) {
    text
    language {
      ...LanguageProps
    }
  }
}
    ${LanguagePropsFragmentDoc}`;
/**
 * __useGetTextEntryQuery__
 * 
 * To run a query within a React component, call `useGetTextEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTextEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useGetTextEntryQuery({
 *  variables: {
 *   id: // value for 'id'
 *  },
 * });
  */
export function useGetTextEntryQuery(baseOptions: Apollo.QueryHookOptions<GetTextEntryQuery, GetTextEntryQueryVariables>) {
  return Apollo.useQuery<GetTextEntryQuery, GetTextEntryQueryVariables>(GetTextEntryDocument, baseOptions);
}
export function useGetTextEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTextEntryQuery, GetTextEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetTextEntryQuery, GetTextEntryQueryVariables>(GetTextEntryDocument, baseOptions);
}
export type GetTextEntryQueryHookResult = ReturnType<typeof useGetTextEntryQuery>;
export type GetTextEntryLazyQueryHookResult = ReturnType<typeof useGetTextEntryLazyQuery>;
export type GetTextEntryQueryResult = Apollo.QueryResult<GetTextEntryQuery, GetTextEntryQueryVariables>;
export const GetSymbolEntryDocument = gql`
    query GetSymbolEntry($id: ID!) {
  node: getSymbol(id: $id) {
    ...SymbolProps
  }
}
    ${SymbolPropsFragmentDoc}`;
/**
 * __useGetSymbolEntryQuery__
 * 
 * To run a query within a React component, call `useGetSymbolEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSymbolEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useGetSymbolEntryQuery({
 *  variables: {
 *   id: // value for 'id'
 *  },
 * });
  */
export function useGetSymbolEntryQuery(baseOptions: Apollo.QueryHookOptions<GetSymbolEntryQuery, GetSymbolEntryQueryVariables>) {
  return Apollo.useQuery<GetSymbolEntryQuery, GetSymbolEntryQueryVariables>(GetSymbolEntryDocument, baseOptions);
}
export function useGetSymbolEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSymbolEntryQuery, GetSymbolEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetSymbolEntryQuery, GetSymbolEntryQueryVariables>(GetSymbolEntryDocument, baseOptions);
}
export type GetSymbolEntryQueryHookResult = ReturnType<typeof useGetSymbolEntryQuery>;
export type GetSymbolEntryLazyQueryHookResult = ReturnType<typeof useGetSymbolEntryLazyQuery>;
export type GetSymbolEntryQueryResult = Apollo.QueryResult<GetSymbolEntryQuery, GetSymbolEntryQueryVariables>;
export const GetIntervalEntryDocument = gql`
    query GetIntervalEntry($id: ID!) {
  node: getInterval(id: $id) {
    ...IntervalProps
  }
}
    ${IntervalPropsFragmentDoc}`;
/**
 * __useGetIntervalEntryQuery__
 * 
 * To run a query within a React component, call `useGetIntervalEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetIntervalEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useGetIntervalEntryQuery({
 *  variables: {
 *   id: // value for 'id'
 *  },
 * });
  */
export function useGetIntervalEntryQuery(baseOptions: Apollo.QueryHookOptions<GetIntervalEntryQuery, GetIntervalEntryQueryVariables>) {
  return Apollo.useQuery<GetIntervalEntryQuery, GetIntervalEntryQueryVariables>(GetIntervalEntryDocument, baseOptions);
}
export function useGetIntervalEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetIntervalEntryQuery, GetIntervalEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetIntervalEntryQuery, GetIntervalEntryQueryVariables>(GetIntervalEntryDocument, baseOptions);
}
export type GetIntervalEntryQueryHookResult = ReturnType<typeof useGetIntervalEntryQuery>;
export type GetIntervalEntryLazyQueryHookResult = ReturnType<typeof useGetIntervalEntryLazyQuery>;
export type GetIntervalEntryQueryResult = Apollo.QueryResult<GetIntervalEntryQuery, GetIntervalEntryQueryVariables>;
export const GetDictionaryEntryDocument = gql`
    query GetDictionaryEntry($id: ID!) {
  node: getDictionary(id: $id) {
    ...MetaProps
    id
    name {
      ...TranslationProps
    }
    tags {
      id
      name
    }
    concepts {
      ...RelationsProps
    }
  }
}
    ${MetaPropsFragmentDoc}
    ${TranslationPropsFragmentDoc}
    ${RelationsPropsFragmentDoc}`;
/**
 * __useGetDictionaryEntryQuery__
 * 
 * To run a query within a React component, call `useGetDictionaryEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDictionaryEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useGetDictionaryEntryQuery({
 *  variables: {
 *   id: // value for 'id'
 *  },
 * });
  */
export function useGetDictionaryEntryQuery(baseOptions: Apollo.QueryHookOptions<GetDictionaryEntryQuery, GetDictionaryEntryQueryVariables>) {
  return Apollo.useQuery<GetDictionaryEntryQuery, GetDictionaryEntryQueryVariables>(GetDictionaryEntryDocument, baseOptions);
}
export function useGetDictionaryEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDictionaryEntryQuery, GetDictionaryEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetDictionaryEntryQuery, GetDictionaryEntryQueryVariables>(GetDictionaryEntryDocument, baseOptions);
}
export type GetDictionaryEntryQueryHookResult = ReturnType<typeof useGetDictionaryEntryQuery>;
export type GetDictionaryEntryLazyQueryHookResult = ReturnType<typeof useGetDictionaryEntryLazyQuery>;
export type GetDictionaryEntryQueryResult = Apollo.QueryResult<GetDictionaryEntryQuery, GetDictionaryEntryQueryVariables>;
export const GetSubdivisionEntryDocument = gql`
    query GetSubdivisionEntry($id: ID!) {
  node: getSubdivision(id: $id) {
    code
    ...ConceptDetailProps
  }
}
    ${ConceptDetailPropsFragmentDoc}`;
/**
 * __useGetSubdivisionEntryQuery__
 * 
 * To run a query within a React component, call `useGetSubdivisionEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSubdivisionEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useGetSubdivisionEntryQuery({
 *  variables: {
 *   id: // value for 'id'
 *  },
 * });
  */
export function useGetSubdivisionEntryQuery(baseOptions: Apollo.QueryHookOptions<GetSubdivisionEntryQuery, GetSubdivisionEntryQueryVariables>) {
  return Apollo.useQuery<GetSubdivisionEntryQuery, GetSubdivisionEntryQueryVariables>(GetSubdivisionEntryDocument, baseOptions);
}
export function useGetSubdivisionEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSubdivisionEntryQuery, GetSubdivisionEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetSubdivisionEntryQuery, GetSubdivisionEntryQueryVariables>(GetSubdivisionEntryDocument, baseOptions);
}
export type GetSubdivisionEntryQueryHookResult = ReturnType<typeof useGetSubdivisionEntryQuery>;
export type GetSubdivisionEntryLazyQueryHookResult = ReturnType<typeof useGetSubdivisionEntryLazyQuery>;
export type GetSubdivisionEntryQueryResult = Apollo.QueryResult<GetSubdivisionEntryQuery, GetSubdivisionEntryQueryVariables>;
export const GetCountryEntryDocument = gql`
    query GetCountryEntry($id: ID!) {
  node: getCountry(id: $id) {
    code
    ...RelationsProps
  }
}
    ${RelationsPropsFragmentDoc}`;
/**
 * __useGetCountryEntryQuery__
 * 
 * To run a query within a React component, call `useGetCountryEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCountryEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useGetCountryEntryQuery({
 *  variables: {
 *   id: // value for 'id'
 *  },
 * });
  */
export function useGetCountryEntryQuery(baseOptions: Apollo.QueryHookOptions<GetCountryEntryQuery, GetCountryEntryQueryVariables>) {
  return Apollo.useQuery<GetCountryEntryQuery, GetCountryEntryQueryVariables>(GetCountryEntryDocument, baseOptions);
}
export function useGetCountryEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCountryEntryQuery, GetCountryEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetCountryEntryQuery, GetCountryEntryQueryVariables>(GetCountryEntryDocument, baseOptions);
}
export type GetCountryEntryQueryHookResult = ReturnType<typeof useGetCountryEntryQuery>;
export type GetCountryEntryLazyQueryHookResult = ReturnType<typeof useGetCountryEntryLazyQuery>;
export type GetCountryEntryQueryResult = Apollo.QueryResult<GetCountryEntryQuery, GetCountryEntryQueryVariables>;
export const GetQuantityKindEntryDocument = gql`
    query GetQuantityKindEntry($id: ID!) {
  node: getQuantityKind(id: $id) {
    ...QuantityKindProps
  }
}
    ${QuantityKindPropsFragmentDoc}`;
/**
 * __useGetQuantityKindEntryQuery__
 * 
 * To run a query within a React component, call `useGetQuantityKindEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetQuantityKindEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useGetQuantityKindEntryQuery({
 *  variables: {
 *   id: // value for 'id'
 *  },
 * });
  */
export function useGetQuantityKindEntryQuery(baseOptions: Apollo.QueryHookOptions<GetQuantityKindEntryQuery, GetQuantityKindEntryQueryVariables>) {
  return Apollo.useQuery<GetQuantityKindEntryQuery, GetQuantityKindEntryQueryVariables>(GetQuantityKindEntryDocument, baseOptions);
}
export function useGetQuantityKindEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetQuantityKindEntryQuery, GetQuantityKindEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetQuantityKindEntryQuery, GetQuantityKindEntryQueryVariables>(GetQuantityKindEntryDocument, baseOptions);
}
export type GetQuantityKindEntryQueryHookResult = ReturnType<typeof useGetQuantityKindEntryQuery>;
export type GetQuantityKindEntryLazyQueryHookResult = ReturnType<typeof useGetQuantityKindEntryLazyQuery>;
export type GetQuantityKindEntryQueryResult = Apollo.QueryResult<GetQuantityKindEntryQuery, GetQuantityKindEntryQueryVariables>;
export const GetConceptEntryDocument = gql`
    query GetConceptEntry($id: ID!) {
  node: getConcept(id: $id) {
    ...ConceptProps
  }
}
    ${ConceptPropsFragmentDoc}`;
/**
 * __useGetConceptEntryQuery__
 * 
 * To run a query within a React component, call `useGetConceptEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetConceptEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 * 
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 * 
 * @example
 * const { data, loading, error } = useGetConceptEntryQuery({
 *  variables: {
 *   id: // value for 'id'
 *  },
 * });
  */
export function useGetConceptEntryQuery(baseOptions: Apollo.QueryHookOptions<GetConceptEntryQuery, GetConceptEntryQueryVariables>) {
  return Apollo.useQuery<GetConceptEntryQuery, GetConceptEntryQueryVariables>(GetConceptEntryDocument, baseOptions);
}
export function useGetConceptEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetConceptEntryQuery, GetConceptEntryQueryVariables>) {
  return Apollo.useLazyQuery<GetConceptEntryQuery, GetConceptEntryQueryVariables>(GetConceptEntryDocument, baseOptions);
}
export type GetConceptEntryQueryHookResult = ReturnType<typeof useGetConceptEntryQuery>;
export type GetConceptEntryLazyQueryHookResult = ReturnType<typeof useGetConceptEntryLazyQuery>;
export type GetConceptEntryQueryResult = Apollo.QueryResult<GetConceptEntryQuery, GetConceptEntryQueryVariables>;

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

//__useExportCatalogRecordsQuery__
export const GetExportCatalogRecords = gql`
query findExportCatalogRecords {
  findExportCatalogRecords {
	  nodes {
      id
      type
      tags
      name
      name_en
      description
      description_en
      created
      createdBy
      lastModified
      lastModifiedBy
      majorVersion
      minorVersion
      status
      languageOfCreator
      countryOfOrigin
      deprecationExplanation
      languages
      examples
      dataType
      dataFormat
      scale
      base
      uri
      author
      publisher
      isbn
      dateOfPublication
    }
  }
}`;
export function useExportCatalogRecordsQuery(baseOptions?: Apollo.QueryHookOptions<FindExportCatalogRecordsTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useQuery<FindExportCatalogRecordsTreeQuery, FindVerificationTreeQueryVariables>(GetExportCatalogRecords, baseOptions);
}
export function useExportCatalogRecordsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindExportCatalogRecordsTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useLazyQuery<FindExportCatalogRecordsTreeQuery, FindVerificationTreeQueryVariables>(GetExportCatalogRecords, baseOptions);
}
export type ExportCatalogRecordsQueryHookResult = ReturnType<typeof useExportCatalogRecordsQuery>;
export type ExportCatalogRecordsLazyQueryHookResult = ReturnType<typeof useExportCatalogRecordsLazyQuery>;
export type ExportCatalogRecordsQueryResult = Apollo.QueryResult<FindExportCatalogRecordsTreeQuery, FindVerificationTreeQueryVariables>;


//__useExportCatalogRecordsRelationshipsQuery__

export const GetExportCatalogRecordsRelationships = gql`
query findExportCatalogRecordsRelationships {
  findExportCatalogRecordsRelationships {
    nodes {
      entity1,
      relationship,
      entity2,
      __typename
    }
  }
  }`;
export function useExportCatalogRecordsRelationshipsQuery(baseOptions?: Apollo.QueryHookOptions<FindExportCatalogRecordsRelationshipsTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useQuery<FindExportCatalogRecordsRelationshipsTreeQuery, FindVerificationTreeQueryVariables>(GetExportCatalogRecordsRelationships, baseOptions);
}
export function useExportCatalogRecordsRelationshipsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindExportCatalogRecordsRelationshipsTreeQuery, FindVerificationTreeQueryVariables>) {
  return Apollo.useLazyQuery<FindExportCatalogRecordsRelationshipsTreeQuery, FindVerificationTreeQueryVariables>(GetExportCatalogRecordsRelationships, baseOptions);
}
export type ExportCatalogRecordsRelationshipsQueryHookResult = ReturnType<typeof useExportCatalogRecordsRelationshipsQuery>;
export type ExportCatalogRecordsRelationshipsLazyQueryHookResult = ReturnType<typeof useExportCatalogRecordsRelationshipsLazyQuery>;
export type ExportCatalogRecordsRelationshipsQueryResult = Apollo.QueryResult<FindExportCatalogRecordsRelationshipsTreeQuery, FindVerificationTreeQueryVariables>;
