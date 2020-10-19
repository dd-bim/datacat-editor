import React, {FC} from "react";
import CancelIcon from '@material-ui/icons/Cancel';
import TextField from "@material-ui/core/TextField";
import {InputAdornment} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";

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
                endAdornment: value && (
                    <InputAdornment position="end">
                        <IconButton onClick={() => onChange("")}>
                            <CancelIcon/>
                        </IconButton>
                    </InputAdornment>
                )
            }}
        />
    );
}

export default SearchField;
