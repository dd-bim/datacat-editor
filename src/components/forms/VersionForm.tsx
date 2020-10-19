import React, {FC, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import TextField from "@material-ui/core/TextField";
import {defaultFormFieldOptions} from "../../hooks/useFormStyles";
import {makeStyles} from "@material-ui/core/styles";
import InlineButtonGroup from "./InlineButtonGroup";
import {ClickAwayListener} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

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

type VersionFormValues = {
    versionId: string
    versionDate: string
}

type VersionFormProps = {
    defaultValues: VersionFormValues
    onSubmit(values: VersionFormValues): void
}

const VersionForm: FC<VersionFormProps> = (props) => {
    const {
        defaultValues,
        onSubmit
    } = props;
    const classes = useStyles();
    const [isEditMode, setIsEditMode] = useState(false);
    const {
        control,
        handleSubmit,
        errors,
        reset,
        formState
    } = useForm<VersionFormValues>({
        mode: "onChange",
        defaultValues
    });
    const {
        isDirty
    } = formState;

    const onEdit = () => {
        setIsEditMode(true);
    };

    const onReset = () => {
        reset(defaultValues);
        setIsEditMode(false);
    };

    const onSave = async (values: VersionFormValues) => {
        await onSubmit(values);
        setIsEditMode(false);
    };

    const onClickAway = () => {
        if (isEditMode && !isDirty) {
            onReset();
        }
    };

    return (
        <ClickAwayListener onClickAway={onClickAway}>
            <form className={classes.root} onSubmit={handleSubmit(onSave)}>
                <Controller
                    control={control}
                    id="versionId"
                    name="versionId"
                    label="ID"
                    error={!!errors.versionId}
                    InputProps={{
                        onFocus: !isEditMode ? onEdit : undefined
                    }}
                    as={<TextField {...defaultFormFieldOptions}/>}
                />
                <Typography variant="body1">/</Typography>
                <Controller
                    control={control}
                    id="versionDate"
                    name="versionDate"
                    label="Datum"
                    error={!!errors.versionDate}
                    InputProps={{
                        readOnly: !isEditMode,
                        onFocus: !isEditMode ? onEdit : undefined
                    }}
                    as={<TextField {...defaultFormFieldOptions}/>}
                />
                {isEditMode && <InlineButtonGroup formState={formState} onReset={onReset}/>}
            </form>
        </ClickAwayListener>
    );
}

export default VersionForm;
