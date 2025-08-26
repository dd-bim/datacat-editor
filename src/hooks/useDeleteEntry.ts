import { useDeleteEntryMutation } from '../generated/types';
import { ApolloCache } from '@apollo/client';

interface UseDeleteEntryOptions {
  /** The GraphQL typename and ID for the cache entry to evict (e.g., 'XtdSubject', 'XtdProperty') */
  cacheTypename: string;
  /** The ID of the entry to delete */
  id: string;
  /** Additional cache fields to invalidate beyond the default 'hierarchy' and 'search' */
  additionalFields?: string[];
}

/**
 * Custom hook that provides a delete mutation with standardized cache cleanup.
 * This eliminates the repetitive cache.evict and cache.modify logic across all forms.
 */
export const useDeleteEntry = ({ cacheTypename, id, additionalFields = [] }: UseDeleteEntryOptions) => {
  const [deleteEntryMutation, mutationResult] = useDeleteEntryMutation({
    update: (cache: ApolloCache) => {
      // Evict the specific entry from the cache
      cache.evict({ id: `${cacheTypename}:${id}` });
      
      // Standard fields that need to be invalidated after deletion
      const fieldsToInvalidate = ['hierarchy', 'search', ...additionalFields];
      
      // Invalidate all specified fields in ROOT_QUERY
      fieldsToInvalidate.forEach(field => {
        cache.modify({
          id: "ROOT_QUERY",
          fields: {
            [field]: (_value: any, { DELETE }: any) => DELETE,
          },
        });
      });
    },
  });

  return [deleteEntryMutation, mutationResult] as const;
};
