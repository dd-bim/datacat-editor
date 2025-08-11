// Local storage utilities for IDS data persistence
export interface SavedIDSData {
  id: string;
  name: string;
  timestamp: number;
  data: {
    idsTitle: string;
    idsVersion?: string; // Neue Eigenschaft für IDS Version
    specRows: any[];
    localPropertySets?: Record<string, any[]>; // Neue Eigenschaft für lokale PropertySets
  };
}

export interface SavedSpecification {
  id: string;
  name: string;
  timestamp: number;
  data: {
    name: string;
    applicabilityType: "type" | "classification";
    ifcVersion: string;
    requirements: any[];
    ifcClass?: string;
    localPropertySets?: Record<string, any[]>; // Neue Eigenschaft für lokale PropertySets
  };
}

const IDS_STORAGE_KEY = 'datacat_saved_ids_files';
const SPEC_STORAGE_KEY = 'datacat_saved_specifications';
const MAX_SAVED_ITEMS = 10;

// IDS Files
export const saveIDSData = (name: string, idsTitle: string, specRows: any[], localPropertySets?: Map<string, any[]>, idsVersion?: string): string => {
  const savedData = getSavedIDSFiles();
  const id = generateId();
  
  // Konvertiere Map zu Object für Serialisierung
  const localPropertySetsObj = localPropertySets ? Object.fromEntries(localPropertySets) : undefined;
  
  const newItem: SavedIDSData = {
    id,
    name: name || idsTitle || `IDS ${new Date().toLocaleString()}`,
    timestamp: Date.now(),
    data: {
      idsTitle,
      idsVersion,
      specRows: JSON.parse(JSON.stringify(specRows)), // Deep copy
      localPropertySets: localPropertySetsObj
    }
  };
  
  // Add to beginning and keep only last MAX_SAVED_ITEMS
  savedData.unshift(newItem);
  const trimmedData = savedData.slice(0, MAX_SAVED_ITEMS);
  
  localStorage.setItem(IDS_STORAGE_KEY, JSON.stringify(trimmedData));
  return id;
};

export const getSavedIDSFiles = (): SavedIDSData[] => {
  try {
    const data = localStorage.getItem(IDS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading saved IDS files:', error);
    return [];
  }
};

export const loadIDSData = (id: string): SavedIDSData | null => {
  const savedData = getSavedIDSFiles();
  return savedData.find(item => item.id === id) || null;
};

export const deleteIDSData = (id: string): void => {
  const savedData = getSavedIDSFiles();
  const filtered = savedData.filter(item => item.id !== id);
  localStorage.setItem(IDS_STORAGE_KEY, JSON.stringify(filtered));
};

// Specifications
export const saveSpecification = (specData: any): string => {
  const savedSpecs = getSavedSpecifications();
  const id = generateId();
  
  const newItem: SavedSpecification = {
    id,
    name: specData.name || `Spec ${new Date().toLocaleString()}`,
    timestamp: Date.now(),
    data: JSON.parse(JSON.stringify(specData)) // Deep copy
  };
  
  // Add to beginning and keep only last MAX_SAVED_ITEMS
  savedSpecs.unshift(newItem);
  const trimmedData = savedSpecs.slice(0, MAX_SAVED_ITEMS);
  
  localStorage.setItem(SPEC_STORAGE_KEY, JSON.stringify(trimmedData));
  return id;
};

export const getSavedSpecifications = (): SavedSpecification[] => {
  try {
    const data = localStorage.getItem(SPEC_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading saved specifications:', error);
    return [];
  }
};

export const loadSpecification = (id: string): SavedSpecification | null => {
  const savedSpecs = getSavedSpecifications();
  return savedSpecs.find(item => item.id === id) || null;
};

export const deleteSpecification = (id: string): void => {
  const savedSpecs = getSavedSpecifications();
  const filtered = savedSpecs.filter(item => item.id !== id);
  localStorage.setItem(SPEC_STORAGE_KEY, JSON.stringify(filtered));
};

// Auto-save functionality
export const autoSaveIDSData = (idsTitle: string, specRows: any[], localPropertySets?: Map<string, any[]>, idsVersion?: string): void => {
  // Only auto-save if there's meaningful data
  if (specRows.length === 0 && !idsTitle.trim()) {
    return;
  }
  
  const autoSaveKey = 'datacat_autosave_ids';
  const localPropertySetsObj = localPropertySets ? Object.fromEntries(localPropertySets) : undefined;
  
  const autoSaveData = {
    timestamp: Date.now(),
    data: {
      idsTitle,
      idsVersion,
      specRows: JSON.parse(JSON.stringify(specRows)),
      localPropertySets: localPropertySetsObj
    }
  };
  
  localStorage.setItem(autoSaveKey, JSON.stringify(autoSaveData));
};

export const getAutoSavedIDSData = (): { timestamp: number; data: { idsTitle: string; idsVersion?: string; specRows: any[]; localPropertySets?: Record<string, any[]> } } | null => {
  try {
    const data = localStorage.getItem('datacat_autosave_ids');
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    // Only return if saved within last 24 hours
    if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
      return parsed;
    }
    
    // Clean up old auto-save
    localStorage.removeItem('datacat_autosave_ids');
    return null;
  } catch (error) {
    console.error('Error loading auto-saved data:', error);
    return null;
  }
};

export const clearAutoSavedData = (): void => {
  localStorage.removeItem('datacat_autosave_ids');
};

// Helper functions
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
