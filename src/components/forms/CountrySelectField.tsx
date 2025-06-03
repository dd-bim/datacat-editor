import React, { FC, useState } from "react";
import { Autocomplete } from "@mui/material";
import { CountryDetailPropsFragment, Maybe, useFindCountriesQuery } from "../../generated/types";
import { TextField, TextFieldProps } from "@mui/material";
import { defaultFormFieldOptions } from "../../hooks/useFormStyles";
import CircularProgress from "@mui/material/CircularProgress";

type CountrySelectFieldProps = {
    filter?: string[],
    onChange(value: Maybe<CountryDetailPropsFragment>): void,
    TextFieldProps: TextFieldProps
}

const sortByName = ({ code: a }: CountryDetailPropsFragment, { code: b }: CountryDetailPropsFragment) => {
    return a.localeCompare(b);
};

const LanguageSelectField: FC<CountrySelectFieldProps> = (props) => {
    const {
        filter,
        onChange,
        TextFieldProps
    } = props;
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = useState('');
    const { loading, data, error } = useFindCountriesQuery({
        variables: {
            input: { query, pageSize: 500 }
        }
    });

    const options = (data?.findCountries?.nodes ?? []).filter(
        node => !filter?.includes(node.code)
    );
    options.sort(sortByName);

    return (
        <Autocomplete
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            onChange={(event, value) => onChange(value)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => `${option.name} (${option.code})`}
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
