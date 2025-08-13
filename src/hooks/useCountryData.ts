import { useEffect, useMemo } from 'react';
import { useFindCountriesQuery, CountryDetailPropsFragment } from '../generated/types';

interface UseCountryDataProps {
    preload?: boolean;
    query?: string;
    enableDebounce?: boolean;
}

/**
 * Custom hook for country data with enhanced caching and preloading
 */
export const useCountryData = (props: UseCountryDataProps = {}) => {
    const { preload = true, query = '', enableDebounce = true } = props;

    // Preload all countries on app start for better UX
    const { 
        data: preloadData, 
        loading: preloadLoading,
        error: preloadError 
    } = useFindCountriesQuery({
        variables: {
            input: { query: '', pageSize: 250 }
        },
        fetchPolicy: 'cache-first',
        skip: !preload,
        notifyOnNetworkStatusChange: false
    });

    // Search-specific query
    const { 
        data: searchData, 
        loading: searchLoading,
        error: searchError 
    } = useFindCountriesQuery({
        variables: {
            input: { query, pageSize: 250 }
        },
        fetchPolicy: 'cache-first',
        skip: !query || query.length < 2,
        notifyOnNetworkStatusChange: false
    });

    // Determine which data to use
    const activeData = query && query.length >= 2 ? searchData : preloadData;
    const loading = query && query.length >= 2 ? searchLoading : preloadLoading;
    const error = query && query.length >= 2 ? searchError : preloadError;

    // Memoized sorted countries
    const countries = useMemo(() => {
        if (!activeData?.findCountries?.nodes) return [];
        
        return [...activeData.findCountries.nodes].sort((a, b) => 
            a.code.localeCompare(b.code)
        );
    }, [activeData?.findCountries?.nodes]);

    // Find default country (Germany)
    const defaultCountry = useMemo(() => {
        return countries.find(country => country.code === 'DE') || null;
    }, [countries]);

    // Find popular countries for quick access
    const popularCountries = useMemo(() => {
        const popularCodes = ['DE', 'US', 'GB', 'FR', 'IT', 'ES', 'NL', 'AT', 'CH'];
        return popularCodes
            .map(code => countries.find(country => country.code === code))
            .filter(Boolean) as CountryDetailPropsFragment[];
    }, [countries]);

    return {
        countries,
        defaultCountry,
        popularCountries,
        loading,
        error,
        isPreloaded: Boolean(preloadData?.findCountries?.nodes?.length)
    };
};

export default useCountryData;
