import { ApolloCache } from "@apollo/client";

/**
 * Standard Cache-Update-Funktion für Create-Entry-Mutationen
 * Löscht relevante Cache-Einträge, damit sie neu geladen werden
 */
export const useStandardCacheUpdate = () => {
  return (cache: ApolloCache<any>) => {
    cache.modify({
      id: "ROOT_QUERY",
      fields: {
        hierarchy: (value, { DELETE }) => DELETE,
        search: (value, { DELETE }) => DELETE,
        findDictionaries: (value, { DELETE }) => DELETE,
        findItems: (value, { DELETE }) => DELETE,
      },
    });
  };
};

/**
 * Erweiterte Cache-Update-Funktion für spezifische Fälle
 * @param additionalFields - Zusätzliche Felder, die gelöscht werden sollen
 */
export const useExtendedCacheUpdate = (additionalFields: string[] = []) => {
  return (cache: ApolloCache<any>) => {
    const fieldsToDelete = {
      hierarchy: (value: any, { DELETE }: any) => DELETE,
      search: (value: any, { DELETE }: any) => DELETE,
      findDictionaries: (value: any, { DELETE }: any) => DELETE,
      findItems: (value: any, { DELETE }: any) => DELETE,
    };

    // Zusätzliche Felder hinzufügen
    additionalFields.forEach(field => {
      fieldsToDelete[field] = (value: any, { DELETE }: any) => DELETE;
    });

    cache.modify({
      id: "ROOT_QUERY",
      fields: fieldsToDelete,
    });
  };
};
