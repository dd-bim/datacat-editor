/**
 * Constants and enums for IDS (Information Delivery Specification) system
 */

import { RequirementFacet, RequirementCardinality, IFCVersion } from "../types/idsTypes";

// IDS Export specific constants
export const GROUP_TAG_ID = "5997da9b-a716-45ae-84a9-e2a7d186bcf9";
export const MODEL_TAG_ID = "6f96aaa7-e08f-49bb-ac63-93061d4c5db2";
export const PROPERTY_GROUP_TAG_NAME = "Merkmalsgruppe";
export const PROPERTY_GROUP_TAG_ID = "93b5a15d-87c8-485a-b0ad-6ad9feb72b3e";

export const DATA_TYPE_OPTIONS = [
  "IFCBOOLEAN",
  "IFCINTEGER", 
  "IFCNUMBER",
  "IFCLABEL",
  "IFCTEXT",
  "IFCDATE",
  "IFCTIME",
  "IFCDATETIME",
  "IFCIDENTIFIER",
  "IFCREAL",
  "IFCPOSITIVELENGTHMEASURE",
  "IFCLENGTHMEASURE",
  "IFCAREAMEASURE",
  "IFCVOLUMEMEASURE",
  "IFCPLANEANGLEMEASURE",
];

export const EXCLUDED_TAGS = [
  "Fachmodell", "Gruppe", "Klasse", "Merkmal", "Masseinheit", "Grösse",
  "Wert", "Maßeinheit", "Größe", "Datenvorlage", "Merkmalsgruppe", "Referenzdokument"
] as const;

// IDS Facet Types
export const IDS_FACETS: Record<RequirementFacet, { label: string; icon: string; description: string }> = {
  Property: {
    label: "Property",
    icon: "🔧",
    description: "Property requirements check PropertySets and their properties"
  },
  Attribute: {
    label: "Attribute", 
    icon: "📝",
    description: "Attribute requirements check IFC attributes of objects"
  },
  Classification: {
    label: "Classification",
    icon: "🏷️", 
    description: "Classification requirements check classification values"
  },
  Entity: {
    label: "Entity",
    icon: "🏗️",
    description: "Entity requirements check for specific entity types"
  },
  Material: {
    label: "Material",
    icon: "🧱",
    description: "Material requirements check material properties and categories"
  }
} as const;

// Cardinality Types
export const IDS_CARDINALITIES: Record<RequirementCardinality, { label: string; icon: string; description: string; color: string }> = {
  required: {
    label: "Required",
    icon: "✅",
    description: "The property MUST be present",
    color: "#4caf50"
  },
  optional: {
    label: "Optional", 
    icon: "❓",
    description: "The property CAN be present",
    color: "#ff9800"
  },
  prohibited: {
    label: "Prohibited",
    icon: "❌", 
    description: "The property MUST NOT be present",
    color: "#f44336"
  }
} as const;

// IFC Versions
export const SUPPORTED_IFC_VERSIONS: IFCVersion[] = [
  {
    version: "IFC2X3",
    name: "IFC 2x3",
    releaseDate: "2006-02-01",
    isSupported: true
  },
  {
    version: "IFC4",
    name: "IFC 4.0",
    releaseDate: "2013-03-01", 
    isSupported: true
  },
  {
    version: "IFC4X1",
    name: "IFC 4.1",
    releaseDate: "2015-09-01",
    isSupported: true
  },
  {
    version: "IFC4X2",
    name: "IFC 4.2",
    releaseDate: "2016-07-01",
    isSupported: true
  },
  {
    version: "IFC4X3",
    name: "IFC 4.3",
    releaseDate: "2021-01-01",
    isSupported: true
  }
];

// Common IFC Classes
export const COMMON_IFC_CLASSES = [
  { name: "IFCWALL", category: "Building Elements", description: "Walls" },
  { name: "IFCDOOR", category: "Building Elements", description: "Doors" },
  { name: "IFCWINDOW", category: "Building Elements", description: "Windows" },
  { name: "IFCSLAB", category: "Building Elements", description: "Slabs/Floor plates" },
  { name: "IFCBEAM", category: "Structural Elements", description: "Beams" },
  { name: "IFCCOLUMN", category: "Structural Elements", description: "Columns" },
  { name: "IFCSPACE", category: "Spatial Elements", description: "Spaces" },
  { name: "IFCBUILDING", category: "Spatial Elements", description: "Buildings" },
  { name: "IFCBUILDINGSTOREY", category: "Spatial Elements", description: "Building Storeys" },
  { name: "IFCSITE", category: "Spatial Elements", description: "Sites" },
  { name: "IFCSTAIR", category: "Building Elements", description: "Stairs" },
  { name: "IFCROOF", category: "Building Elements", description: "Roofs" },
  { name: "IFCRAILING", category: "Building Elements", description: "Railings" },
  { name: "IFCFURNISHINGELEMENT", category: "Furnishing", description: "Furnishing Elements" }
] as const;

// Common IFC Data Types
export const IFC_DATA_TYPES = [
  { type: "IFCLABEL", description: "Short text (e.g. material name)", example: "Steel" },
  { type: "IFCTEXT", description: "Longer text (e.g. description)", example: "Load bearing wall" },
  { type: "IFCBOOLEAN", description: "Yes/No values (e.g. load bearing)", example: "true" },
  { type: "IFCREAL", description: "Decimal numbers (e.g. U-value)", example: "0.24" },
  { type: "IFCINTEGER", description: "Whole numbers (e.g. count)", example: "5" },
  { type: "IFCLENGTHMEASURE", description: "Length measures", example: "2.5" },
  { type: "IFCAREAMEASURE", description: "Area measures", example: "25.5" },
  { type: "IFCVOLUMEMEASURE", description: "Volume measures", example: "125.0" },
  { type: "IFCIDENTIFIER", description: "Unique identifiers", example: "WALL_001" },
  { type: "IFCLOGICAL", description: "Logical values (TRUE/FALSE/UNKNOWN)", example: "TRUE" }
] as const;

// Common PropertySets
export const COMMON_PROPERTY_SETS = [
  { name: "Pset_WallCommon", description: "Common wall properties", applicableClasses: ["IFCWALL"] },
  { name: "Pset_DoorCommon", description: "Common door properties", applicableClasses: ["IFCDOOR"] },
  { name: "Pset_WindowCommon", description: "Common window properties", applicableClasses: ["IFCWINDOW"] },
  { name: "Pset_SlabCommon", description: "Common slab properties", applicableClasses: ["IFCSLAB"] },
  { name: "Pset_BeamCommon", description: "Common beam properties", applicableClasses: ["IFCBEAM"] },
  { name: "Pset_ColumnCommon", description: "Common column properties", applicableClasses: ["IFCCOLUMN"] },
  { name: "Pset_SpaceCommon", description: "Common space properties", applicableClasses: ["IFCSPACE"] },
  { name: "Pset_SpaceFireSafetyRequirements", description: "Fire safety requirements for spaces", applicableClasses: ["IFCSPACE"] }
] as const;

// Material Categories
export const MATERIAL_CATEGORIES = [
  "Concrete",
  "Steel", 
  "Wood",
  "Glass",
  "Stone",
  "Brick",
  "Ceramic",
  "Plastic",
  "Composite",
  "Insulation",
  "Gypsum",
  "Other"
] as const;

// Validation Rules
export const VALIDATION_RULES = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 100,
  VERSION_PATTERN: /^\d+\.\d+\.\d+$/,
  DESCRIPTION_MAX_LENGTH: 500,
  INSTRUCTION_MAX_LENGTH: 1000,
  MAX_SPECIFICATIONS: 50,
  MAX_REQUIREMENTS_PER_SPEC: 20,
  PROPERTY_NAME_MIN_LENGTH: 1,
  PROPERTY_NAME_MAX_LENGTH: 50
} as const;

// Auto-save Settings
export const AUTO_SAVE_CONFIG = {
  DEFAULT_INTERVAL: 30000, // 30 seconds
  MIN_INTERVAL: 5000,      // 5 seconds
  MAX_INTERVAL: 300000,    // 5 minutes
  DEBOUNCE_DELAY: 1000     // 1 second
} as const;

// Export Settings
export const EXPORT_CONFIG = {
  DEFAULT_FILENAME: "ids_specification.ids",
  XML_NAMESPACE: "http://standards.buildingsmart.org/IDS",
  XML_SCHEMA_LOCATION: "http://standards.buildingsmart.org/IDS/ids.xsd",
  DEFAULT_VERSION: "1.0.0",
  DATE_FORMAT: "YYYY-MM-DD"
} as const;

// UI Configuration
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  MAX_DISPLAYED_ERRORS: 10,
  MAX_DISPLAYED_WARNINGS: 5,
  NOTIFICATION_DURATION: 5000,
  PROGRESS_UPDATE_INTERVAL: 100
} as const;

// File Size Limits
export const FILE_LIMITS = {
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_SPECIFICATIONS: 100,
  MAX_REQUIREMENTS: 1000,
  MAX_EXPORT_SIZE: 50 * 1024 * 1024  // 50MB
} as const;

// Error Codes
export const ERROR_CODES = {
  VALIDATION_FAILED: "VALIDATION_FAILED",
  EXPORT_FAILED: "EXPORT_FAILED", 
  IMPORT_FAILED: "IMPORT_FAILED",
  SAVE_FAILED: "SAVE_FAILED",
  LOAD_FAILED: "LOAD_FAILED",
  NETWORK_ERROR: "NETWORK_ERROR",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FORMAT: "INVALID_FORMAT",
  PERMISSION_DENIED: "PERMISSION_DENIED"
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  EXPORT_SUCCESS: "IDS file exported successfully",
  SAVE_SUCCESS: "Data saved successfully", 
  IMPORT_SUCCESS: "IDS file imported successfully",
  VALIDATION_SUCCESS: "All validations passed",
  AUTO_SAVE_SUCCESS: "Auto-saved successfully"
} as const;

// Default Values
export const DEFAULT_VALUES = {
  METADATA: {
    VERSION: "1.0.0",
    TITLE: "New IDS Specification",
    DESCRIPTION: "Generated IDS specification for building information validation",
    PURPOSE: "Design validation",
    MILESTONE: "Planning"
  },
  REQUIREMENT: {
    CARDINALITY: "required" as RequirementCardinality,
    FACET: "Property" as RequirementFacet
  },
  SPECIFICATION: {
    NAME: "New Specification",
    APPLICABILITY_TYPE: "type" as const
  }
} as const;

// Regular Expressions
export const REGEX_PATTERNS = {
  VERSION: /^\d+\.\d+\.\d+$/,
  IDENTIFIER: /^[A-Za-z][A-Za-z0-9_]*$/,
  IFC_CLASS: /^IFC[A-Z][A-Z0-9_]*$/,
  PROPERTY_NAME: /^[A-Za-z][A-Za-z0-9_\s]*$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/[^\s]+$/
} as const;
