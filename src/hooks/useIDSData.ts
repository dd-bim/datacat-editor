import { useMemo } from 'react';
import { ThemeEntity } from '../domain';

const THEME_ID = ThemeEntity.tags?.[0] || '';

export const useIDSData = (
  propertyGroups: any,
  dictionaries: any,
  classes: any,
  newlyCreatedPropertySets: Map<string, any[]>
) => {
  // Merkmalsgruppen extrahieren - Backend PropertySets
  const backendPropertyGroupOptions = useMemo(() => {
    console.log("Property Groups:", propertyGroups);
    if (!propertyGroups) return [];
    return propertyGroups.map((n: any) => ({
      id: n.id,
      name: n.name ?? "",
      tags: n.tags,
      isLocal: false,
    })).sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
  }, [propertyGroups]);

  // Kombinierte PropertyGroup-Optionen (Backend + lokale)
  const propertyGroupOptions = useMemo(() => {
    const localPropertySets = Array.from(newlyCreatedPropertySets.keys()).map(name => ({
      id: `local-${name}`,
      name,
      tags: [{ name: "Lokal erstellt" }],
      isLocal: true,
    }));
    
    return [...backendPropertyGroupOptions, ...localPropertySets]
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
  }, [backendPropertyGroupOptions, newlyCreatedPropertySets]);

  // Dictionary extrahieren
  const dictionaryOptions = useMemo(() => {
    if (!dictionaries) return [];
    return dictionaries
      .map((n: any) => ({
        id: n.id,
        name: n.name.texts[0]?.text ,
      }))
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
  }, [dictionaries]);

  // Alle Klassen aller Modelle (für Requirements)
  const classOptions = useMemo(() => {
    console.log("Classes:", classes);
    if (!classes) return [];

    const result: {
      name: string;
      id: string;
      themeName?: string;
      dictionaryName?: string;
      dictionaryId?: string;
    }[] = [];

    for (const node of classes) {
      let dictionaryName = "";
      let dictionaryId = "";
      const themeNames: string[] = [];
      
      if (node.dictionary) {
        dictionaryName = node.dictionary.name.texts[0]?.text || "";
        dictionaryId = node.dictionary.id;
      }
      if (node.connectingSubjects && node.connectingSubjects.length > 0) {
        for (const rel of node.connectingSubjects) {
            const subject = rel.connectingSubject;
            if (subject && subject.tags.some((tag: any) => tag.id === THEME_ID)) {
              const subjectName = subject.name || "";
              if (subjectName && !themeNames.includes(subjectName)) {
                themeNames.push(subjectName);
              }
            }
          }
        }
        result.push({
          name: node.name,
          id: node.id,
          themeName: themeNames.length > 0 ? themeNames.join(", ") : undefined,
          dictionaryName: dictionaryName || undefined,
          dictionaryId,
        });

      }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [classes]);

  return {
    propertyGroupOptions,
    dictionaryOptions,
    classOptions,
  };
};
