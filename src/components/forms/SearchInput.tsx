import React, {FC} from "react";
import ClearIcon from '@mui/icons-material/Clear';
import TextField from "@mui/material/TextField";
import {InputAdornment} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import SearchIcon from '@mui/icons-material/Search';

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
