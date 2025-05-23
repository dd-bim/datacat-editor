import React, { FC, useState } from "react";
import { Autocomplete } from "@mui/material";
import { LanguagePropsFragment, Maybe, useFindLanguagesQuery } from "../../generated/types";
import { TextField, TextFieldProps } from "@mui/material";
import { defaultFormFieldOptions } from "../../hooks/useFormStyles";
import CircularProgress from "@mui/material/CircularProgress";

type LanguageSelectFieldProps = {
    filter?: string[],
    onChange(value: Maybe<LanguagePropsFragment>): void,
    TextFieldProps: TextFieldProps
}

const sortByName = ({englishName: a}: LanguagePropsFragment, {englishName: b}: LanguagePropsFragment) => {
    return a.localeCompare(b);
};

const LanguageSelectField: FC<LanguageSelectFieldProps> = (props) => {
    const {
        filter,
        onChange,
        TextFieldProps
    } = props;
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = useState('');
    const { loading, data, error } = useFindLanguagesQuery({
        variables: {
            input: { query, pageSize: 500 }
        }
    });

    const options = (data?.findLanguages?.nodes ?? []).filter(
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
            getOptionLabel={(option) => `${option.nativeName} / ${option.englishName} (${option.code})`}
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
