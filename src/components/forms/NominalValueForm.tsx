import React, { FC, useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { TextField, ClickAwayListener } from '@mui/material';
import { makeStyles } from '@mui/styles';
import InlineButtonGroup from './InlineButtonGroup';
import { ValueRole, ValueType } from '../../generated/types';
import { T } from '@tolgee/react';

const useStyles = makeStyles((theme: { spacing: (value: number) => number }) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

export type NominalValueFormValues = {
  valueRole: ValueRole;
  valueType: ValueType;
  nominalValue: string;
};

export type NominalValueDefaultFormValues = {
  valueRole: ValueRole | "";
  valueType: ValueType | "";
  nominalValue: string;
};

type NominalValueFormProps = {
  defaultValues: NominalValueDefaultFormValues;
  onSubmit(values: NominalValueFormValues): void;
  onDelete(): void;
};

const NominalValueForm: FC<NominalValueFormProps> = (props) => {
  const { defaultValues, onSubmit, onDelete } = props;
  const classes = useStyles();
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    formState,
  } = useForm<NominalValueDefaultFormValues>({
    mode: "onChange",
    defaultValues,
  });

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
  };

  // Submit-Handler, der die empfangenen Daten validiert und transformiert
  const handleOnSave: SubmitHandler<NominalValueDefaultFormValues> = async (data) => {
    // Überprüfen, ob valueRole und valueType gültige Werte haben
    if (data.valueRole === "" || data.valueType === "") {
      console.error("valueRole und valueType müssen ausgewählt werden.");
      return;
    }

    // Transformation in den erwarteten Typ
    const validValues: NominalValueFormValues = {
      valueRole: data.valueRole,
      valueType: data.valueType,
      nominalValue: data.nominalValue,
    };

    await onSubmit(validValues);
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
          name="valueRole"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              label={<T keyName="nominal_value_form.role_label">Rolle</T>}
              InputProps={{
                onFocus: !isEditMode ? handleOnEdit : undefined,
              }}
              select
              SelectProps={{ native: true }}
              error={!!errors.valueRole}
            >
              <option value="" />
              {Object.values(ValueRole).map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="valueType"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              label={<T keyName="nominal_value_form.type_label">Datentyp</T>}
              InputProps={{
                onFocus: !isEditMode ? handleOnEdit : undefined,
              }}
              select
              SelectProps={{ native: true }}
              error={!!errors.valueType}
            >
              <option value="" />
              {Object.values(ValueType).map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="nominalValue"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={<T keyName="nominal_value_form.value_label">Wert</T>}
              error={!!errors.nominalValue}
              InputProps={{
                onFocus: !isEditMode ? handleOnEdit : undefined,
              }}
            />
          )}
        />
        {isEditMode && (
          <InlineButtonGroup
            formState={formState}
            onDelete={handleOnDelete}
            onReset={handleOnReset}
          />
        )}
      </form>
    </ClickAwayListener>
  );
};

export default NominalValueForm;
