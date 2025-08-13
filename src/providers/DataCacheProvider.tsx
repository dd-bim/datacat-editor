import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useFindCountriesQuery, useFindLanguagesQuery } from '../generated/types';

interface DataCacheContextValue {
    countries: {
        isLoaded: boolean;
        isLoading: boolean;
        error?: any;
    };
    languages: {
        isLoaded: boolean;
        isLoading: boolean;
        error?: any;
    };
    preloadAll: () => void;
    clearCache: () => void;
}

const DataCacheContext = createContext<DataCacheContextValue | undefined>(undefined);

interface DataCacheProviderProps {
    children: ReactNode;
    autoPreload?: boolean;
}

/**
 * Provider that preloads commonly used data for better performance
 */
export const DataCacheProvider: React.FC<DataCacheProviderProps> = ({ 
    children, 
    autoPreload = true 
}) => {
    const [preloadTrigger, setPreloadTrigger] = useState(autoPreload);

    // Preload countries
    const { 
        data: countriesData, 
        loading: countriesLoading, 
        error: countriesError 
    } = useFindCountriesQuery({
        variables: {
            input: { query: '', pageSize: 250 }
        },
        fetchPolicy: 'cache-first',
        skip: !preloadTrigger,
        notifyOnNetworkStatusChange: false
    });

    // Preload languages
    const { 
        data: languagesData, 
        loading: languagesLoading, 
        error: languagesError 
    } = useFindLanguagesQuery({
        variables: {
            input: { query: '', pageSize: 100 }
        },
        fetchPolicy: 'cache-first',
        skip: !preloadTrigger,
        notifyOnNetworkStatusChange: false
    });

    const preloadAll = () => {
        setPreloadTrigger(true);
    };

    const clearCache = () => {
        // This would need Apollo Client instance to clear specific cache entries
        console.log('Cache clearing would be implemented here');
    };

    const contextValue: DataCacheContextValue = {
        countries: {
            isLoaded: Boolean(countriesData?.findCountries?.nodes?.length),
            isLoading: countriesLoading,
            error: countriesError
        },
        languages: {
            isLoaded: Boolean(languagesData?.findLanguages?.nodes?.length),
            isLoading: languagesLoading,
            error: languagesError
        },
        preloadAll,
        clearCache
    };

    return (
        <DataCacheContext.Provider value={contextValue}>
            {children}
        </DataCacheContext.Provider>
    );
};

export const useDataCache = (): DataCacheContextValue => {
    const context = useContext(DataCacheContext);
    if (!context) {
        throw new Error('useDataCache must be used within a DataCacheProvider');
    }
    return context;
};

export default DataCacheProvider;
