import React, {FC, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import TextField from "@material-ui/core/TextField";
import {defaultFormFieldOptions} from "../../hooks/useFormStyles";
import {makeStyles} from "@material-ui/core/styles";
import InlineButtonGroup from "./InlineButtonGroup";
import {ClickAwayListener} from "@material-ui/core";
import {ToleranceType} from "../../generated/types";

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

export type ToleranceFormValues = {
    toleranceType: ToleranceType
    lowerTolerance: string
    upperTolerance: string
}

export type ToleranceDefaultFormValues = {
    toleranceType: ToleranceType | ""
    lowerTolerance: string
    upperTolerance: string
}

type ToleranceFormProps = {
    defaultValues: ToleranceDefaultFormValues
    onSubmit(values: ToleranceFormValues): void
    onDelete(): void
}

const ToleranceForm: FC<ToleranceFormProps> = (props) => {
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
    } = useForm<ToleranceDefaultFormValues>({
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

    const HandleOnSave = async (values: ToleranceFormValues) => {
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
                    id="toleranceType"
                    name="toleranceType"
                    label="Typ"
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
                            <option value={ToleranceType.Percentage}>Prozentualer Wert</option>
                            <option value={ToleranceType.Realvalue}>Reeler Wert</option>
                        </TextField>
                    }
                    control={control}
                    rules={{required: true}}
                />
                <Controller
                    control={control}
                    id="lowerTolerance"
                    name="lowerTolerance"
                    label="Untere Schwelle"
                    error={!!errors.lowerTolerance}
                    InputProps={{
                        onFocus: !isEditMode ? handleOnEdit : undefined
                    }}
                    as={<TextField {...defaultFormFieldOptions}/>}
                />
                <Controller
                    control={control}
                    id="upperTolerance"
                    name="upperTolerance"
                    label="Obere Schwelle"
                    error={!!errors.upperTolerance}
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

export default ToleranceForm;
