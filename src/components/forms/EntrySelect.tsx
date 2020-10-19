import React, {FC, useMemo} from "react";
import Checkbox from "@material-ui/core/Checkbox";
import TextField, {TextFieldProps} from "@material-ui/core/TextField";
import {Autocomplete, AutocompleteProps} from "@material-ui/lab";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {defaultFormFieldOptions} from "../../hooks/useFormStyles";
import {Maybe, TagPropsFragment} from "../../generated/types";
import {Chip} from "@material-ui/core";
import {getEntityType} from "../../domain";
import {useHistory} from "react-router-dom";

export type EntrySelectOption = {
    typeName: string,
    id: string,
    name?: Maybe<string>,
    tags?: Maybe<TagPropsFragment[]>,
}

type EntrySelectProps = {
    options: EntrySelectOption[],
    InputProps: Pick<TextFieldProps, "name" | "label" | "helperText" | "error">
} & Partial<AutocompleteProps<EntrySelectOption, true, true, true>>

const useStyles = makeStyles(theme => ({
    checkbox: {
        marginRight: theme.spacing(1)
    }
}));

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;

export const EntrySelect: FC<EntrySelectProps> = (props) => {
    const {
        options,
        InputProps,
        ...otherProps
    } = props;
    const history = useHistory();
    const classes = useStyles();

    const chips = useMemo(() => {
        return options
            .map(option => ({
                ...option, name: option.name ?? option.id
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [options]);

    console.log(chips);

    return (
        <Autocomplete<EntrySelectOption, true, true, true>
            {...otherProps}
            multiple
            freeSolo
            clearOnBlur
            clearOnEscape
            disableCloseOnSelect
            options={chips}
            getOptionLabel={(option) => option.name ?? option.id}
            getOptionSelected={(option, value) => option.id === value.id}
            renderOption={(option, {selected}) => (
                <React.Fragment>
                    <Checkbox
                        className={classes.checkbox}
                        icon={icon}
                        checkedIcon={checkedIcon}
                        checked={selected}
                    />
                    {option.name}
                </React.Fragment>
            )}
            renderTags={(value, getTagProps) => value.map((option, index) => {
                const entityType = getEntityType(option.typeName.substring(3), option.tags?.map(x => x.id));
                if (entityType) {
                    return (
                        <Chip
                            avatar={<entityType.Icon/>}
                            variant="outlined"
                            label={option.name}
                            clickable
                            onClick={() => history.push(`/${entityType.path}/${option.id}`)}
                            size="small"
                            {...getTagProps({index})}
                        />
                    );
                }
                return (
                    <Chip
                        variant="outlined"
                        label={option.name}
                        size="small"
                        {...getTagProps({index})}
                    />
                );
            })}
            renderInput={params => (
                <TextField
                    {...defaultFormFieldOptions}
                    {...params}
                    {...InputProps}
                    InputProps={params.InputProps}
                />
            )}
        />
    );
}

export default EntrySelect;
