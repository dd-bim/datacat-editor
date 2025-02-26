import React, { FC } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { TextField, ClickAwayListener } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ToleranceType } from '../../generated/types';

const useStyles = makeStyles((theme: { spacing: (value: number) => number }) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    '& > *': {
      marginRight: theme.spacing(1),
    },
  },
}));

export type ToleranceFormValues = {
  toleranceType: ToleranceType;
  lowerTolerance: string;
  upperTolerance: string;
};

export type ToleranceDefaultFormValues = {
  toleranceType: ToleranceType | '';
  lowerTolerance: string;
  upperTolerance: string;
};

type ToleranceFormProps = {
  defaultValues: ToleranceDefaultFormValues;
  onSubmit(values: ToleranceFormValues): Promise<void>;
  onDelete(): Promise<void>;
};

const ToleranceForm: FC<ToleranceFormProps> = ({ defaultValues, onSubmit, onDelete }) => {
  const classes = useStyles();
  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<ToleranceDefaultFormValues>({ defaultValues });
  const [isEditMode, setIsEditMode] = React.useState(false);

  const handleOnEdit = () => {
    setIsEditMode(true);
  };

  const handleOnReset = () => {
    setIsEditMode(false);
    reset(defaultValues);
  };

  const handleOnDelete = async () => {
    await onDelete();
    setIsEditMode(false);
    reset(defaultValues);
  };

  const handleOnSave: SubmitHandler<ToleranceDefaultFormValues> = async (values) => {
    await onSubmit(values as ToleranceFormValues);
    setIsEditMode(false);
  };

  const handleOnClickAway = () => {
    if (isEditMode && !isDirty) {
      handleOnReset();
    }
  };

  return (
    <ClickAwayListener onClickAway={handleOnClickAway}>
      <form className={classes.root} onSubmit={handleSubmit(handleOnSave)}>
        <Controller
          name="toleranceType"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Typ"
              InputProps={{
                onFocus: !isEditMode ? handleOnEdit : undefined,
              }}
              select
            />
          )}
        />
        <Controller
          name="lowerTolerance"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Untere Toleranz"
              InputProps={{
                onFocus: !isEditMode ? handleOnEdit : undefined,
              }}
            />
          )}
        />
        <Controller
          name="upperTolerance"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Obere Toleranz"
              InputProps={{
                onFocus: !isEditMode ? handleOnEdit : undefined,
              }}
            />
          )}
        />
        <button type="submit">Save</button>
        <button type="button" onClick={handleOnDelete}>Delete</button>
        <button type="button" onClick={handleOnReset}>Reset</button>
      </form>
    </ClickAwayListener>
  );
};

export default ToleranceForm;