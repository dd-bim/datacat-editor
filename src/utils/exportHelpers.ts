import { validateIDSXml, validateSpecifications, validateIDSMetadata } from "./idsValidation";
import { generateIDSXml, generateSafeFilename, downloadIDSFile, IDSInfo, IDSSpecification } from "./xmlGeneration";

/**
 * Export result interface
 */
export interface ExportResult {
  success: boolean;
  message: string;
  filename?: string;
  errors?: string[];
}

/**
 * Complete IDS export process with validation
 */
export async function exportIDS(
  specifications: IDSSpecification[],
  metadata: IDSInfo,
  onProgress?: (step: string) => void
): Promise<ExportResult> {
  try {
    onProgress?.("Validating metadata...");
    
    // Validate metadata
    const metadataValidation = validateIDSMetadata(metadata);
    if (!metadataValidation.valid) {
      return {
        success: false,
        message: "Metadata validation failed",
        errors: metadataValidation.errors
      };
    }

    onProgress?.("Validating specifications...");
    
    // Validate specifications
    const specsValidation = validateSpecifications(specifications);
    if (!specsValidation.valid) {
      return {
        success: false,
        message: "Specifications validation failed",
        errors: specsValidation.errors
      };
    }

    onProgress?.("Generating XML...");
    
    // Generate XML
    const xml = generateIDSXml(specifications, metadata);

    onProgress?.("Validating XML against XSD...");
    
    // Validate generated XML
    const xmlValidation = await validateIDSXml(xml);
    if (!xmlValidation.valid) {
      return {
        success: false,
        message: "Generated XML is not valid",
        errors: xmlValidation.errors
      };
    }

    onProgress?.("Preparing download...");
    
    // Generate filename and download
    const filename = generateSafeFilename(metadata.title);
    downloadIDSFile(xml, filename);

    return {
      success: true,
      message: "IDS file exported successfully",
      filename
    };

  } catch (error) {
    console.error("Export error:", error);
    return {
      success: false,
      message: "Export failed due to unexpected error",
      errors: [error instanceof Error ? error.message : "Unknown error"]
    };
  }
}

/**
 * Quick export without extensive validation (for development)
 */
export function quickExportIDS(
  specifications: IDSSpecification[],
  metadata: IDSInfo
): ExportResult {
  try {
    const xml = generateIDSXml(specifications, metadata);
    const filename = generateSafeFilename(metadata.title);
    downloadIDSFile(xml, filename);

    return {
      success: true,
      message: "IDS file exported successfully (quick mode)",
      filename
    };
  } catch (error) {
    console.error("Quick export error:", error);
    return {
      success: false,
      message: "Quick export failed",
      errors: [error instanceof Error ? error.message : "Unknown error"]
    };
  }
}

/**
 * Generate XML preview without downloading
 */
export async function generateXMLPreview(
  specifications: IDSSpecification[],
  metadata: IDSInfo
): Promise<{ xml: string; valid: boolean; errors?: string[] }> {
  try {
    const xml = generateIDSXml(specifications, metadata);
    const validation = await validateIDSXml(xml);
    
    return {
      xml,
      valid: validation.valid,
      errors: validation.errors
    };
  } catch (error) {
    console.error("XML preview error:", error);
    return {
      xml: "",
      valid: false,
      errors: [error instanceof Error ? error.message : "Unknown error"]
    };
  }
}

/**
 * Auto-save functionality for IDS data
 */
export function autoSaveIDS(
  specifications: IDSSpecification[],
  metadata: IDSInfo,
  key: string = "ids_auto_save"
): void {
  try {
    const data = {
      specifications,
      metadata,
      timestamp: new Date().toISOString(),
      version: "1.0"
    };
    
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn("Auto-save failed:", error);
  }
}

/**
 * Load auto-saved IDS data
 */
export function loadAutoSavedIDS(
  key: string = "ids_auto_save"
): { specifications: IDSSpecification[]; metadata: IDSInfo } | null {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    
    const data = JSON.parse(saved);
    
    // Basic validation of loaded data
    if (!data.specifications || !data.metadata) {
      return null;
    }
    
    return {
      specifications: data.specifications,
      metadata: data.metadata
    };
  } catch (error) {
    console.warn("Failed to load auto-saved data:", error);
    return null;
  }
}

/**
 * Clear auto-saved data
 */
export function clearAutoSavedIDS(key: string = "ids_auto_save"): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to clear auto-saved data:", error);
  }
}

/**
 * Export specifications to JSON format (for backup/sharing)
 */
export function exportSpecificationsToJSON(
  specifications: IDSSpecification[],
  metadata: IDSInfo
): void {
  const data = {
    specifications,
    metadata,
    exportDate: new Date().toISOString(),
    format: "datacat-ids-json",
    version: "1.0"
  };
  
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const filename = generateSafeFilename(metadata.title).replace('.ids', '.json');
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Import specifications from JSON format
 */
export async function importSpecificationsFromJSON(
  file: File
): Promise<{ specifications: IDSSpecification[]; metadata: IDSInfo } | null> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Validate the imported data structure
    if (!data.specifications || !data.metadata || data.format !== "datacat-ids-json") {
      throw new Error("Invalid file format");
    }
    
    return {
      specifications: data.specifications,
      metadata: data.metadata
    };
  } catch (error) {
    console.error("Import error:", error);
    return null;
  }
}
