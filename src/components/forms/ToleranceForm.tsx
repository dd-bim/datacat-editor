import React, { FC } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { TextField, ClickAwayListener, Box, Button, MenuItem } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ToleranceType } from '../../generated/types';
import { T } from '@tolgee/react';

const useStyles = makeStyles((theme: { spacing: (value: number) => number }) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
  },
  selectField: {
    minWidth: 150, // Increased from 120px to ensure "Type" is always readable
    '& .MuiInputBase-root': {
      width: 'auto',
    },
    '& .MuiSelect-select': {
      minWidth: 80, // Ensures content area has minimum width
    },
  },
  inputField: {
    minWidth: 150,
  },
  buttonsContainer: {
    display: 'flex',
    gap: theme.spacing(2),
    marginLeft: theme.spacing(1),
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
              className={classes.selectField}
              label={<T keyName="tolerance_form.type_label">Typ</T>}
              InputProps={{
                onFocus: !isEditMode ? handleOnEdit : undefined,
              }}
              select
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    style: { maxHeight: 300 }
                  }
                }
              }}
            >
              {Object.values(ToleranceType).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        
        <Controller
          name="lowerTolerance"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className={classes.inputField}
              label={<T keyName="tolerance_form.lower_tolerance_label">Untere Toleranz</T>}
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
              className={classes.inputField}
              label={<T keyName="tolerance_form.upper_tolerance_label">Obere Toleranz</T>}
              InputProps={{
                onFocus: !isEditMode ? handleOnEdit : undefined,
              }}
            />
          )}
        />
        
        <Box className={classes.buttonsContainer}>
          <Button type="submit" variant="contained" color="primary">
            <T keyName="tolerance_form.save_button">Save</T>
          </Button>
          
          <Button type="button" variant="outlined" color="error" onClick={handleOnDelete}>
            <T keyName="tolerance_form.delete_button">Delete</T>
          </Button>
          
          <Button type="button" variant="outlined" onClick={handleOnReset}>
            <T keyName="tolerance_form.reset_button">Reset</T>
          </Button>
        </Box>
      </form>
    </ClickAwayListener>
  );
};

export default ToleranceForm;