import React, { FC, useState } from "react";
import { Autocomplete } from "@mui/material";
import { useQuery } from "@apollo/client/react";
import { LanguagePropsFragment, Maybe, FindLanguagesDocument } from "../../generated/graphql";
import { TextField, TextFieldProps } from "@mui/material";
import { defaultFormFieldOptions } from "../../hooks/useFormStyles";
import CircularProgress from "@mui/material/CircularProgress";

type LanguageSelectFieldProps = {
    filter?: string[],
    multiple?: boolean,
    autoSelectGerman?: boolean, // Neuer Prop für automatische deutsche Auswahl
    onChange(value: Maybe<LanguagePropsFragment> | Maybe<LanguagePropsFragment[]>): void,
    TextFieldProps: TextFieldProps
}

const sortByName = ({ englishName: a }: LanguagePropsFragment, { englishName: b }: LanguagePropsFragment) => {
    return a.localeCompare(b);
};

const LanguageSelectField: FC<LanguageSelectFieldProps> = (props) => {
    const {
        filter,
        multiple,
        autoSelectGerman = false,
        onChange,
        TextFieldProps
    } = props;
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = useState('');
    const { loading, data, error } = useQuery(FindLanguagesDocument, {
        variables: {
            input: { query, pageSize: 500 }
        }
    });

    const options = (data?.findLanguages?.nodes ?? []).filter(
        node => !filter?.includes(node.code)
    );
    options.sort(sortByName);

    const defaultLanguage = options.find(opt => opt.code === "de");
    
    // Nur für Single-Select mit autoSelectGerman einen State verwenden
    const [selectedValue, setSelectedValue] = useState<Maybe<LanguagePropsFragment> | null>(null);
    const [hasAutoSelected, setHasAutoSelected] = useState(false);

    // Automatische deutsche Auswahl nur für Single-Select und wenn explizit gewünscht
    React.useEffect(() => {
        if (autoSelectGerman && !multiple && !hasAutoSelected && defaultLanguage && !loading && options.length > 0) {
            setSelectedValue(defaultLanguage);
            onChange(defaultLanguage);
            setHasAutoSelected(true);
        }
    }, [autoSelectGerman, multiple, hasAutoSelected, defaultLanguage, loading, options.length]);

    // Für Multiselect oder Felder ohne autoSelectGerman: direkter onChange ohne State
    if (multiple || !autoSelectGerman) {
        return (
            <Autocomplete
                multiple={!!multiple}
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                onChange={(event, newValue) => onChange(newValue)}
                isOptionEqualToValue={(option, value) => {
                    if (Array.isArray(value)) {
                        return false; // Sollte nicht passieren bei einzelnen Optionen
                    }
                    return option.id === value?.id;
                }}
                getOptionLabel={(option) => {
                    if (Array.isArray(option)) {
                        return ""; // Sollte nicht passieren
                    }
                    return `${option.nativeName} / ${option.englishName} (${option.code})`;
                }}
                onInputChange={(event, value) => setQuery(value)}
                filterSelectedOptions={false}
                filterOptions={(options) => options}
                options={options}
                loading={loading}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        {...defaultFormFieldOptions}
                        {...TextFieldProps}
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

    // Für Single-Select mit autoSelectGerman: State-managed
    return (
        <Autocomplete
            multiple={!!multiple}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            value={selectedValue}
            onChange={(event, newValue) => {
                setSelectedValue(newValue as Maybe<LanguagePropsFragment>);
                onChange(newValue);
            }}
            isOptionEqualToValue={(option, value) => {
                if (Array.isArray(value)) {
                    return false; // Sollte nicht passieren bei einzelnen Optionen
                }
                return option.id === value?.id;
            }}
            getOptionLabel={(option) => {
                if (Array.isArray(option)) {
                    return ""; // Sollte nicht passieren
                }
                return `${option.nativeName} / ${option.englishName} (${option.code})`;
            }}
            onInputChange={(event, value) => setQuery(value)}
            filterSelectedOptions={false}
            filterOptions={(options) => options}
            options={options}
            loading={loading}
            renderInput={(params) => (
                <TextField
                    {...params}
                    {...defaultFormFieldOptions}
                    {...TextFieldProps}
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

export default LanguageSelectField;
