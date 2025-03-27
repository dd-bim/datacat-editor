import React, { FC, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import { defaultFormFieldOptions } from "../../hooks/useFormStyles";
import { makeStyles } from "@mui/styles";
import InlineButtonGroup from "./InlineButtonGroup";
import { ClickAwayListener } from "@mui/material";
import Typography from "@mui/material/Typography";
import { Theme } from "@mui/material/styles";
import { T } from "@tolgee/react";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    "& > *": {
      marginRight: theme.spacing(1),
    },
  },
}));

type VersionFormValues = {
  versionId: string;
  versionDate: string;
};

type VersionFormProps = {
  defaultValues: VersionFormValues;
  onSubmit(values: VersionFormValues): void;
};

const VersionForm: FC<VersionFormProps> = (props) => {
  const { defaultValues, onSubmit } = props;
  const classes = useStyles();
  const [isEditMode, setIsEditMode] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    formState,
  } = useForm<VersionFormValues>({
    mode: "onChange",
    defaultValues,
  });
  const { isDirty } = formState;

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
          name="versionId"
          rules={{ required: true }} // Falls eine Validierung nötig ist
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              id="versionId" // ✅ Hier setzen
              label="ID"
              error={!!fieldState.error}
              fullWidth
              InputProps={{
                onFocus: !isEditMode ? onEdit : undefined,
              }}
              {...defaultFormFieldOptions}
            />
          )}
        />
        <Typography variant="body1">/</Typography>
        <Controller
          control={control}
          name="versionDate"
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              id="versionDate" // ✅ Hier setzen
              label=<T keyName="version.date" />
              error={!!fieldState.error}
              fullWidth
              InputProps={{
                readOnly: !isEditMode,
                onFocus: !isEditMode ? onEdit : undefined,
              }}
              {...defaultFormFieldOptions}
            />
          )}
        />
        {isEditMode && (
          <InlineButtonGroup formState={formState} onReset={onReset} />
        )}
      </form>
    </ClickAwayListener>
  );
};

export default VersionForm;
