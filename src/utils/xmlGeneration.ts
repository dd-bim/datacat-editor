import { convertToIDSXml } from "../components/idsXmlConverter";

/**
 * Interface for IDS metadata
 */
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

/**
 * Interface for IDS specification
 */
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

/**
 * Interface for IDS requirement (external interface)
 */
export interface IDSRequirement {
  facet: "Property" | "Attribute" | "Classification" | "Entity" | "Material";
  cardinality?: "required" | "optional" | "prohibited";
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

/**
 * Internal interface matching idsXmlConverter requirements
 */
interface InternalIDSRequirement {
  type: "classification" | "attribute" | "property";
  value?: string[] | string;
  modelId?: string;
  valueNames?: string[] | string;
  modelName?: string;
  propertySet?: string;
  baseName?: string;
  baseNames?: string[];
  valueList?: string[];
  dataType?: string;
  uri?: string;
  cardinality?: string;
}

/**
 * Converts external IDSRequirement to internal format
 */
function convertRequirement(req: IDSRequirement): InternalIDSRequirement {
  switch (req.facet) {
    case "Property":
      return {
        type: "property",
        propertySet: req.propertySet,
        baseNames: req.baseNames,
        dataType: req.dataType,
        cardinality: req.cardinality,
        valueList: req.valueMap ? Object.values(req.valueMap).flat() : undefined
      };
    case "Attribute":
      return {
        type: "attribute",
        value: req.value,
        dataType: req.dataType,
        cardinality: req.cardinality
      };
    case "Classification":
      return {
        type: "classification",
        value: req.value,
        cardinality: req.cardinality
      };
    default:
      // For Entity and Material, map to attribute for now
      return {
        type: "attribute",
        value: req.value || (req.materials ? req.materials.join(", ") : ""),
        cardinality: req.cardinality
      };
  }
}

/**
 * Generates IDS XML from specifications and metadata
 */
export function generateIDSXml(
  specifications: IDSSpecification[], 
  metadata: IDSInfo
): string {
  // Convert specifications to the format expected by convertToIDSXml
  const convertedSpecs = specifications.map((spec, index) => ({
    id: index, // Add required ID field
    name: spec.name,
    description: spec.description,
    instructions: spec.instructions,
    applicabilityType: "type" as const,
    ifcClass: spec.applicabilityType === "classification" 
      ? "IFCCLASSIFICATION" 
      : (Array.isArray(spec.ifcClasses) && spec.ifcClasses.length > 0)
        ? spec.ifcClasses[0] // Use first class for now
        : spec.ifcClass || "",
    // Keep arrays for potential future use
    ifcClasses: spec.ifcClasses || [],
    ifcVersions: spec.ifcVersions || [],
    classification: spec.classification,
    requirements: spec.requirements.map(convertRequirement)
  }));

  return convertToIDSXml(convertedSpecs, {
    title: metadata.title,
    author: metadata.author || "",
    version: metadata.version,
    date: metadata.date
  });
}

/**
 * Generates a safe filename from IDS title
 */
export function generateSafeFilename(title: string): string {
  let filename = title.trim();
  
  if (!filename) {
    filename = "Meine IDS Datei"; // Fallback when no IDS name is entered
  }
  
  // Remove invalid characters for filenames
  filename = filename.replace(/[^a-zA-Z0-9_\-äöüÄÖÜß ]+/g, ""); 
  filename = filename.replace(/\s+/g, "_");
  
  if (!filename) {
    filename = "IDS_Datei"; // Safety fallback
  }
  
  filename += ".ids";
  return filename;
}

/**
 * Downloads IDS XML as a file
 */
export function downloadIDSFile(xml: string, filename: string): void {
  const blob = new Blob([xml], { type: "application/xml" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  
  // Clean up the URL object
  window.URL.revokeObjectURL(url);
}

/**
 * Creates IDS metadata with default values
 */
export function createDefaultIDSMetadata(overrides: Partial<IDSInfo> = {}): IDSInfo {
  return {
    title: "",
    version: "1.0",
    date: new Date().toISOString().split("T")[0],
    ...overrides
  };
}

/**
 * Validates and processes IFC versions
 */
export function processIFCVersions(versions: string[]): string[] {
  const validVersions = ["IFC2X3", "IFC4", "IFC4X3"];
  return versions.filter(version => validVersions.includes(version));
}

/**
 * Converts specifications array to XML-ready format
 */
export function prepareSpecificationsForXML(specifications: any[]): IDSSpecification[] {
  return specifications.map(spec => ({
    name: spec.name || "Unnamed Specification",
    description: spec.description,
    instructions: spec.instructions,
    applicabilityType: spec.applicabilityType || "type",
    ifcClass: spec.ifcClass,
    ifcClasses: spec.ifcClasses || [],
    ifcVersions: spec.ifcVersions || [],
    classification: spec.classification,
    requirements: spec.requirements || []
  }));
}
