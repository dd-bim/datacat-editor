import { validateWithXSDLibrary } from "../components/idsValidatorBrowser";

/**
 * Fetches the IDS XSD schema for validation
 */
export async function fetchXsd(): Promise<string> {
  try {
    const response = await fetch("/ids.xsd");
    if (!response.ok) {
      throw new Error(`Failed to fetch XSD: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error fetching XSD:", error);
    throw error;
  }
}

/**
 * Validates an IDS XML string against the XSD schema
 */
export async function validateIDSXml(xml: string): Promise<{ valid: boolean; errors?: string[] }> {
  try {
    const xsd = await fetchXsd();
    return await validateWithXSDLibrary(xml, xsd);
  } catch (error) {
    console.error("Error validating IDS XML:", error);
    return {
      valid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Validates IDS specifications before XML generation
 */
export function validateSpecifications(specifications: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!specifications || specifications.length === 0) {
    errors.push("No specifications provided");
    return { valid: false, errors };
  }

  specifications.forEach((spec, index) => {
    const specErrors = validateSingleSpecification(spec, index);
    errors.push(...specErrors);
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates a single specification
 */
function validateSingleSpecification(spec: any, index: number): string[] {
  const errors: string[] = [];
  const specPrefix = `Specification ${index + 1}`;

  // Name validation
  if (!spec.name || spec.name.trim() === "") {
    errors.push(`${specPrefix}: Name is required`);
  }

  // Applicability validation
  if (!spec.applicabilityType) {
    errors.push(`${specPrefix}: Applicability type is required`);
  }

  if (spec.applicabilityType === "type") {
    if (!spec.ifcClass && (!spec.ifcClasses || spec.ifcClasses.length === 0)) {
      errors.push(`${specPrefix}: IFC Class is required when applicability type is 'type'`);
    }
  } else if (spec.applicabilityType === "classification") {
    if (!spec.classification) {
      errors.push(`${specPrefix}: Classification is required when applicability type is 'classification'`);
    }
  }

  // Requirements validation
  if (!spec.requirements || spec.requirements.length === 0) {
    errors.push(`${specPrefix}: At least one requirement is needed`);
  } else {
    spec.requirements.forEach((req: any, reqIndex: number) => {
      const reqErrors = validateRequirement(req, reqIndex, specPrefix);
      errors.push(...reqErrors);
    });
  }

  return errors;
}

/**
 * Validates a single requirement
 */
function validateRequirement(requirement: any, index: number, specPrefix: string): string[] {
  const errors: string[] = [];
  const reqPrefix = `${specPrefix}, Requirement ${index + 1}`;

  if (!requirement.facet) {
    errors.push(`${reqPrefix}: Facet type is required`);
    return errors;
  }

  switch (requirement.facet) {
    case "Property":
      if (!requirement.propertySet) {
        errors.push(`${reqPrefix}: Property Set is required for Property facet`);
      }
      if (!requirement.baseNames || requirement.baseNames.length === 0) {
        errors.push(`${reqPrefix}: At least one property must be selected for Property facet`);
      }
      break;

    case "Attribute":
      if (!requirement.value) {
        errors.push(`${reqPrefix}: Attribute value is required for Attribute facet`);
      }
      break;

    case "Classification":
      if (!requirement.value) {
        errors.push(`${reqPrefix}: Classification value is required for Classification facet`);
      }
      break;

    case "Entity":
      if (!requirement.value) {
        errors.push(`${reqPrefix}: Entity type is required for Entity facet`);
      }
      break;

    case "Material":
      if (!requirement.materials || requirement.materials.length === 0) {
        errors.push(`${reqPrefix}: At least one material must be selected for Material facet`);
      }
      break;

    default:
      errors.push(`${reqPrefix}: Unknown facet type '${requirement.facet}'`);
  }

  return errors;
}

/**
 * Validates IDS metadata
 */
export function validateIDSMetadata(metadata: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!metadata.title || metadata.title.trim() === "") {
    errors.push("IDS title is required");
  }

  if (!metadata.version || metadata.version.trim() === "") {
    errors.push("IDS version is required");
  }

  if (!metadata.ifcVersions || metadata.ifcVersions.length === 0) {
    errors.push("At least one IFC version must be selected");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
