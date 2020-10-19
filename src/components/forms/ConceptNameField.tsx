import React, {useRef, useState} from "react";
import {InputAdornment, TextField, TextFieldProps} from "@material-ui/core";
import Popper from "@material-ui/core/Popper";
import Fade from "@material-ui/core/Fade";
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import IconButton from "@material-ui/core/IconButton";
import {Controller, FieldValues, useFormContext} from "react-hook-form";
import {Maybe} from "../../generated/types";

type ConceptNameFieldProps<TFieldValues extends FieldValues> = {
    id: string,
    name: keyof TFieldValues,
    errorText?: React.ReactNode
    dupes: { id: string, name?: Maybe<string> }[],
} & TextFieldProps

function ConceptNameField<TFieldValues extends FieldValues>(props: ConceptNameFieldProps<TFieldValues>) {
    const {
        id,
        name,
        helperText,
        errorText,
        dupes,
        onChange,
        onFocus,
        onBlur,
        required,
        ...otherProps
    } = props;
    const {errors} = useFormContext<TFieldValues>();
    const buttonRef = useRef(null);
    const [open, setOpen] = useState<boolean>(false);

    const inputAdornment = (
        <InputAdornment position="end">
            <IconButton
                ref={buttonRef}
                onClick={() => setOpen(true)}
                disabled={!dupes.length}
            >
                {dupes.length
                    ? (<ErrorIcon color="error"/>)
                    : (<CheckCircleIcon color="primary"/>)
                }
            </IconButton>
        </InputAdornment>
    );

    const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        onChange?.(e);
    }

    const handleOnFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setOpen(true);
        onFocus?.(e);
    }

    const handleOnBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setOpen(false);
        onBlur?.(e);
    }

    const handleOnClickAway = () => setOpen(false);

    return (
        <React.Fragment>
            <Controller
                name={name}
                rules={{required}}
                render={(({name, value, onChange, onBlur}) => (
                    <ClickAwayListener onClickAway={handleOnClickAway}>
                        <TextField
                            {...otherProps}
                            id={id}
                            name={name}
                            value={value}
                            required
                            error={!!errors[name]}
                            helperText={errors[name] ? errorText || helperText : helperText}
                            onChange={e => {
                                onChange(e.target.value);
                                handleOnChange(e);
                            }}
                            onFocus={handleOnFocus}
                            onBlur={e => {
                                onBlur();
                                handleOnBlur(e);
                            }}
                            InputProps={{endAdornment: inputAdornment}}
                        />
                    </ClickAwayListener>
                ))}

            />
            <Popper id={id} open={!!dupes.length && open} anchorEl={buttonRef.current} transition>
                {({TransitionProps}) => (
                    <Fade {...TransitionProps}>
                        <Paper>
                            <List component="div" dense disablePadding>
                                <ListSubheader disableSticky>
                                    Mögliche Duplikate
                                </ListSubheader>
                                {dupes.map(dupe => (
                                    <ListItem key={dupe.id} dense disabled>
                                        <ListItemText primary={dupe.name} secondary={dupe.id}/>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Fade>
                )}
            </Popper>
        </React.Fragment>
    )
}

export default ConceptNameField;
