import { useState, useCallback, useMemo } from "react";
import { validateSpecifications, validateIDSMetadata } from "../utils/idsValidation";
import { IDSInfo, IDSSpecification } from "../utils/xmlGeneration";

interface ValidationError {
  type: "error" | "warning";
  message: string;
  field?: string;
  specIndex?: number;
  requirementIndex?: number;
}

interface ValidationStatus {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  canExport: boolean;
}

interface UseValidationOptions {
  validateOnChange?: boolean;
  enableWarnings?: boolean;
}

interface UseValidationReturn {
  validationStatus: ValidationStatus;
  validateAll: (specs: IDSSpecification[], metadata: IDSInfo) => ValidationStatus;
  validateSpecifications: (specs: IDSSpecification[]) => ValidationStatus;
  validateMetadata: (metadata: IDSInfo) => ValidationStatus;
  clearValidation: () => void;
  hasErrors: boolean;
  hasWarnings: boolean;
  errorCount: number;
  warningCount: number;
}

export const useValidation = (options: UseValidationOptions = {}): UseValidationReturn => {
  const { validateOnChange = true, enableWarnings = true } = options;
  
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
    valid: false,
    errors: [],
    warnings: [],
    canExport: false,
  });

  const validateAll = useCallback((
    specifications: IDSSpecification[], 
    metadata: IDSInfo
  ): ValidationStatus => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Validate metadata
    const metadataValidation = validateIDSMetadata(metadata);
    if (!metadataValidation.valid) {
      errors.push(...metadataValidation.errors.map(error => ({
        type: "error" as const,
        message: error,
        field: "metadata"
      })));
    }

    // Validate specifications
    const specsValidation = validateSpecifications(specifications);
    if (!specsValidation.valid) {
      errors.push(...specsValidation.errors.map(error => ({
        type: "error" as const,
        message: error,
        field: "specifications"
      })));
    }

    // Additional custom validations
    if (enableWarnings) {
      // Warning: No IFC versions selected in any specification
      const hasIfcVersions = specifications.some(spec => spec.ifcVersions && spec.ifcVersions.length > 0);
      if (!hasIfcVersions && specifications.length > 0) {
        warnings.push({
          type: "warning",
          message: "No IFC versions specified in any specification. Consider adding supported IFC versions.",
          field: "specifications"
        });
      }

      // Warning: Very long IDS title
      if (metadata.title && metadata.title.length > 100) {
        warnings.push({
          type: "warning",
          message: "IDS title is very long (>100 characters). Consider shortening for better usability.",
          field: "metadata"
        });
      }

      // Warning: No description
      if (!metadata.description || metadata.description.trim() === "") {
        warnings.push({
          type: "warning",
          message: "No description provided. Consider adding a description for better documentation.",
          field: "metadata"
        });
      }

      // Warning: Many specifications
      if (specifications.length > 20) {
        warnings.push({
          type: "warning",
          message: `High number of specifications (${specifications.length}). Consider grouping related requirements.`,
          field: "specifications"
        });
      }

      // Check for potentially duplicate specifications
      const specNames = specifications.map(spec => spec.name.toLowerCase().trim());
      const duplicateNames = specNames.filter((name, index) => specNames.indexOf(name) !== index);
      if (duplicateNames.length > 0) {
        warnings.push({
          type: "warning",
          message: "Possible duplicate specification names found. Consider using unique names.",
          field: "specifications"
        });
      }

      // Warning: Specifications without requirements
      specifications.forEach((spec, index) => {
        if (!spec.requirements || spec.requirements.length === 0) {
          warnings.push({
            type: "warning",
            message: `Specification "${spec.name}" has no requirements.`,
            field: "specifications",
            specIndex: index
          });
        }
      });
    }

    const status: ValidationStatus = {
      valid: errors.length === 0,
      errors,
      warnings,
      canExport: errors.length === 0 && specifications.length > 0 && metadata.title.trim() !== ""
    };

    if (validateOnChange) {
      setValidationStatus(status);
    }

    return status;
  }, [validateOnChange, enableWarnings]);

  const validateSpecificationsOnly = useCallback((specifications: IDSSpecification[]): ValidationStatus => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const specsValidation = validateSpecifications(specifications);
    if (!specsValidation.valid) {
      errors.push(...specsValidation.errors.map(error => ({
        type: "error" as const,
        message: error,
        field: "specifications"
      })));
    }

    const status: ValidationStatus = {
      valid: errors.length === 0,
      errors,
      warnings,
      canExport: false // Can't determine without metadata
    };

    return status;
  }, []);

  const validateMetadataOnly = useCallback((metadata: IDSInfo): ValidationStatus => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const metadataValidation = validateIDSMetadata(metadata);
    if (!metadataValidation.valid) {
      errors.push(...metadataValidation.errors.map(error => ({
        type: "error" as const,
        message: error,
        field: "metadata"
      })));
    }

    const status: ValidationStatus = {
      valid: errors.length === 0,
      errors,
      warnings,
      canExport: false // Can't determine without specifications
    };

    return status;
  }, []);

  const clearValidation = useCallback(() => {
    setValidationStatus({
      valid: false,
      errors: [],
      warnings: [],
      canExport: false,
    });
  }, []);

  // Computed properties
  const hasErrors = useMemo(() => validationStatus.errors.length > 0, [validationStatus.errors]);
  const hasWarnings = useMemo(() => validationStatus.warnings.length > 0, [validationStatus.warnings]);
  const errorCount = useMemo(() => validationStatus.errors.length, [validationStatus.errors]);
  const warningCount = useMemo(() => validationStatus.warnings.length, [validationStatus.warnings]);

  return {
    validationStatus,
    validateAll,
    validateSpecifications: validateSpecificationsOnly,
    validateMetadata: validateMetadataOnly,
    clearValidation,
    hasErrors,
    hasWarnings,
    errorCount,
    warningCount,
  };
};
