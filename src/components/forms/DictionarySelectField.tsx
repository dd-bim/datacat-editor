import React, { FC, useState } from "react";
import { Autocomplete } from "@mui/material";
import { DictionaryPropsFragment, Maybe, useFindDictionariesQuery } from "../../generated/types";
import { TextField, TextFieldProps } from "@mui/material";
import { defaultFormFieldOptions } from "../../hooks/useFormStyles";
import CircularProgress from "@mui/material/CircularProgress";

type DictionarySelectFieldProps = {
    onChange(value: Maybe<DictionaryPropsFragment>): void,
    TextFieldProps: TextFieldProps
}

// const sortByName = ({ name: a }: DictionaryPropsFragment, { name: b }: DictionaryPropsFragment) => {
//     return a.localeCompare(b);
// };

const DictionarySelectField: FC<DictionarySelectFieldProps> = (props) => {
    const {
        onChange,
        TextFieldProps
    } = props;
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = useState('');
    const { loading, data, error } = useFindDictionariesQuery({
        fetchPolicy: "cache-and-network",
        variables: {
            input: { query, pageSize: 500 }
        }
    });

    const options = data?.findDictionaries?.nodes ?? [];
    // options.sort(sortByName);

    const defaultDictionary = options[0];

    const [selectedDictionary, setSelectedDictionary] = useState<Maybe<DictionaryPropsFragment> | null>(null);

    React.useEffect(() => {
        if (!selectedDictionary && defaultDictionary) {
            setSelectedDictionary(defaultDictionary);
            onChange(defaultDictionary);
        }
    }, [defaultDictionary]);

    return (
        <Autocomplete
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            value={selectedDictionary}
            onChange={(event, value) => onChange(value)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => {
                const deText = option.name.texts?.find(t => t.language.code === "de");
                return deText?.text || option.name.texts?.[0]?.text || option.id;
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

export default DictionarySelectField;
