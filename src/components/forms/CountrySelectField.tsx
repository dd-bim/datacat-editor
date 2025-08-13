import React, { FC, useState, useMemo, useCallback } from "react";
import { Autocomplete } from "@mui/material";
import { CountryDetailPropsFragment, Maybe, useFindCountriesQuery } from "../../generated/types";
import { TextField, TextFieldProps } from "@mui/material";
import { defaultFormFieldOptions } from "../../hooks/useFormStyles";
import CircularProgress from "@mui/material/CircularProgress";
import useDebounce from "../../hooks/useDebounce";

type CountrySelectFieldProps = {
    filter?: string[],
    onChange(value: Maybe<CountryDetailPropsFragment>): void,
    TextFieldProps: TextFieldProps,
    // Neue optionale Props für erweiterte Features
    preloadData?: boolean,
    showPopularCountries?: boolean,
    debounceDelay?: number,
    // Optionaler initialer Wert
    initialValue?: Maybe<CountryDetailPropsFragment>,
    // Optionales Deaktivieren des Auto-Default
    autoSelectDefault?: boolean
}

const sortByName = ({ code: a }: CountryDetailPropsFragment, { code: b }: CountryDetailPropsFragment) => {
    return a.localeCompare(b);
};

// Beliebte Länder für schnelleren Zugriff
const POPULAR_COUNTRY_CODES = ['DE', 'US', 'GB', 'FR', 'IT', 'ES', 'NL', 'AT', 'CH'];

const CountrySelectField: FC<CountrySelectFieldProps> = (props) => {
    const {
        filter,
        onChange,
        TextFieldProps,
        preloadData = true,
        showPopularCountries = false,
        debounceDelay = 300,
        initialValue = null,
        autoSelectDefault = true
    } = props;
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = useState('');
    
    // Debounce search query to reduce API calls
    const debouncedQuery = useDebounce(query, debounceDelay);
    
    // Preload query - lädt alle Länder beim ersten Laden
    const { 
        data: preloadData_result, 
        loading: preloadLoading 
    } = useFindCountriesQuery({
        variables: {
            input: { query: '', pageSize: 250 }
        },
        fetchPolicy: 'cache-first',
        skip: !preloadData,
        notifyOnNetworkStatusChange: false
    });

    // Search query - für gefilterte Suche
    const { 
        data: searchData, 
        loading: searchLoading 
    } = useFindCountriesQuery({
        variables: {
            input: { query: debouncedQuery, pageSize: 250 }
        },
        fetchPolicy: 'cache-first',
        nextFetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: false,
        skip: debouncedQuery.length > 0 && debouncedQuery.length < 2
    });

    // Bestimme welche Daten verwendet werden sollen
    const activeData = (debouncedQuery && debouncedQuery.length >= 2) ? searchData : preloadData_result;
    const loading = (debouncedQuery && debouncedQuery.length >= 2) ? searchLoading : preloadLoading;

    // Memoize options to prevent unnecessary re-renders
    const options = useMemo(() => {
        return [...(activeData?.findCountries?.nodes || [])].sort(sortByName);
    }, [activeData?.findCountries?.nodes]);
    
    // Find popular countries if enabled
    const popularCountries = useMemo(() => {
        if (!showPopularCountries) return [];
        return POPULAR_COUNTRY_CODES
            .map(code => options.find(country => country.code === code))
            .filter(Boolean) as CountryDetailPropsFragment[];
    }, [options, showPopularCountries]);
    
    // Group options: popular countries first, then all others
    const groupedOptions = useMemo(() => {
        if (!showPopularCountries || query.length > 0) {
            return options;
        }
        
        const otherCountries = options.filter(
            country => !popularCountries.some(popular => popular.id === country.id)
        );
        
        return [...popularCountries, ...otherCountries];
    }, [options, popularCountries, showPopularCountries, query]);
    
    // Find default country only when options change
    const defaultCountry = useMemo(() => {
        return options.find(opt => opt.code === "DE");
    }, [options]);

    const [selectedCountry, setSelectedCountry] = useState<Maybe<CountryDetailPropsFragment> | null>(initialValue);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);

    React.useEffect(() => {
        // Nur setzen wenn Auto-Default aktiviert ist, User noch nicht interagiert hat UND kein Land ausgewählt ist
        if (autoSelectDefault && !hasUserInteracted && !selectedCountry && defaultCountry) {
            setSelectedCountry(defaultCountry);
            onChange(defaultCountry);
        }
    }, [defaultCountry, selectedCountry, onChange, hasUserInteracted, autoSelectDefault]);

    // Memoize input change handler
    const handleInputChange = useCallback((event: any, value: string) => {
        if (value.length > 0) {
            setHasUserInteracted(true); // Auch bei Eingabe als Interaktion markieren
        }
        setQuery(value);
    }, []);

    // Memoize change handler
    const handleChange = useCallback((event: any, value: Maybe<CountryDetailPropsFragment>) => {
        setHasUserInteracted(true); // Markiere als User-Interaktion
        setSelectedCountry(value);
        onChange(value);
    }, [onChange]);

    return (
        <Autocomplete
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            value={selectedCountry}
            onChange={handleChange}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => `${option.name} (${option.code})`}
            onInputChange={handleInputChange}
            filterSelectedOptions={false}
            filterOptions={(options) => options} // Let backend handle filtering
            options={groupedOptions}
            loading={loading}
            // Performance optimizations
            disableListWrap
            blurOnSelect
            clearOnBlur
            handleHomeEndKeys
            // Group popular countries (if enabled and no search)
            groupBy={showPopularCountries && query.length === 0 ? (option) => {
                const isPopular = popularCountries.some(popular => popular.id === option.id);
                return isPopular ? 'Häufig verwendet' : 'Alle Länder';
            } : undefined}
            renderInput={(params) => (
                <TextField
                    {...params}
                    {...defaultFormFieldOptions}
                    {...TextFieldProps}
                    helperText={preloadData && preloadData_result ? 'Länder vorgeladen' : TextFieldProps.helperText}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
}

export default CountrySelectField;
