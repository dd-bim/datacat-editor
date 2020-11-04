import React, {FC, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import TextField from "@material-ui/core/TextField";
import {defaultFormFieldOptions} from "../../hooks/useFormStyles";
import {makeStyles} from "@material-ui/core/styles";
import InlineButtonGroup from "./InlineButtonGroup";
import {ClickAwayListener} from "@material-ui/core";
import {ValueRole, ValueType} from "../../generated/types";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        "& > *": {
            marginRight: theme.spacing(1)
        }
    }
}));

export type NominalValueFormValues = {
    valueRole: ValueRole
    valueType: ValueType
    nominalValue: string
}

export type NominalValueDefaultFormValues = {
    valueRole: ValueRole | ""
    valueType: ValueType | ""
    nominalValue: string
}

type NominalValueFormProps = {
    defaultValues: NominalValueDefaultFormValues
    onSubmit(values: NominalValueFormValues): void
    onDelete(): void
}

const NominalValueForm: FC<NominalValueFormProps> = (props) => {
    const {
        defaultValues,
        onSubmit,
        onDelete
    } = props;
    const classes = useStyles();
    const [isEditMode, setIsEditMode] = useState(false);
    const {
        control,
        handleSubmit,
        errors,
        reset,
        formState
    } = useForm<NominalValueDefaultFormValues>({
        mode: "onChange",
        defaultValues
    });
    const {
        isDirty
    } = formState;

    const handleOnEdit = () => {
        setIsEditMode(true);
    };

    const handleOnReset = () => {
        reset(defaultValues);
        setIsEditMode(false);
    };

    const handleOnDelete = async () => {
        await onDelete();
        setIsEditMode(false);
        reset(defaultValues);
    }

    const HandleOnSave = async (values: NominalValueFormValues) => {
        await onSubmit(values);
        setIsEditMode(false);
    };

    const handleOnClickAway = () => {
        if (isEditMode && !isDirty) {
            handleOnReset();
        }
    };

    return (
        <ClickAwayListener onClickAway={handleOnClickAway}>
            <form className={classes.root} onSubmit={handleSubmit(HandleOnSave)}>
                <Controller
                    id="valueRole"
                    name="valueRole"
                    label="Rolle"
                    InputProps={{
                        onFocus: !isEditMode ? handleOnEdit : undefined
                    }}
                    as={
                        <TextField
                            {...defaultFormFieldOptions}
                            select
                            SelectProps={{native: true}}
                        >
                            <option value=""/>
                            {Object.values(ValueRole).map(x => (
                                <option key={x} value={x}>{x}</option>
                            ))}
                        </TextField>
                    }
                    control={control}
                    rules={{required: true}}
                />
                <Controller
                    id="valueType"
                    name="valueType"
                    label="Datentyp"
                    InputProps={{
                        onFocus: !isEditMode ? handleOnEdit : undefined
                    }}
                    as={
                        <TextField
                            {...defaultFormFieldOptions}
                            select
                            SelectProps={{native: true}}
                        >
                            <option value=""/>
                            {Object.values(ValueType).map(x => (
                                <option key={x} value={x}>{x}</option>
                            ))}
                        </TextField>
                    }
                    control={control}
                    rules={{required: true}}
                />
                <Controller
                    control={control}
                    id="nominalValue"
                    name="nominalValue"
                    label="Wert"
                    error={!!errors.nominalValue}
                    InputProps={{
                        onFocus: !isEditMode ? handleOnEdit : undefined
                    }}
                    as={<TextField {...defaultFormFieldOptions}/>}
                />
                {isEditMode && (
                    <InlineButtonGroup
                        formState={formState}
                        onDelete={handleOnDelete}
                        onReset={handleOnReset}/>
                )}
            </form>
        </ClickAwayListener>
    );
}

export default NominalValueForm;
