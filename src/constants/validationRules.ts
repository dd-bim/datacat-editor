/**
 * Validation rules and configurations for IDS system
 */

import { IDSInfo, IDSSpecification, IDSRequirement, ValidationError } from "../types/idsTypes";
import { VALIDATION_RULES, REGEX_PATTERNS, ERROR_CODES } from "./idsConstants";

// Validation Rule Types
export interface ValidationRule<T = any> {
  name: string;
  message: string;
  validate: (value: T, context?: any) => boolean;
  severity: "error" | "warning";
  code: string;
}

// Metadata Validation Rules
export const METADATA_VALIDATION_RULES: ValidationRule<IDSInfo>[] = [
  {
    name: "title_required",
    message: "Title is required",
    validate: (metadata) => Boolean(metadata.title && metadata.title.trim().length > 0),
    severity: "error",
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "title_length",
    message: `Title must be between ${VALIDATION_RULES.TITLE_MIN_LENGTH} and ${VALIDATION_RULES.TITLE_MAX_LENGTH} characters`,
    validate: (metadata) => {
      const title = metadata.title?.trim();
      return Boolean(title && title.length >= VALIDATION_RULES.TITLE_MIN_LENGTH && title.length <= VALIDATION_RULES.TITLE_MAX_LENGTH);
    },
    severity: "error",
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "version_required",
    message: "Version is required",
    validate: (metadata) => Boolean(metadata.version && metadata.version.trim().length > 0),
    severity: "error", 
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "version_format",
    message: "Version must follow semantic versioning (e.g., 1.0.0)",
    validate: (metadata) => {
      const version = metadata.version?.trim();
      return Boolean(version && REGEX_PATTERNS.VERSION.test(version));
    },
    severity: "warning",
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "description_length",
    message: `Description must not exceed ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`,
    validate: (metadata) => {
      const description = metadata.description?.trim();
      return !description || description.length <= VALIDATION_RULES.DESCRIPTION_MAX_LENGTH;
    },
    severity: "warning",
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "author_recommended",
    message: "Author information is recommended for documentation",
    validate: (metadata) => Boolean(metadata.author && metadata.author.trim().length > 0),
    severity: "warning",
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "date_valid",
    message: "Date must be a valid ISO date format (YYYY-MM-DD)",
    validate: (metadata) => {
      if (!metadata.date) return false;
      const date = new Date(metadata.date);
      return !isNaN(date.getTime()) && Boolean(metadata.date.match(/^\d{4}-\d{2}-\d{2}$/));
    },
    severity: "error",
    code: ERROR_CODES.VALIDATION_FAILED
  }
];

// Specification Validation Rules
export const SPECIFICATION_VALIDATION_RULES: ValidationRule<IDSSpecification>[] = [
  {
    name: "name_required",
    message: "Specification name is required",
    validate: (spec) => Boolean(spec.name && spec.name.trim().length > 0),
    severity: "error",
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "name_length",
    message: "Specification name must not exceed 100 characters",
    validate: (spec) => {
      const name = spec.name?.trim();
      return Boolean(name && name.length <= 100);
    },
    severity: "error",
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "applicability_required",
    message: "Applicability type is required",
    validate: (spec) => Boolean(spec.applicabilityType),
    severity: "error",
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "ifc_class_when_type",
    message: "IFC class is required when applicability type is 'type'",
    validate: (spec) => {
      if (spec.applicabilityType === "type") {
        return Boolean(spec.ifcClass || (spec.ifcClasses && spec.ifcClasses.length > 0));
      }
      return true;
    },
    severity: "error",
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "classification_when_classification",
    message: "Classification is required when applicability type is 'classification'",
    validate: (spec) => {
      if (spec.applicabilityType === "classification") {
        return Boolean(spec.classification && spec.classification.trim().length > 0);
      }
      return true;
    },
    severity: "error",
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "has_requirements",
    message: "Specification must have at least one requirement",
    validate: (spec) => Boolean(spec.requirements && spec.requirements.length > 0),
    severity: "warning",
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "requirements_limit",
    message: `Specification should not exceed ${VALIDATION_RULES.MAX_REQUIREMENTS_PER_SPEC} requirements for better maintainability`,
    validate: (spec) => Boolean(spec.requirements && spec.requirements.length <= VALIDATION_RULES.MAX_REQUIREMENTS_PER_SPEC),
    severity: "warning",
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "ifc_class_format",
    message: "IFC class names should start with 'IFC' and be uppercase",
    validate: (spec) => {
      if (spec.ifcClass) {
        return REGEX_PATTERNS.IFC_CLASS.test(spec.ifcClass);
      }
      if (spec.ifcClasses) {
        return spec.ifcClasses.every(cls => REGEX_PATTERNS.IFC_CLASS.test(cls));
      }
      return true;
    },
    severity: "warning",
    code: ERROR_CODES.VALIDATION_FAILED
  }
];

// Requirement Validation Rules
export const REQUIREMENT_VALIDATION_RULES: ValidationRule<IDSRequirement>[] = [
  {
    name: "facet_required",
    message: "Requirement facet is required",
    validate: (req) => Boolean(req.facet),
    severity: "error",
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "property_set_when_property",
    message: "PropertySet is required for Property facet",
    validate: (req) => {
      if (req.facet === "Property") {
        return Boolean(req.propertySet && req.propertySet.trim().length > 0);
      }
      return true;
    },
    severity: "error",
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "base_names_when_property",
    message: "At least one property name is required for Property facet",
    validate: (req) => {
      if (req.facet === "Property") {
        return Boolean(req.baseNames && req.baseNames.length > 0 && req.baseNames.some(name => name.trim().length > 0));
      }
      return true;
    },
    severity: "error",
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "property_name_format",
    message: "Property names should follow naming conventions",
    validate: (req) => {
      if (req.facet === "Property" && req.baseNames) {
        return req.baseNames.every(name => 
          name.trim().length > 0 && 
          name.length <= VALIDATION_RULES.PROPERTY_NAME_MAX_LENGTH &&
          REGEX_PATTERNS.PROPERTY_NAME.test(name)
        );
      }
      return true;
    },
    severity: "warning",
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "materials_when_material",
    message: "At least one material is required for Material facet",
    validate: (req) => {
      if (req.facet === "Material") {
        return Boolean(req.materials && req.materials.length > 0 && req.materials.some(mat => mat.trim().length > 0));
      }
      return true;
    },
    severity: "error",
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "value_or_valuemap",
    message: "Either value or valueMap should be specified for validation",
    validate: (req) => {
      if (req.facet === "Property" || req.facet === "Attribute") {
        return Boolean(req.value || (req.valueMap && Object.keys(req.valueMap).length > 0));
      }
      return true;
    },
    severity: "warning",
    code: ERROR_CODES.VALIDATION_FAILED
  },
  {
    name: "data_type_recommended",
    message: "Data type is recommended for better validation",
    validate: (req) => {
      if (req.facet === "Property" || req.facet === "Attribute") {
        return Boolean(req.dataType && req.dataType.trim().length > 0);
      }
      return true;
    },
    severity: "warning",
    code: ERROR_CODES.VALIDATION_FAILED
  }
];

// Combined Validation Rules
export const ALL_VALIDATION_RULES = {
  metadata: METADATA_VALIDATION_RULES,
  specification: SPECIFICATION_VALIDATION_RULES,
  requirement: REQUIREMENT_VALIDATION_RULES
} as const;

// Validation Functions
export const validateMetadata = (metadata: IDSInfo): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  METADATA_VALIDATION_RULES.forEach(rule => {
    if (!rule.validate(metadata)) {
      errors.push({
        type: rule.severity,
        message: rule.message,
        field: "metadata",
        code: rule.code
      });
    }
  });
  
  return errors;
};

export const validateSpecification = (specification: IDSSpecification, index: number): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  SPECIFICATION_VALIDATION_RULES.forEach(rule => {
    if (!rule.validate(specification)) {
      errors.push({
        type: rule.severity,
        message: rule.message,
        field: "specifications",
        specIndex: index,
        code: rule.code
      });
    }
  });
  
  return errors;
};

export const validateRequirement = (requirement: IDSRequirement, specIndex: number, reqIndex: number): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  REQUIREMENT_VALIDATION_RULES.forEach(rule => {
    if (!rule.validate(requirement)) {
      errors.push({
        type: rule.severity,
        message: rule.message,
        field: "requirements",
        specIndex: specIndex,
        requirementIndex: reqIndex,
        code: rule.code
      });
    }
  });
  
  return errors;
};

export const validateSpecifications = (specifications: IDSSpecification[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Global validations
  if (specifications.length === 0) {
    errors.push({
      type: "warning",
      message: "No specifications defined",
      field: "specifications",
      code: ERROR_CODES.VALIDATION_FAILED
    });
  }
  
  if (specifications.length > VALIDATION_RULES.MAX_SPECIFICATIONS) {
    errors.push({
      type: "warning", 
      message: `Too many specifications (${specifications.length}). Consider splitting into multiple IDS files.`,
      field: "specifications",
      code: ERROR_CODES.VALIDATION_FAILED
    });
  }
  
  // Check for duplicate names
  const names = specifications.map(spec => spec.name.toLowerCase().trim());
  const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
  if (duplicateNames.length > 0) {
    errors.push({
      type: "warning",
      message: "Duplicate specification names found. Consider using unique names for better clarity.",
      field: "specifications", 
      code: ERROR_CODES.VALIDATION_FAILED
    });
  }
  
  // Validate individual specifications
  specifications.forEach((spec, index) => {
    errors.push(...validateSpecification(spec, index));
    
    // Validate requirements within each specification
    if (spec.requirements) {
      spec.requirements.forEach((req, reqIndex) => {
        errors.push(...validateRequirement(req, index, reqIndex));
      });
    }
  });
  
  return errors;
};

export const validateComplete = (metadata: IDSInfo, specifications: IDSSpecification[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Validate metadata
  errors.push(...validateMetadata(metadata));
  
  // Validate specifications
  errors.push(...validateSpecifications(specifications));
  
  return errors;
};

// Validation Utilities
export const hasErrors = (validationErrors: ValidationError[]): boolean => {
  return validationErrors.some(error => error.type === "error");
};

export const hasWarnings = (validationErrors: ValidationError[]): boolean => {
  return validationErrors.some(error => error.type === "warning");
};

export const getErrorCount = (validationErrors: ValidationError[]): number => {
  return validationErrors.filter(error => error.type === "error").length;
};

export const getWarningCount = (validationErrors: ValidationError[]): number => {
  return validationErrors.filter(error => error.type === "warning").length;
};

export const canExport = (validationErrors: ValidationError[]): boolean => {
  return !hasErrors(validationErrors);
};

export const groupErrorsByField = (validationErrors: ValidationError[]): Record<string, ValidationError[]> => {
  return validationErrors.reduce((groups, error) => {
    const field = error.field || "general";
    if (!groups[field]) {
      groups[field] = [];
    }
    groups[field].push(error);
    return groups;
  }, {} as Record<string, ValidationError[]>);
};

export const formatValidationMessage = (error: ValidationError): string => {
  let message = error.message;
  
  if (error.specIndex !== undefined) {
    message = `Specification ${error.specIndex + 1}: ${message}`;
  }
  
  if (error.requirementIndex !== undefined) {
    message = `${message} (Requirement ${error.requirementIndex + 1})`;
  }
  
  return message;
};
