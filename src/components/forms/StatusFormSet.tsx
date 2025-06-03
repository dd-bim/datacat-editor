import FormSet, { FormSetDescription, FormSetTitle } from "./FormSet";
import React, { FC, useState } from "react";
import { useEffect } from "react";
import {
  useUpdateStatusMutation,
  StatusOfActivationEnum
} from "../../generated/types";
import { useSnackbar } from "notistack";
import { styled } from "@mui/material/styles";
import { T } from "@tolgee/react";
import { ClickAwayListener, MenuItem, Select, SelectChangeEvent, Box, Typography } from "@mui/material";
import InlineButtonGroup from "./InlineButtonGroup";
import { Controller, useForm } from "react-hook-form";

type StatusFormSetProps = {
  catalogEntryId: string;
  status: StatusOfActivationEnum;
};

type StatusFormValues = {
  selectedStatus: StatusOfActivationEnum;
};


const statusOptions = [
  { value: "XTD_ACTIVE", label: "Aktiv" },
  { value: "XTD_INACTIVE", label: "Inaktiv" }
];

// Replace makeStyles with styled component
const FormContainer = styled('form')(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  "& > *": {
    marginRight: theme.spacing(1),
  },
}));
const StatusFormSet: FC<StatusFormSetProps> = (props) => {
  const { catalogEntryId, status } = props;
  const { enqueueSnackbar } = useSnackbar();

  const [setStatusVersion] = useUpdateStatusMutation();
  const {
    control,
    reset
  } = useForm<StatusFormValues>({
    mode: "onChange",
    defaultValues: { selectedStatus: status },
  });

  useEffect(() => {
    reset({ selectedStatus: status });
  }, [status, reset]);

  const handleChange = async (
    e: SelectChangeEvent<StatusOfActivationEnum>,
    field: { onChange: (value: any) => void }
  ) => {
    field.onChange(e);
    await setStatusVersion({
      variables: {
        input: { catalogEntryId, status: e.target.value },
      },
    });
    enqueueSnackbar("Status aktualisiert.");
  };

  return (
    <FormSet>
      <FormContainer>
        <FormSetTitle sx={{ mr: 1 }}>
          <b>
            <T keyName="status.title" />
          </b>
        </FormSetTitle>
        <Controller
          name="selectedStatus"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              value={field.value}
              onChange={e => handleChange(e, field)}
              size="small"
              sx={{ minWidth: 120 }}
            >
              {statusOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          )}
        />
      </FormContainer>
    </FormSet>
  );
};

export default StatusFormSet;
