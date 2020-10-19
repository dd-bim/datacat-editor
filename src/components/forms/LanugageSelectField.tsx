import React, {FC, useState} from "react";
import {Autocomplete} from "@material-ui/lab";
import {LanguageFilterInput, LanguagePropsFragment, Maybe, useFindLanguagesQuery} from "../../generated/types";
import {TextField, TextFieldProps} from "@material-ui/core";
import {defaultFormFieldOptions} from "../../hooks/useFormStyles";
import CircularProgress from "@material-ui/core/CircularProgress";

type LanguageSelectFieldProps = {
    filter?: LanguageFilterInput,
    onChange(value: Maybe<LanguagePropsFragment>): void,
    TextFieldProps: TextFieldProps
}

const LanguageSelectField: FC<LanguageSelectFieldProps> = (props) => {
    const {
        filter,
        onChange,
        TextFieldProps
    } = props;
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = useState('');
    const {loading, data} = useFindLanguagesQuery({
        variables: {
            input: {query, ...filter}
        }
    });
    const options = data?.languages?.nodes ?? [];

    return (
        <Autocomplete
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            onChange={(event, value) => onChange(value)}
            getOptionSelected={(option, value) => option.id === value.id}
            getOptionLabel={(option) => `${option.displayLanguage} / ${option.displayCountry} (${option.languageTag})`}
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
                                {loading ? <CircularProgress color="inherit" size={20}/> : null}
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
