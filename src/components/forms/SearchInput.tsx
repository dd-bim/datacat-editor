import React, {FC} from "react";
import ClearIcon from '@material-ui/icons/Clear';
import TextField from "@material-ui/core/TextField";
import {InputAdornment} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from '@material-ui/icons/Search';

type SearchInputProps = {
    value: string,
    onChange(value: string): void
}

const SearchField: FC<SearchInputProps> = (props) => {
    const {
        value, onChange
    } = props;

    return (
        <TextField
            label="Suchen"
            value={value}
            fullWidth
            onChange={event => onChange(event.target.value)}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon/>
                    </InputAdornment>
                ),
                endAdornment: value && (
                    <InputAdornment position="end">
                        <IconButton size="small" onClick={() => onChange("")}>
                            <ClearIcon/>
                        </IconButton>
                    </InputAdornment>
                )
            }}
        />
    );
}

export default SearchField;
