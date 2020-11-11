import React, {useState} from "react";
import {
    Autocomplete,
    AutocompleteGetTagProps,
    AutocompleteProps,
    AutocompleteRenderOptionState
} from "@material-ui/lab";
import Checkbox from "@material-ui/core/Checkbox";
import {Entity, getEntityType} from "../domain";
import TextField, {TextFieldProps} from "@material-ui/core/TextField";
import {defaultFormFieldOptions} from "../hooks/useFormStyles";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import ConceptChip from "./ConceptChip";
import {SearchInput, SearchResultPropsFragment, useFindItemQuery} from "../generated/types";
import useDebounce from "../hooks/useDebounce";

const useStyles = makeStyles(theme => ({
    checkbox: {
        marginRight: theme.spacing(1)
    }
}));

export const toSearchBoxOptions = (results: SearchResultPropsFragment[]): SearchBoxOption[] => results
    .map((result): [typeof result, Entity | null] => {
        const {__typename, tags} = result;
        const entryType = __typename.substring(3);
        return [result, getEntityType(entryType, tags.map(tag => tag.id))];
    })
    .filter(([, entityType]) => entityType)
    .map(([{id, name, description}, entityType]) => ({
        domainEntityType: entityType!,
        id,
        name: name ?? id,
        description: description ?? undefined
    }));

const OptionIcon = <CheckBoxOutlineBlankIcon fontSize="small"/>;

const SelectedOptionIcon = <CheckBoxIcon fontSize="small"/>;

export type SearchBoxOption = {
    domainEntityType: Entity,
    id: string,
    name: string,
    description?: string
};

type CustomAutocompleteProps<Multiple extends boolean | undefined, DisableClearable extends boolean | undefined> =
    Omit<AutocompleteProps<SearchBoxOption, Multiple, DisableClearable, false>, 'disableClearable'>;

type SearchBoxProps<Multiple extends boolean | undefined, DisableClearable extends boolean | undefined> =
    {
        searchOptions: Partial<SearchInput>,
        TextFieldProps: Partial<TextFieldProps>
    }
    & Partial<CustomAutocompleteProps<Multiple, DisableClearable>>

export default function SearchBox<Multiple extends boolean | undefined, DisableClearable extends boolean | undefined>(props: SearchBoxProps<Multiple, DisableClearable>) {
    const {searchOptions, TextFieldProps, ...otherProps} = props;
    const classes = useStyles();
    const [inFocus, setInFocus] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const debouncedInputValue = useDebounce(inputValue, 500);
    const {data} = useFindItemQuery({
        skip: !inFocus,
        variables: {
            input: {
                ...searchOptions,
                query: debouncedInputValue
            }
        }
    });

    const results = data?.search.nodes ?? [];
    const options = toSearchBoxOptions(results);

    const getOptionLabel = (option: SearchBoxOption) => option.name;

    const getOptionSelected = (option: SearchBoxOption, value: SearchBoxOption) => option.id === value.id;

    const renderOption = (option: SearchBoxOption, {selected}: AutocompleteRenderOptionState) => (
        <React.Fragment>
            <Checkbox
                className={classes.checkbox}
                icon={OptionIcon}
                checkedIcon={SelectedOptionIcon}
                checked={selected}
            />
            {option.name}
        </React.Fragment>
    );

    const renderTag = ({domainEntityType, id, name, description}: SearchBoxOption, tagProps: object) => {
        debugger;
        return (
            <ConceptChip
                conceptType={domainEntityType}
                id={id}
                label={name}
                title={description}
                {...tagProps}
            />
        );
    };

    const renderTags = (values: SearchBoxOption[], getTagProps: AutocompleteGetTagProps) => (
        values
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((value, index) => renderTag(value, getTagProps({index})))
    );

    const onInputChange = (e: object, newInputValue: string) => setInputValue(newInputValue);

    return (
        <Autocomplete<SearchBoxOption, Multiple, DisableClearable, false>
            clearOnBlur
            clearOnEscape
            disableCloseOnSelect
            getOptionLabel={getOptionLabel}
            getOptionSelected={getOptionSelected}
            renderOption={renderOption}
            renderTags={renderTags}
            options={options}
            onInputChange={onInputChange}
            {...otherProps}
            renderInput={params => (
                <TextField
                    {...defaultFormFieldOptions}
                    {...params}
                    {...TextFieldProps}
                    InputProps={{
                        onFocus: () => setInFocus(true),
                        onBlur: () => setInFocus(false),
                        ...params.InputProps
                    }}
                />
            )}
        />
    );
};
