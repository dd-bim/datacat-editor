import { useMemo } from 'react';

export const useIDSUtilities = (
  propertyGroupOptions: any[],
  data: any,
  newlyCreatedPropertySets: Map<string, any[]>,
  dictionaryOptions: any[],
  classOptions: any[]
) => {
  // Hilfsfunktionen für PropertySet/Merkmal/Value
  const getPropertySetUri = useMemo(() => 
    (propertySetName: string) => {
      // Prüfen, ob es sich um ein lokal erstelltes PropertySet handelt
      if (newlyCreatedPropertySets.has(propertySetName)) {
        return ""; // Keine URL für lokale PropertySets
      }
      
      const propertyGroup = propertyGroupOptions.find((g: any) => g.name === propertySetName);
      if (!propertyGroup) return "";
      return `${window.location.origin}/property-group/${propertyGroup.id}`;
    }, [propertyGroupOptions, newlyCreatedPropertySets]
  );

  const getPropertiesForPropertySet = useMemo(() => {
    const propertyMap = new Map<string, any[]>();
    
    return (propertySetName: string) => {
      if (propertyMap.has(propertySetName)) {
        return propertyMap.get(propertySetName) || [];
      }
      
      if (newlyCreatedPropertySets.has(propertySetName)) {
        const localProperties = newlyCreatedPropertySets.get(propertySetName) || [];
        propertyMap.set(propertySetName, localProperties);
        return localProperties;
      }
      
      const propertyGroup = propertyGroupOptions.find((g: any) => g.name === propertySetName);
      if (!propertyGroup || !data?.hierarchy?.nodes || !data?.hierarchy?.paths) {
        propertyMap.set(propertySetName, []);
        return [];
      }
      
      const collectedPropertyIds = data.hierarchy.paths
        .filter((path: string[]) => path.includes(propertyGroup.id))
        .map((path: string[]) => {
          const idx = path.indexOf(propertyGroup.id);
          return path[idx + 1];
        })
        .filter(Boolean);
      
      const result = data.hierarchy.nodes.filter(
        (node: any) => node.recordType === "Property" && collectedPropertyIds.includes(node.id)
      );
      
      propertyMap.set(propertySetName, result);
      return result;
    };
  }, [propertyGroupOptions, data?.hierarchy?.nodes, data?.hierarchy?.paths, newlyCreatedPropertySets]);

  const getValuesForProperty = useMemo(() => {
    const valueMap = new Map<string, any[]>();
    
    return (propertyId: string) => {
      if (valueMap.has(propertyId)) {
        return valueMap.get(propertyId) || [];
      }
      
      if (!data?.hierarchy?.nodes) {
        valueMap.set(propertyId, []);
        return [];
      }
      
      const result = data.hierarchy.nodes.filter(
        (node: any) =>
          node.recordType === "Value" &&
          Array.isArray(node.tags) &&
          node.tags.some((tag: any) => tag.id === propertyId)
      );
      
      valueMap.set(propertyId, result);
      return result;
    };
  }, [data?.hierarchy?.nodes]);

  // Hilfsfunktionen für Namensauflösung
  const getModelNameById = (id: string) =>
    dictionaryOptions.find((m: any) => m.id === id)?.name || id;
  
  const getClassNameById = (id: string) =>
    classOptions.find((c: any) => c.id === id)?.name || id;

  // URI für Klassifikationssystem generieren
  const getClassificationUri = useMemo(() => 
    (dictionaryId: string) => {
      const model = dictionaryOptions.find((m: any) => m.id === dictionaryId);
      if (!model) return "";
      return `${window.location.origin}/model/${model.id}`;
    }, [dictionaryOptions]
  );

  // URI für Requirements basierend auf Typ und Applicability bestimmen
  const getRequirementUri = useMemo(() => 
    (requirement: any, applicabilityType: string) => {
      if (requirement.type === "classification" && applicabilityType === "type") {
        // IFC Klasse + Classification Requirement: URL vom Klassifikationssystem
        return getClassificationUri(requirement.value);
      } else if (requirement.type === "property") {
        // Property Requirement: PropertySet URL (oder leer für lokale)
        return getPropertySetUri(requirement.propertySet);
      }
      return "";
    }, [getClassificationUri, getPropertySetUri]
  );

  // Klassen für ein bestimmtes Modell filtern
  const getClassesForModel = useMemo(() => 
    (dictionaryId: string) => {
      return classOptions.filter((c: any) => c.dictionaryId === dictionaryId);
    }, [classOptions]
  );

  return {
    getPropertySetUri,
    getPropertiesForPropertySet,
    getValuesForProperty,
    getModelNameById,
    getClassNameById,
    getClassesForModel,
    getClassificationUri,
    getRequirementUri,
  };
};
