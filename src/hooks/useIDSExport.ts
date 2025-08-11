import { useState, useCallback } from "react";
import { useSnackbar } from "notistack";
import { useTranslate } from "@tolgee/react";
import { 
  exportIDS, 
  quickExportIDS, 
  generateXMLPreview, 
  autoSaveIDS, 
  loadAutoSavedIDS,
  ExportResult
} from "../utils/exportHelpers";
import { IDSInfo, IDSSpecification } from "../utils/xmlGeneration";

interface UseIDSExportOptions {
  onExportSuccess?: (result: ExportResult) => void;
  onExportError?: (error: string) => void;
  autoSaveKey?: string;
  enableAutoSave?: boolean;
}

interface UseIDSExportReturn {
  isExporting: boolean;
  lastExportResult: ExportResult | null;
  exportWithValidation: (specs: IDSSpecification[], metadata: IDSInfo) => Promise<void>;
  quickExport: (specs: IDSSpecification[], metadata: IDSInfo) => void;
  previewXML: (specs: IDSSpecification[], metadata: IDSInfo) => Promise<{ xml: string; valid: boolean; errors?: string[] }>;
  saveToLocalStorage: (specs: IDSSpecification[], metadata: IDSInfo) => void;
  loadFromLocalStorage: () => { specifications: IDSSpecification[]; metadata: IDSInfo } | null;
  clearAutoSave: () => void;
}

export const useIDSExport = (options: UseIDSExportOptions = {}): UseIDSExportReturn => {
  const {
    onExportSuccess,
    onExportError,
    autoSaveKey = "ids_auto_save",
    enableAutoSave = true
  } = options;

  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportResult, setLastExportResult] = useState<ExportResult | null>(null);

  const exportWithValidation = useCallback(async (
    specifications: IDSSpecification[], 
    metadata: IDSInfo
  ) => {
    setIsExporting(true);
    
    try {
      const result = await exportIDS(specifications, metadata, (step) => {
        // Optional: Could emit progress events here
        console.log("Export step:", step);
      });

      setLastExportResult(result);

      if (result.success) {
        enqueueSnackbar(
          t("ids_export.success_messages.ids_downloaded"), 
          { variant: "success" }
        );
        onExportSuccess?.(result);

        // Auto-save successful export data
        if (enableAutoSave) {
          autoSaveIDS(specifications, metadata, autoSaveKey);
        }
      } else {
        const errorMessage = result.errors?.join(", ") || result.message;
        enqueueSnackbar(
          `Export failed: ${errorMessage}`, 
          { variant: "error" }
        );
        onExportError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown export error";
      enqueueSnackbar(
        `Export failed: ${errorMessage}`, 
        { variant: "error" }
      );
      onExportError?.(errorMessage);
      setLastExportResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setIsExporting(false);
    }
  }, [enqueueSnackbar, onExportSuccess, onExportError, enableAutoSave, autoSaveKey]);

  const quickExport = useCallback((
    specifications: IDSSpecification[], 
    metadata: IDSInfo
  ) => {
    try {
      const result = quickExportIDS(specifications, metadata);
      setLastExportResult(result);

      if (result.success) {
        enqueueSnackbar(
          t("ids_export.success_messages.ids_downloaded"), 
          { variant: "success" }
        );
        onExportSuccess?.(result);
      } else {
        enqueueSnackbar(
          `Quick export failed: ${result.message}`, 
          { variant: "error" }
        );
        onExportError?.(result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown export error";
      enqueueSnackbar(
        `Quick export failed: ${errorMessage}`, 
        { variant: "error" }
      );
      onExportError?.(errorMessage);
    }
  }, [enqueueSnackbar, onExportSuccess, onExportError]);

  const previewXML = useCallback(async (
    specifications: IDSSpecification[], 
    metadata: IDSInfo
  ) => {
    try {
      return await generateXMLPreview(specifications, metadata);
    } catch (error) {
      console.error("XML preview error:", error);
      return {
        xml: "",
        valid: false,
        errors: [error instanceof Error ? error.message : "Unknown error"]
      };
    }
  }, []);

  const saveToLocalStorage = useCallback((
    specifications: IDSSpecification[], 
    metadata: IDSInfo
  ) => {
    try {
      autoSaveIDS(specifications, metadata, autoSaveKey);
      enqueueSnackbar(
        t("ids_export.success_messages.auto_saved"), 
        { variant: "info" }
      );
    } catch (error) {
      console.warn("Auto-save failed:", error);
      enqueueSnackbar(
        "Auto-save failed", 
        { variant: "warning" }
      );
    }
  }, [enqueueSnackbar, autoSaveKey]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const data = loadAutoSavedIDS(autoSaveKey);
      if (data) {
        enqueueSnackbar(
          t("ids_export.success_messages.auto_save_found"), 
          { variant: "info" }
        );
      }
      return data;
    } catch (error) {
      console.warn("Failed to load auto-saved data:", error);
      return null;
    }
  }, [enqueueSnackbar, autoSaveKey]);

  const clearAutoSave = useCallback(() => {
    try {
      localStorage.removeItem(autoSaveKey);
      enqueueSnackbar(
        "Auto-saved data cleared", 
        { variant: "info" }
      );
    } catch (error) {
      console.warn("Failed to clear auto-saved data:", error);
    }
  }, [enqueueSnackbar, autoSaveKey]);

  return {
    isExporting,
    lastExportResult,
    exportWithValidation,
    quickExport,
    previewXML,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearAutoSave,
  };
};
