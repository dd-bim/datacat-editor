/**
 * Central type definitions for IDS (Information Delivery Specification) system
 */

// Base IDS Types
export interface IDSInfo {
  title: string;
  version: string;
  description?: string;
  author?: string;
  copyright?: string;
  date: string;
  purpose?: string;
  milestone?: string;
}

export interface IDSSpecification {
  name: string;
  description?: string;
  instructions?: string;
  applicabilityType: "type" | "classification";
  ifcClass?: string;
  ifcClasses?: string[];
  ifcVersions?: string[];
  classification?: string;
  requirements: IDSRequirement[];
}

// Requirement Types
export type RequirementFacet = "Property" | "Attribute" | "Classification" | "Entity" | "Material";
export type RequirementCardinality = "required" | "optional" | "prohibited";

export interface IDSRequirement {
  facet: RequirementFacet;
  cardinality?: RequirementCardinality;
  propertySet?: string;
  baseNames?: string[];
  valueMap?: Record<string, string[]>;
  value?: string;
  dataType?: string;
  predefinedType?: string;
  instructions?: string;
  materials?: string[];
  materialCategory?: string;
  thermalProperties?: string;
  mechanicalProperties?: string;
  opticalProperties?: string;
}

// UI State Types
export interface RequirementUIState {
  isExpanded: boolean;
  isEditing: boolean;
  hasErrors: boolean;
  validationMessages: string[];
}

export interface SpecificationUIState {
  isExpanded: boolean;
  selectedRequirements: number[];
  filterText: string;
  showAdvanced: boolean;
}

// Form Data Types
export interface RequirementFormData {
  facet: RequirementFacet;
  cardinality: RequirementCardinality;
  propertySet: string;
  propertyName: string;
  dataType: string;
  value: string;
  instructions: string;
}

export interface MetadataFormData {
  title: string;
  version: string;
  description: string;
  author: string;
  copyright: string;
  purpose: string;
  milestone: string;
}

// Filter Types
export interface FilterState {
  searchText: string;
  selectedCategories: string[];
  selectedFacets: RequirementFacet[];
  selectedCardinalities: RequirementCardinality[];
  showOnlyErrors: boolean;
  showOnlyWarnings: boolean;
}

// Export Types
export interface ExportOptions {
  includeMetadata: boolean;
  validateBeforeExport: boolean;
  formatXml: boolean;
  includeComments: boolean;
  autoSave: boolean;
}

export interface ExportResult {
  success: boolean;
  xmlContent?: string;
  fileName?: string;
  errors: string[];
  warnings: string[];
  exportTime: Date;
}

// Validation Types
export interface ValidationError {
  type: "error" | "warning";
  message: string;
  field?: string;
  specIndex?: number;
  requirementIndex?: number;
  code?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  canExport: boolean;
}

// Auto-save Types
export interface AutoSaveState {
  enabled: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveInProgress: boolean;
  autoSaveInterval: number; // in milliseconds
}

// Progress Types
export interface ProgressState {
  isLoading: boolean;
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  percentage: number;
  estimatedTimeRemaining?: number;
}

// IFC Related Types
export interface IFCClass {
  name: string;
  description?: string;
  category: string;
  isAbstract: boolean;
  superType?: string;
  subTypes: string[];
}

export interface IFCVersion {
  version: string;
  name: string;
  releaseDate: string;
  isSupported: boolean;
}

// Classification Types
export interface ClassificationSystem {
  name: string;
  version?: string;
  source?: string;
  description?: string;
  location?: string;
}

export interface ClassificationReference {
  identification: string;
  name?: string;
  description?: string;
  location?: string;
  referencedSource?: ClassificationSystem;
}

// Property Types
export interface PropertyDefinition {
  name: string;
  description?: string;
  dataType: string;
  unitType?: string;
  propertyType: "single" | "enumerated" | "bounded" | "list" | "table";
}

export interface PropertySet {
  name: string;
  description?: string;
  applicableClasses: string[];
  properties: PropertyDefinition[];
  templateType?: string;
}

// Material Types
export interface MaterialProperties {
  name: string;
  category?: string;
  thermalProperties?: Record<string, any>;
  mechanicalProperties?: Record<string, any>;
  opticalProperties?: Record<string, any>;
  sustainability?: Record<string, any>;
}

// Application State Types
export interface IDSEditorState {
  metadata: IDSInfo;
  specifications: IDSSpecification[];
  uiState: {
    selectedSpecIndex: number;
    filterState: FilterState;
    exportOptions: ExportOptions;
    autoSaveState: AutoSaveState;
    progressState: ProgressState;
  };
  validationState: ValidationResult;
  history: {
    canUndo: boolean;
    canRedo: boolean;
    historySize: number;
  };
}

// Event Types
export interface IDSEvent {
  type: string;
  timestamp: Date;
  data?: any;
  source: "user" | "system" | "auto";
}

export interface RequirementChangeEvent extends IDSEvent {
  type: "requirement_change";
  specificationIndex: number;
  requirementIndex: number;
  field: string;
  oldValue: any;
  newValue: any;
}

export interface SpecificationChangeEvent extends IDSEvent {
  type: "specification_change";
  specificationIndex: number;
  field: string;
  oldValue: any;
  newValue: any;
}

export interface MetadataChangeEvent extends IDSEvent {
  type: "metadata_change";
  field: string;
  oldValue: any;
  newValue: any;
}

// Hook Return Types
export interface UseRequirementsManagerReturn {
  requirements: IDSRequirement[];
  addRequirement: (requirement: IDSRequirement) => void;
  updateRequirement: (index: number, requirement: Partial<IDSRequirement>) => void;
  removeRequirement: (index: number) => void;
  duplicateRequirement: (index: number) => void;
  moveRequirement: (fromIndex: number, toIndex: number) => void;
  clearRequirements: () => void;
  hasUnsavedChanges: boolean;
}

export interface UseValidationReturn {
  validationResult: ValidationResult;
  validateAll: (specs: IDSSpecification[], metadata: IDSInfo) => ValidationResult;
  validateSpecifications: (specs: IDSSpecification[]) => ValidationResult;
  validateMetadata: (metadata: IDSInfo) => ValidationResult;
  clearValidation: () => void;
  hasErrors: boolean;
  hasWarnings: boolean;
  errorCount: number;
  warningCount: number;
}

export interface UseIDSExportReturn {
  exportWithValidation: (options?: Partial<ExportOptions>) => Promise<ExportResult>;
  quickExport: () => Promise<ExportResult>;
  previewXML: () => string | null;
  isExporting: boolean;
  lastExportResult: ExportResult | null;
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
  hasUnsavedChanges: boolean;
}

export interface UseMetadataManagerReturn {
  metadata: IDSInfo;
  formData: MetadataFormData;
  updateMetadata: (field: keyof MetadataFormData, value: string) => void;
  updateAllMetadata: (data: Partial<MetadataFormData>) => void;
  resetMetadata: () => void;
  generateDefaultMetadata: () => void;
  isValid: boolean;
  hasRequiredFields: boolean;
  getMetadataForExport: () => IDSInfo;
}
